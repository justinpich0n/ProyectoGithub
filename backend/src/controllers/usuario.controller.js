const { datosUsuario } = require('./validacion');

async function listar(req, res) {
  const m = req.app.locals.modelos;
  const propietario = await require('../auth/propietario').esPropietario(m, req.cuenta.id);
  const [filas, cuentas] = await Promise.all([m.Usuario.findAll({}), m.Cuenta.findAll({ attributes: ['usuarioId', 'rol', 'tipoDocumento', ...(propietario ? ['documentoCifrado'] : [])] })]);
  const porId = new Map(cuentas.map(c => [c.usuarioId, c]));
  res.set('Cache-Control', 'no-store');
  res.json(filas.map(fila => {
    const cuenta = porId.get(fila.id);
    return { ...fila.toJSON(), comprador: cuenta?.rol === 'comprador', tipoDocumento: cuenta?.tipoDocumento || null, numeroDocumento: propietario ? require('../auth/documento').leerNumero(cuenta?.documentoCifrado) : null };
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
  const datos = datosUsuario(req.body);
  await fila.sequelize.transaction(async transaction => {
    await fila.update(datos, { transaction });
    await req.app.locals.modelos.Cliente.update({ nombre: datos.nombre }, { where: { usuarioId: fila.id }, transaction });
  });
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
