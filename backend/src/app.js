const express = require('express');
const cors = require('cors');
const { verificarConexion } = require('./db');

const app = express();

app.use(cors());
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
app.use('/api/usuarios', exigirModelos, require('./routes/usuario.routes'));
app.use('/api/productos', exigirModelos, require('./routes/producto.routes'));
app.use((error, req, res, next) => {
  if (res.headersSent) return next(error);
  if (error.name === 'SequelizeUniqueConstraintError')
    return res.status(409).json({ error: 'Este correo ya está registrado.' });
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
  if (error.status === 400)
    return res.status(400).json({ error: error.message });
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
