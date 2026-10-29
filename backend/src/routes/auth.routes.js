const router = require('express').Router();
const { verificarPassword, abrirSesion, autenticar, cerrarSesion } = require('../auth/seguridad');
const intentos = new Map();
const publico = (c) => ({ id: c.usuarioId, nombre: c.Usuario.nombre, email: c.Usuario.email, rol: c.rol });
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
  res.json({ token: abrirSesion(cuenta.id), usuario: publico(cuenta) });
});
router.get('/sesion', autenticar, (req, res) => { res.set('Cache-Control', 'no-store'); res.json(publico(req.cuenta)); });
router.post('/logout', autenticar, (req, res) => { cerrarSesion(req); res.json({ mensaje: 'Sesión cerrada.' }); });
module.exports = router;
