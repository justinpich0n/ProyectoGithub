const { Op } = require('sequelize');
const { datosCliente, invalido } = require('./validacion');
async function listar(req, res) {
  const q = req.query.q ?? '';
  if (typeof q !== 'string' || q.length > 100) invalido('La búsqueda admite hasta 100 caracteres.');
  const filas = await req.app.locals.modelos.Cliente.findAll({
    where: q.trim() ? { nombre: { [Op.like]: `%${q.trim().replace(/[\\%_]/g, '\\$&')}%` } } : {},
    order: [['nombre', 'ASC'], ['id', 'ASC']], limit: 100,
  });
  res.json(filas);
}
async function obtener(req, res) {
  const fila = await req.app.locals.modelos.Cliente.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Cliente no encontrado.' });
  res.json(fila);
}
async function crear(req, res) {
  res.status(201).json(await req.app.locals.modelos.Cliente.create(datosCliente(req.body)));
}
async function actualizar(req, res) {
  const fila = await req.app.locals.modelos.Cliente.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Cliente no encontrado.' });
  const datos = datosCliente(req.body);
  await fila.sequelize.transaction(async transaction => {
    await fila.update(datos, { transaction });
    if (fila.usuarioId) await req.app.locals.modelos.Usuario.update({ nombre: datos.nombre }, { where: { id: fila.usuarioId }, transaction });
  }); res.json(fila);
}
module.exports = { listar, obtener, crear, actualizar };
