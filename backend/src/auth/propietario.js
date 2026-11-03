async function esPropietario(modelos, cuentaId) {
  const config = await modelos.ConfiguracionAcceso.findByPk(1);
  return config?.propietarioCuentaId === cuentaId;
}
async function propietario(req, res, next) {
  if (!await esPropietario(req.app.locals.modelos, req.cuenta.id)) return res.status(403).json({ error: 'Solo el propietario puede autorizar cuentas.' });
  next();
}
module.exports = { esPropietario, propietario };
