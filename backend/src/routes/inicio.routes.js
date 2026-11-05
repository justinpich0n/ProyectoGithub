const router = require('express').Router();
const { createHash, timingSafeEqual } = require('node:crypto');
const { hashPassword, abrirSesion } = require('../auth/seguridad');
const { invalido } = require('../controllers/validacion');
const { documento } = require('../auth/documento');
const intentos = new Map();
const { limitar } = require('../auth/limitar');
router.get('/', async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const config = await req.app.locals.modelos.ConfiguracionAcceso.findByPk(1);
  res.json({ configurado: !!config });
});
router.post('/', limitar(intentos, 5, 15 * 60000), async (req, res) => {
  res.set('Cache-Control', 'no-store');
  const clave = req.get('X-Setup-Token');
  const esperado = process.env.BIZZSTOCK_SETUP_TOKEN_HASH;
  const hash = typeof clave === 'string' && clave.length <= 128 ? createHash('sha256').update(clave).digest('hex') : '';
  if (!esperado || hash.length !== esperado.length || !timingSafeEqual(Buffer.from(hash), Buffer.from(esperado))) return res.status(403).json({ error: 'Necesitas el enlace privado de configuración del propietario.' });
  const { nombre, email, password } = req.body || {};
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 255 || typeof email !== 'string' || email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) invalido('Revisa tu nombre y correo.');
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) invalido('Usa una contraseña de 6 a 128 caracteres.');
  const m = req.app.locals.modelos;
  if (await m.ConfiguracionAcceso.findByPk(1) || await m.Cuenta.count()) { const e = new Error('La instalación ya tiene cuentas. La configuración inicial está cerrada.'); e.status = 409; throw e; }
  const datosDocumento = documento(req.body);
  const passwordHash = await hashPassword(password);
  const cuenta = await m.Cuenta.sequelize.transaction(async transaction => {
    const [usuario] = await m.Usuario.findOrCreate({ where: { email: email.trim().toLowerCase() }, defaults: { nombre: nombre.trim() }, transaction });
    const creada = await m.Cuenta.create({ usuarioId: usuario.id, rol: 'administrador', passwordHash, ...datosDocumento }, { transaction });
    // El registro único hace que solo una transacción pueda completar la configuración.
    await m.ConfiguracionAcceso.create({ id: 1, propietarioCuentaId: creada.id }, { transaction });
    return creada;
  });
  const usuario = await m.Usuario.findByPk(cuenta.usuarioId);
  res.status(201).json({ token: abrirSesion(cuenta.id), usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email, rol: cuenta.rol, propietario: true, faltaDocumento: false } });
});
module.exports = router;
