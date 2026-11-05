const { Op } = require('sequelize');
const { resumenClientes, resumenVacio, perfilCompras } = require('../clientes/fidelidad');
const { datosCliente, invalido } = require('./validacion');
async function listar(req, res) {
  const q = req.query.q ?? '';
  if (typeof q !== 'string' || q.length > 100) invalido('La búsqueda admite hasta 100 caracteres.');
  const m = req.app.locals.modelos;
  const filas = await m.Cliente.findAll({
    include: { model: m.Usuario, attributes: ['email'], required: false },
    where: q.trim() ? { nombre: { [Op.like]: `%${q.trim().replace(/[\\%_]/g, '\\$&')}%` } } : {},
    order: [['nombre', 'ASC'], ['id', 'ASC']], limit: 100,
  });
  const resumen = await resumenClientes(m, filas.map(c => c.id));
  res.set('Cache-Control', 'no-store');
  res.json(filas.map(c => { const { Usuario, ...datos } = c.toJSON(); return { ...datos, email: Usuario?.email ?? null, ...(resumen.get(c.id) || resumenVacio()) }; }));
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
  const m = req.app.locals.modelos;
  await m.Cliente.sequelize.transaction(async transaction => {
    await fila.update(datos, { transaction });
    if (fila.usuarioId && await m.Cuenta.findOne({ where: { usuarioId: fila.usuarioId, rol: 'comprador' }, transaction })) await m.Usuario.update({ nombre: datos.nombre }, { where: { id: fila.usuarioId }, transaction });
  });
  res.json(fila);
}
async function compras(req, res) {
  const m = req.app.locals.modelos;
  const pagina = Number(req.query.pagina || 1);
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 10000) invalido('Página inválida.');
  const cliente = await m.Cliente.findByPk(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
  res.set('Cache-Control', 'no-store');
  res.json(await perfilCompras(m, cliente, pagina));
}
module.exports = { listar, obtener, crear, actualizar, compras };
