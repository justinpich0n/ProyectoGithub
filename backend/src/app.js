const express = require('express');
const cors = require('cors');
const { verificarConexion } = require('./db');

const app = express();
// Railway termina HTTPS en su proxy; habilitar únicamente al desplegar detrás de él.
if (process.env.TRUST_PROXY_HOPS === '1') app.set('trust proxy', 1);

const origenFrontend = process.env.FRONTEND_ORIGIN || 'http://127.0.0.1:5173';
const origenesPermitidos = new Set([origenFrontend]);
if (['http://127.0.0.1:5173', 'http://localhost:5173'].includes(origenFrontend)) {
  origenesPermitidos.add('http://127.0.0.1:5173');
  origenesPermitidos.add('http://localhost:5173');
}
app.use(cors({ origin: (origen, callback) => callback(null, !origen || origenesPermitidos.has(origen)) }));
app.use(express.json());

// El estado se consulta en MySQL en cada petición; no se guarda como una bandera.
app.get('/api/health', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  if (!app.locals.pool) {
    return res.status(503).json({
      mensaje: 'La conexión a MySQL está deshabilitada.',
      sistema: 'BizzStock',
      baseDeDatos: 'deshabilitada',
    });
  }

  try {
    await verificarConexion(app.locals.pool);
    return res.json({
      mensaje: 'El servidor y la base de datos están funcionando',
      sistema: 'BizzStock',
      baseDeDatos: 'conectada',
    });
  } catch {
    return res.status(503).json({
      mensaje: 'No se pudo consultar la base de datos.',
      sistema: 'BizzStock',
      baseDeDatos: 'no disponible',
    });
  }
});

// En despliegue, React y API comparten dominio. No se sirve el repositorio ni .env.
if (process.env.SERVE_FRONTEND === 'true') {
  const path = require('node:path');
  const fs = require('node:fs');
  const carpeta = path.resolve(__dirname, '../../frontend/dist');
  if (!fs.existsSync(path.join(carpeta, 'index.html'))) throw new Error('Falta compilar el frontend para el despliegue.');
  app.use(express.static(carpeta, { index: false, dotfiles: 'deny' }));
  app.get(/^(?!\/api(?:\/|$)).*/i, (req, res) => {
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(carpeta, 'index.html'));
  });
}

// Express 5 envía los errores de controladores async a este manejador.
function exigirModelos(req, res, next) {
  if (!app.locals.modelos)
    return res
      .status(503)
      .json({
        error:
          'El CRUD no está disponible. Comprueba MySQL y reinicia el backend.',
      });
  next();
}
const { autenticar, administrador, personal } = require('./auth/seguridad');
app.use('/api/cuentas', exigirModelos, autenticar, administrador, require('./routes/cuenta.routes'));
app.use('/api/ventas', exigirModelos, autenticar, personal, require('./routes/venta.routes'));
app.use('/api/solicitudes', exigirModelos, require('./routes/solicitud.routes'));
app.use('/api/inicio', exigirModelos, require('./routes/inicio.routes'));
app.use('/api/auth', exigirModelos, require('./routes/auth.routes'));
app.use('/api/clientes', exigirModelos, autenticar, administrador, require('./routes/cliente.routes'));
app.use('/api/usuarios', exigirModelos, autenticar, administrador, require('./routes/usuario.routes'));
app.use('/api/productos', exigirModelos, autenticar, require('./routes/producto.routes'));
app.use('/api', (req, res) => res.status(404).json({ error: 'Ruta API no encontrada.' }));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.name === 'SequelizeUniqueConstraintError')
    return res.status(409).json({ error: 'Ya existe un registro con ese correo o teléfono.' });
  if (error.name === 'SequelizeForeignKeyConstraintError')
    return res
      .status(400)
      .json({ error: 'El usuario seleccionado no existe.' });
  if (error.name === 'SequelizeValidationError')
    return res
      .status(400)
      .json({
        error: 'Revisa los campos obligatorios y el formato del correo.',
      });
  if (error.type === 'entity.parse.failed')
    return res
      .status(400)
      .json({ error: 'El cuerpo debe contener JSON válido.' });
  if ([400, 409].includes(error.status))
    return res.status(error.status).json({ error: error.message });
  if (error.status === 413)
    return res.status(413).json({ error: 'La petición es demasiado grande.' });
  return res
    .status(503)
    .json({
      error:
        'No se pudo completar la operación. Comprueba la conexión e inténtalo de nuevo.',
    });
});

module.exports = app;
