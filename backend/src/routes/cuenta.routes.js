const router = require('express').Router();
const { hashPassword } = require('../auth/seguridad');
const { invalido } = require('../controllers/validacion');
router.use(require('../auth/propietario').propietario);
router.post('/', async (req, res) => {
  const { nombre, email, password, rol } = req.body || {};
  if (typeof nombre !== 'string' || !nombre.trim() || nombre.length > 255 || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255 || !['administrador', 'cajero'].includes(rol)) invalido('Revisa nombre, correo y rol.');
  if (typeof password !== 'string' || password.length < 6 || password.length > 128) invalido('La contraseña debe tener entre 6 y 128 caracteres.');
  const m = req.app.locals.modelos;
  const passwordHash = await hashPassword(password);
  await m.Usuario.sequelize.transaction(async (transaction) => {
    const [usuario] = await m.Usuario.findOrCreate({ where: { email: email.trim().toLowerCase() }, defaults: { nombre: nombre.trim() }, transaction });
    if (await m.Cuenta.findOne({ where: { usuarioId: usuario.id }, transaction })) { const e = new Error('Este correo ya tiene cuenta.'); e.status = 409; throw e; }
    await m.Cuenta.create({ usuarioId: usuario.id, rol, passwordHash }, { transaction });
  });
  res.status(201).json({ mensaje: 'Cuenta creada. Ya puede iniciar sesión.' });
});
module.exports = router;
