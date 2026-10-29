const express = require('express');
const cors = require('cors');
const { verificarConexion } = require('./db');

const app = express();

app.use(cors({ origin: 'http://127.0.0.1:5173' }));
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
const { autenticar, administrador } = require('./auth/seguridad');
app.use('/api/auth', exigirModelos, require('./routes/auth.routes'));
app.use('/api/clientes', exigirModelos, autenticar, administrador, require('./routes/cliente.routes'));
app.use('/api/usuarios', exigirModelos, autenticar, administrador, require('./routes/usuario.routes'));
app.use('/api/productos', exigirModelos, autenticar, require('./routes/producto.routes'));
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
