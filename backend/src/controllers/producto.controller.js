const { Op } = require('sequelize');
const { datosProducto, moneda, idValido, invalido } = require('./validacion');
const salida = (fila) => {
  const json = fila.toJSON();
  json.advertencias = json.costo !== null && Number(json.precio) < Number(json.costo)
    ? ['El precio de venta es menor al costo: posible pérdida económica.'] : [];
  return json;
};
async function listar(req, res) {
  const q = req.query.q ?? '';
  if (typeof q !== 'string' || q.length > 100) invalido('La búsqueda admite hasta 100 caracteres.');
  // La coincidencia por prefijo usa el índice de nombre; comodines del usuario son literales.
  const filas = await req.app.locals.modelos.Producto.findAll({
    where: q.trim() ? { nombre: { [Op.like]: `${q.trim().replace(/[\\%_]/g, '\\$&')}%` } } : {},
    include: { model: req.app.locals.modelos.Usuario, attributes: ['id', 'nombre', 'email'] },
    order: [['nombre', 'ASC'], ['id', 'ASC']], limit: 100,
  });
  res.json(filas.map(salida));
}
async function obtener(req, res) {
  const fila = await req.app.locals.modelos.Producto.findByPk(req.params.id, {
    include: { model: req.app.locals.modelos.Usuario, attributes: ['id', 'nombre', 'email'] },
  });
  if (!fila) return res.status(404).json({ error: 'Producto no encontrado.' });
  res.json(salida(fila));
}
async function crear(req, res) {
  const fila = await req.app.locals.modelos.Producto.create(datosProducto(req.body));
  res.status(201).json(salida(fila));
}
async function actualizar(req, res) {
  const fila = await req.app.locals.modelos.Producto.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Producto no encontrado.' });
  await fila.update(datosProducto(req.body)); res.json(salida(fila));
}
async function eliminar(req, res) {
  const fila = await req.app.locals.modelos.Producto.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Producto no encontrado.' });
  await fila.destroy(); res.json({ mensaje: 'Producto eliminado.' });
}
async function importarCostos(req, res) {
  const { filas, confirmarCostoCero } = req.body || {};
  if (!Array.isArray(filas) || !filas.length || filas.length > 500) invalido('El archivo debe contener entre 1 y 500 filas.');
  const ids = new Set();
  const datos = filas.map((fila) => {
    if (!fila || !idValido(fila.id) || ids.has(Number(fila.id))) invalido('Cada ID debe ser válido y aparecer una sola vez.');
    ids.add(Number(fila.id));
    const costo = moneda(fila.costo, 'Costo');
    if (Number(costo) === 0 && confirmarCostoCero !== true) invalido('Confirma los costos cero del archivo.');
    return { id: Number(fila.id), costo };
  });
  const cambios = await req.app.locals.modelos.Producto.sequelize.transaction(async (transaction) => {
    const resultados = [];
    for (const d of datos) {
      const producto = await req.app.locals.modelos.Producto.findByPk(d.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!producto) invalido(`No existe el producto #${d.id}. No se importó ninguna fila.`);
      await producto.update({ costo: d.costo }, { transaction }); resultados.push(salida(producto));
    }
    return resultados;
  });
  res.json({ mensaje: `${cambios.length} costos actualizados.`, productos: cambios });
}
module.exports = { listar, obtener, crear, actualizar, eliminar, importarCostos };
