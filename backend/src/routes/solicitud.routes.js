const router = require('express').Router();
const { randomBytes, randomUUID, createHash } = require('node:crypto');
const { Op } = require('sequelize');
const { autenticar, hashPassword, abrirSesion } = require('../auth/seguridad');
const { propietario } = require('../auth/propietario');
const { limitar } = require('../auth/limitar');
const { invalido } = require('../controllers/validacion');
const digest = valor => createHash('sha256').update(valor).digest('hex');
const privado = (req, res, next) => { res.set('Cache-Control', 'no-store'); next(); };
async function expirar(m) {
  await m.SolicitudCuenta.update({ estado: 'expirada', passwordHash: null, emailPendiente: null }, { where: { estado: 'pendiente', expira: { [Op.lte]: new Date() } } });
}
const resumen = s => ({ id: s.id, nombre: s.nombre, email: s.email, rol: s.rol, estado: s.estado, expira: s.expira, createdAt: s.createdAt, decididoEn: s.decididoEn });
router.use(privado);
router.post('/', limitar(new Map(), 20, 15 * 60000), async (req, res) => {
  const m = req.app.locals.modelos;
  const config = await m.ConfiguracionAcceso.findByPk(1);
  const cuenta = config && await m.Cuenta.findByPk(config.propietarioCuentaId);
  if (!cuenta?.activo) return res.status(503).json({ error: 'El propietario todavía debe configurar su acceso.' });
  const { nombre, email, password, rol } = req.body || {};
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 255 || typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !['cajero', 'administrador', 'comprador'].includes(rol)) invalido('Revisa nombre, correo y rol solicitado.');
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) invalido('La contraseña debe tener entre 6 y 128 caracteres.');
  const normalizado = email.trim().toLowerCase();
  await expirar(m);
  const u = await m.Usuario.findOne({ where: { email: normalizado } });
  if (u && await m.Cuenta.findOne({ where: { usuarioId: u.id } }) || await m.SolicitudCuenta.findOne({ where: { emailPendiente: normalizado } })) return res.status(409).json({ error: 'Este correo ya tiene una cuenta o una solicitud pendiente.' });
  if (rol === 'comprador') {
    const passwordHash = await hashPassword(password);
    const nueva = await m.Usuario.sequelize.transaction(async transaction => {
      const [usuario] = await m.Usuario.findOrCreate({ where: { email: normalizado }, defaults: { nombre: nombre.trim() }, transaction });
      if (await m.Cuenta.findOne({ where: { usuarioId: usuario.id }, transaction })) { const e = new Error('Este correo ya tiene cuenta.'); e.status = 409; throw e; }
      const cuenta = await m.Cuenta.create({ usuarioId: usuario.id, rol: 'comprador', passwordHash }, { transaction });
      await require('../clientes/vinculo').asegurarCliente(m, usuario, transaction);
      return cuenta;
    });
    return res.status(201).json({ token: await abrirSesion(m, nueva.id), usuario: { id: nueva.usuarioId, nombre: nombre.trim(), email: normalizado, rol: 'comprador', propietario: false } });
  }
  if (await m.SolicitudCuenta.count({ where: { estado: 'pendiente' } }) >= 100) return res.status(429).json({ error: 'Hay muchas solicitudes pendientes. Intenta más tarde.' });
  const seguimiento = randomBytes(32).toString('hex');
  const solicitud = await m.SolicitudCuenta.create({ id: randomUUID(), seguimientoHash: digest(seguimiento), nombre: nombre.trim(), email: normalizado, emailPendiente: normalizado, rol, passwordHash: await hashPassword(password), expira: new Date(Date.now() + 24 * 60 * 60000) });
  res.status(202).json({ seguimiento, estado: solicitud.estado, expira: solicitud.expira });
});
router.post('/estado', limitar(new Map(), 120, 60000), async (req, res) => {
  const token = req.body?.seguimiento;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) invalido('Seguimiento inválido.');
  const m = req.app.locals.modelos; await expirar(m);
  const s = await m.SolicitudCuenta.findOne({ where: { seguimientoHash: digest(token) } });
  if (!s) return res.status(404).json({ error: 'No se encontró la solicitud.' });
  res.json({ estado: s.estado, expira: s.expira });
});
router.get('/', autenticar, propietario, async (req, res) => {
  const m = req.app.locals.modelos; await expirar(m);
  const estado = req.query.estado || 'pendiente';
  if (!['pendiente', 'aprobada', 'rechazada', 'expirada'].includes(estado)) invalido('Estado inválido.');
  const pagina = Number(req.query.pagina || 1);
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 1000) invalido('Página inválida.');
  const { count, rows } = await m.SolicitudCuenta.findAndCountAll({ where: { estado }, order: [['createdAt', 'DESC'], ['id', 'ASC']], limit: 50, offset: (pagina - 1) * 50 });
  res.json({ solicitudes: rows.map(resumen), total: count, pagina });
});
router.post('/:id/decision', autenticar, propietario, async (req, res) => {
  if (!/^[a-f0-9-]{36}$/i.test(req.params.id)) invalido('Solicitud inválida.');
  const { decision, rol } = req.body || {};
  if (!['aprobar', 'rechazar'].includes(decision) || (decision === 'aprobar' && !['administrador', 'cajero'].includes(rol))) invalido('Selecciona aprobar o rechazar y revisa el rol.');
  const m = req.app.locals.modelos; await expirar(m);
  const resultado = await m.SolicitudCuenta.sequelize.transaction(async transaction => {
    const s = await m.SolicitudCuenta.findByPk(req.params.id, { transaction, lock: transaction.LOCK.UPDATE });
    if (!s) return null;
    if (s.estado !== 'pendiente' || s.expira <= new Date()) { const e = new Error('La solicitud ya fue resuelta o expiró.'); e.status = 409; throw e; }
    if (decision === 'aprobar') {
      const [u] = await m.Usuario.findOrCreate({ where: { email: s.email }, defaults: { nombre: s.nombre }, transaction });
      if (await m.Cuenta.findOne({ where: { usuarioId: u.id }, transaction })) { const e = new Error('Este correo ya tiene cuenta.'); e.status = 409; throw e; }
      await m.Cuenta.create({ usuarioId: u.id, passwordHash: s.passwordHash, rol }, { transaction });
    }
    await s.update({ estado: decision === 'aprobar' ? 'aprobada' : 'rechazada', rol: decision === 'aprobar' ? rol : s.rol, passwordHash: null, emailPendiente: null, decididoPor: req.cuenta.id, decididoEn: new Date() }, { transaction });
    return resumen(s);
  });
  if (!resultado) return res.status(404).json({ error: 'Solicitud no encontrada.' });
  res.json(resultado);
});
module.exports = router;
