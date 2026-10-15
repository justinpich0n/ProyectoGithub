const { datosUsuario } = require('./validacion');

async function listar(req, res) {
  const filas = await req.app.locals.modelos.Usuario.findAll({});
  res.json(filas);
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
async function actualizar(req, res) {
  const fila = await req.app.locals.modelos.Usuario.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Usuario no encontrado.' });
  await fila.update(datosUsuario(req.body));
  res.json(fila);
}
async function eliminar(req, res) {
  const fila = await req.app.locals.modelos.Usuario.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Usuario no encontrado.' });
  await fila.destroy();
  res.json({ mensaje: 'Usuario eliminado.' });
}
module.exports = { listar, obtener, crear, actualizar, eliminar };
