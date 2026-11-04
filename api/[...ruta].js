const app = require('../backend/src/app');
const { crearPool } = require('../backend/src/db');
const crearModelos = require('../backend/src/models');
const crearSequelize = require('../backend/src/config/database');

module.exports = function atender(req, res) {
  if (!app.locals.modelos) {
    try {
      const sequelize = crearSequelize();
      const modelos = crearModelos(sequelize);
      app.locals.pool = crearPool();
      app.locals.modelos = modelos;
    } catch (error) {
      const faltantes = ['DB_HOST', 'DB_PORT', 'DB_NAME', 'DB_USER', 'DB_PASSWORD']
        .filter((key) => !process.env[key]);
      console.error('Configuración de MySQL en Vercel', {
        tipo: error.name,
        faltantes,
        tls: process.env.DB_SSL === 'true',
        certificado: Boolean(process.env.DB_SSL_CA_BASE64),
      });
      return res.status(503).json({ error: 'La conexión a MySQL no está configurada.' });
    }
  }

  return app(req, res);
};
