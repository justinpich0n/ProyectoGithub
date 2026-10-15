const { datosProducto } = require('./validacion');

async function listar(req, res) {
  const filas = await req.app.locals.modelos.Producto.findAll({
    include: {
      model: req.app.locals.modelos.Usuario,
      attributes: ['id', 'nombre', 'email'],
    },
  });
  res.json(filas);
}
async function obtener(req, res) {
  const fila = await req.app.locals.modelos.Producto.findByPk(req.params.id, {
    include: {
      model: req.app.locals.modelos.Usuario,
      attributes: ['id', 'nombre', 'email'],
    },
  });
  if (!fila) return res.status(404).json({ error: 'Producto no encontrado.' });
  res.json(fila);
}
async function crear(req, res) {
  const fila = await req.app.locals.modelos.Producto.create(
    datosProducto(req.body),
  );
  res.status(201).json(fila);
}
async function actualizar(req, res) {
  const fila = await req.app.locals.modelos.Producto.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Producto no encontrado.' });
  await fila.update(datosProducto(req.body));
  res.json(fila);
}
async function eliminar(req, res) {
  const fila = await req.app.locals.modelos.Producto.findByPk(req.params.id);
  if (!fila) return res.status(404).json({ error: 'Producto no encontrado.' });
  await fila.destroy();
  res.json({ mensaje: 'Producto eliminado.' });
}
module.exports = { listar, obtener, crear, actualizar, eliminar };
