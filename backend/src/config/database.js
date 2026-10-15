const { Sequelize } = require('sequelize');

module.exports = function crearSequelize(env = process.env) {
  return new Sequelize(env.DB_NAME, env.DB_USER, env.DB_PASSWORD, {
    host: env.DB_HOST,
    port: Number(env.DB_PORT || 3306),
    dialect: 'mysql',
    logging: false,
    define: { charset: 'utf8mb4', collate: 'utf8mb4_unicode_ci' },
    pool: { max: 5, acquire: 5000 },
  });
};
