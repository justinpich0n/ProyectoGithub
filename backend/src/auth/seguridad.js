const { randomBytes, scrypt, timingSafeEqual, createHash } = require('node:crypto');
const { promisify } = require('node:util');
const derivar = promisify(scrypt);
async function hashPassword(password) {
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) {
    throw new Error('La contraseña debe tener entre 6 y 128 caracteres.');
  }
  const sal = randomBytes(16).toString('hex');
  const hash = await derivar(password, sal, 64);
  return `${sal}:${hash.toString('hex')}`;
}
async function verificarPassword(password, valor) {
  if (typeof password !== 'string' || password.length > 128) return false;
  const [sal, hash] = valor.split(':');
  const esperado = Buffer.from(hash, 'hex');
  const real = await derivar(password, sal, 64);
  return esperado.length === real.length && timingSafeEqual(esperado, real);
}
const digest = (token) => createHash('sha256').update(token).digest('hex');
const sesiones = new Map();
function abrirSesion(cuentaId) {
  for (const [k, s] of sesiones) if (s.expira <= Date.now()) sesiones.delete(k);
  if (sesiones.size >= 1000) sesiones.delete(sesiones.keys().next().value);
  const token = randomBytes(32).toString('hex');
  sesiones.set(digest(token), { cuentaId, expira: Date.now() + 8 * 60 * 60 * 1000 });
  return token;
}
async function autenticar(req, res, next) {
  const token = req.headers.authorization?.match(/^Bearer ([a-f0-9]{64})$/)?.[1];
  const sesion = token && sesiones.get(digest(token));
  if (!sesion || sesion.expira <= Date.now()) return res.status(401).json({ error: 'Inicia sesión para continuar.' });
  const cuenta = await req.app.locals.modelos.Cuenta.findByPk(sesion.cuentaId, { include: 'Usuario' });
  if (!cuenta?.activo) return res.status(401).json({ error: 'La sesión ya no es válida.' });
  req.cuenta = cuenta;
  next();
}
function administrador(req, res, next) {
  if (req.cuenta.rol !== 'administrador') return res.status(403).json({ error: 'Esta operación requiere permisos de administrador.' });
  next();
}
function cerrarSesion(req) {
  const token = req.headers.authorization?.slice(7);
  if (token) sesiones.delete(digest(token));
}
module.exports = { hashPassword, verificarPassword, abrirSesion, autenticar, administrador, cerrarSesion };
