const router = require('express').Router();
const { verificarPassword, abrirSesion, autenticar, cerrarSesion } = require('../auth/seguridad');
const { documento, bloquearAltas, verificarDuplicado } = require('../auth/documento');
const intentos = new Map();
const publico = async (c, m) => ({ propietario: await require('../auth/propietario').esPropietario(m, c.id), id: c.usuarioId, nombre: c.Usuario.nombre, email: c.Usuario.email, rol: c.rol, faltaDocumento: !c.documentoHash });
router.post('/login', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const clave = req.ip;
  for (const [k, v] of intentos) if (v.expira < Date.now()) intentos.delete(k);
  const estado = intentos.get(clave) || { cantidad: 0, expira: Date.now() + 15 * 60000 };
  if (estado.cantidad >= 5) return res.status(429).json({ error: 'Demasiados intentos. Espera 15 minutos.' });
  const { email, password } = req.body || {};
  const usuario = typeof email === 'string' && email.length <= 255
    ? await req.app.locals.modelos.Usuario.findOne({ where: { email: email.trim().toLowerCase() } }) : null;
  const cuenta = usuario && await req.app.locals.modelos.Cuenta.findOne({ where: { usuarioId: usuario.id }, include: 'Usuario' });
  if (!cuenta?.activo || !await verificarPassword(password, cuenta.passwordHash)) {
    estado.cantidad += 1; intentos.set(clave, estado);
    return res.status(401).json({ error: 'Correo o contraseña incorrectos.' });
  }
  intentos.delete(clave);
  res.json({ token: abrirSesion(cuenta.id), usuario: await publico(cuenta, req.app.locals.modelos) });
});
router.get('/sesion', autenticar, async (req, res) => { res.set('Cache-Control', 'no-store'); res.json(await publico(req.cuenta, req.app.locals.modelos)); });
router.post('/documento', autenticar, async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const datos = documento(req.body);
  const m = req.app.locals.modelos;
  await m.Cuenta.sequelize.transaction(async transaction => {
    await bloquearAltas(m, transaction);
    const cuenta = await m.Cuenta.findByPk(req.cuenta.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (cuenta.documentoHash === datos.documentoHash) return;
    if (cuenta.documentoHash) throw Object.assign(new Error('Esta cuenta ya tiene un documento registrado.'), { status: 409 });
    await verificarDuplicado(m, transaction, datos, false);
    await cuenta.update(datos, { transaction });
  });
  res.json({ faltaDocumento: false });
});
router.post('/logout', autenticar, (req, res) => { cerrarSesion(req); res.json({ mensaje: 'Sesión cerrada.' }); });
module.exports = router;
