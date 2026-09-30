const mysql = require('mysql2/promise');

function crearPool(env = process.env) {
  if (env.DB_ENABLED === 'false') return null;

  const required = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
  const missing = required.filter((key) => env[key] === undefined
    || (key !== 'DB_PASSWORD' && env[key].trim() === ''));
  if (missing.length) {
    throw new Error(`Falta configurar: ${missing.join(', ')}.`);
  }

  const port = Number(env.DB_PORT || 3306);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('DB_PORT debe ser un entero entre 1 y 65535.');
  }

  return mysql.createPool({
    host: env.DB_HOST,
    port,
    user: env.DB_USER,
    password: env.DB_PASSWORD,
    database: env.DB_NAME,
    charset: 'utf8mb4',
    connectionLimit: 5,
    waitForConnections: true,
    queueLimit: 10,
    connectTimeout: 5000,
    enableKeepAlive: true,
  });
}

async function verificarConexion(pool) {
  // query obtiene y devuelve automáticamente la conexión al pool.
  const [rows] = await pool.query({ sql: 'SELECT 1 AS ok', timeout: 5000 });
  if (rows[0]?.ok !== 1) {
    throw new Error('La consulta de comprobación no devolvió el resultado esperado.');
  }
}

module.exports = { crearPool, verificarConexion };
