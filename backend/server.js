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
      await require('./src/config/esquema')(sequelize);
      if ((await sequelize.getQueryInterface().showAllTables()).includes(modelos.Cliente.tableName)) {
        await require('./src/config/clientes-cuentas')(modelos, { sincronizar: false });
      }
      // Las columnas nuevas deben existir antes de sincronizar índices.
      if ((await sequelize.getQueryInterface().showAllTables()).includes(modelos.Cuenta.tableName)) {
        await require('./src/config/documentos')(modelos);
      }
      await sequelize.sync(); // Sin force ni alter: conserva las tablas existentes.
      await require('./src/clientes/vinculo').sincronizarCompradores(modelos);
      if (process.env.BIZZSTOCK_CATALOGO_FERIA === 'true') {
        const creados = await require('./src/config/catalogo-demo')(modelos);
        console.log(`Productos de feria agregados: ${creados}.`);
      }
      app.locals.modelos = modelos;
      console.log('Modelos de Usuarios y Productos preparados.');
    } catch (error) {
      if (process.env.NODE_ENV === 'production') {
        const codigo = error.original?.code ?? error.code;
        if (typeof codigo === 'string' && /^[A-Z0-9_]+$/.test(codigo)) {
          console.error('Código de conexión MySQL:', codigo);
        }
        await cerrarPool();
        throw new Error('No se pudo preparar MySQL o sus tablas para el despliegue.', { cause: error });
      }
      // HTTP sigue disponible para informar del fallo y volver a comprobar.
      console.error(
        'No se pudo preparar MySQL o sus tablas. Comprueba /api/health y reinicia para habilitar el CRUD.',
      );
    }
  }

  const host = process.env.HOST || (process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1');
  const server = app.listen(port, host, () => {
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
