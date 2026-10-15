const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const { crearPool, verificarConexion } = require('./src/db');
const app = require('./src/app');
const crearSequelize = require('./src/config/database');
const crearModelos = require('./src/models');

async function iniciarServidor() {
  const port = Number(process.env.PORT || 3000);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT debe ser un entero entre 1 y 65535.');
  }

  const pool = crearPool();
  app.locals.pool = pool;
  const sequelize = pool ? crearSequelize() : null;

  if (!pool) {
    console.log('Modo de prueba HTTP: MySQL está deshabilitado.');
  } else {
    try {
      await verificarConexion(pool);
      console.log('MySQL respondió correctamente a SELECT 1.');
      const modelos = crearModelos(sequelize);
      await sequelize.authenticate();
      await sequelize.sync(); // Sin force ni alter: conserva las tablas existentes.
      app.locals.modelos = modelos;
      console.log('Modelos de Usuarios y Productos preparados.');
    } catch {
      // HTTP sigue disponible para informar del fallo y volver a comprobar.
      console.error(
        'No se pudo preparar MySQL o sus tablas. Comprueba /api/health y reinicia para habilitar el CRUD.',
      );
    }
  }

  const server = app.listen(port, '127.0.0.1', () => {
    console.log(`BizzStock: http://127.0.0.1:${port}/api/health`);
  });
  server.on('error', async () => {
    console.error(
      'No se pudo abrir el puerto HTTP. Comprueba si está ocupado.',
    );
    process.exitCode = 1;
    await cerrarPool();
  });

  async function cerrarPool() {
    try {
      await Promise.all([pool?.end(), sequelize?.close()]);
    } catch {
      console.error(
        'No se pudo completar el cierre de las conexiones a MySQL.',
      );
      process.exitCode = 1;
    }
  }

  let cerrando = false;
  function detener() {
    if (cerrando) return;
    cerrando = true;
    console.log('Cerrando el servidor HTTP y el pool de MySQL.');
    server.close(() => {
      void cerrarPool();
    });
  }
  process.on('SIGINT', detener);
  process.on('SIGTERM', detener);
}

iniciarServidor().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
