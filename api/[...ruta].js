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
    } catch {
      return res.status(503).json({ error: 'La conexión a MySQL no está configurada.' });
    }
  }

  return app(req, res);
};
