const app = require('../backend/src/app');
const { crearPool } = require('../backend/src/db');
const crearModelos = require('../backend/src/models');
const crearSequelize = require('../backend/src/config/database');

let prepararSesiones;
let prepararCompradores;

module.exports = async function atender(req, res) {
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

  prepararCompradores ||= (async () => {
    await require('../backend/src/config/rol-comprador')(app.locals.modelos.Cuenta.sequelize);
    await require('../backend/src/config/clientes-cuentas')(app.locals.modelos);
  })().catch(error => {
    prepararCompradores = undefined;
    throw error;
  });
  try { await prepararCompradores; }
  catch (error) {
    console.error('No se pudo preparar el rol de comprador', error.original?.code || error.name);
    return res.status(503).json({ error: 'No se pudo preparar el registro. Intenta nuevamente.' });
  }

  const url = new URL(req.url, 'http://localhost');
  if (url.pathname === '/api/express') {
    const ruta = url.searchParams.getAll('__bizzstock_ruta').at(-1) || '';
    url.searchParams.delete('__bizzstock_ruta');
    req.url = '/api/' + ruta + url.search;
  }
  if (req.url.startsWith('/api/auth/') || req.headers.authorization || (req.method === 'POST' && ['/api/inicio', '/api/solicitudes'].includes(req.url.split('?')[0]))) {
    prepararSesiones ||= app.locals.modelos.Sesion.sync().catch((error) => {
      prepararSesiones = undefined;
      throw error;
    });
    try {
      await prepararSesiones;
    } catch (error) {
      console.error('No se pudo preparar la tabla de sesiones', error.original?.code || error.name);
      return res.status(503).json({ error: 'No se pudo preparar el inicio de sesión.' });
    }
  }
  return app(req, res);
};
