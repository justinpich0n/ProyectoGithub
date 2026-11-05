const { esPropietario } = require('../auth/propietario');
const { leerNumero } = require('../auth/documento');
const { datosUsuario } = require('./validacion');

async function listar(req, res) {
  const m = req.app.locals.modelos;
  const puedeVerNumero = await esPropietario(m, req.cuenta.id);
  const attributes = puedeVerNumero ? ['tipoDocumento', 'documentoCifrado', 'rol'] : ['tipoDocumento', 'rol'];
  const asociacion = Object.values(m.Usuario.associations).find(asoc => asoc.target === m.Cuenta);
  const filas = await m.Usuario.findAll({ include: { association: asociacion, attributes } });
  res.set('Cache-Control', 'no-store');
  res.json(filas.map(fila => {
    const { [asociacion.as]: cuenta, ...usuario } = fila.toJSON();
    return {
      ...usuario,
      rol: cuenta?.rol ?? null,
      tipoDocumento: cuenta?.tipoDocumento ?? null,
      numeroDocumento: puedeVerNumero ? leerNumero(cuenta?.documentoCifrado) : null,
    };
  }));
}
async function obtener(req, res) {
  const fila = await req.app.locals.modelos.Usuario.findByPk(req.params.id, {});
  if (!fila) return res.status(404).json({ error: 'Usuario no encontrado.' });
  res.json(fila);
}
async function crear(req, res) {
  const fila = await req.app.locals.modelos.Usuario.create(
    datosUsuario(req.body),
  );
  res.status(201).json(fila);
}
async function protegerPropietario(req, res, fila, eliminar = false) {
  const m = req.app.locals.modelos;
  const config = await m.ConfiguracionAcceso.findByPk(1);
  const cuenta = config && await m.Cuenta.findByPk(config.propietarioCuentaId);
  if (cuenta?.usuarioId !== fila.id) return false;
  if (eliminar) { res.status(409).json({ error: 'No puedes eliminar la cuenta propietaria.' }); return true; }
  if (req.cuenta.id !== cuenta.id) { res.status(403).json({ error: 'Solo el propietario puede modificar sus datos.' }); return true; }
  return false;
}
async function actualizar(req, res) {
  const fila = await req.app.locals.modelos.Usuario.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Usuario no encontrado.' });
  if (await protegerPropietario(req, res, fila)) return;
  await fila.update(datosUsuario(req.body));
  res.json(fila);
}
async function eliminar(req, res) {
  const fila = await req.app.locals.modelos.Usuario.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Usuario no encontrado.' });
  if (await protegerPropietario(req, res, fila, true)) return;
  await fila.destroy();
  res.json({ mensaje: 'Usuario eliminado.' });
}
module.exports = { listar, obtener, crear, actualizar, eliminar };
