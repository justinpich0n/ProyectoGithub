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

module.exports = app;
