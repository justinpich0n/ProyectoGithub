const { Op, QueryTypes } = require('sequelize');
const router = require('express').Router();
const { moneda, idValido, invalido } = require('../controllers/validacion');
const { crear } = require('../controllers/cliente.controller');
const centavos = (v) => Math.round(Number(moneda(v, 'Monto')) * 100);
router.get('/', async (req, res) => {
  const ventas = await req.app.locals.modelos.Venta.findAll({
    where: { cuentaId: req.cuenta.id },
    order: [['id', 'DESC']],
    limit: 15,
  });
  res.json(ventas);
});

router.get('/clientes', async (req, res) => {
  const q = req.query.q;
  if (typeof q !== 'string' || q.length > 100) invalido('La búsqueda admite hasta 100 caracteres.');
  if (q.trim().length < 2) return res.json([]);
  const termino = q.trim().replace(/[\\%_]/g, '\\$&');
  const m = req.app.locals.modelos;
  const patron = `%${termino}%`;
  const clientes = await m.Cliente.findAll({
    attributes: ['id', 'nombre', 'telefono'],
    include: { model: m.Usuario, as: 'Usuario', attributes: ['nombre', 'email'], required: false },
    where: { [Op.or]: [{ nombre: { [Op.like]: patron } }, { telefono: { [Op.like]: patron } }, { '$Usuario.email$': { [Op.like]: patron } }, { '$Usuario.nombre$': { [Op.like]: patron } }] },
    order: [['nombre', 'ASC'], ['id', 'ASC']], limit: 15,
  });
  res.set('Cache-Control', 'no-store');
  res.json(clientes.map(c => ({ id: c.id, nombre: c.Usuario?.nombre || c.nombre, telefono: c.telefono, ...(c.Usuario ? { email: c.Usuario.email } : {}) })));

});

router.post('/clientes', crear);

router.get('/mejores-compradores', async (req, res) => {
  const m = req.app.locals.modelos;
  const { sequelize } = m.Venta;
  const quote = tabla => sequelize.getQueryInterface().queryGenerator.quoteTable(tabla);
  const compradores = await sequelize.query(
    `SELECT c.id, c.nombre, SUM(FLOOR(v.total / 1000)) AS puntos
     FROM ${quote(m.Venta.getTableName())} AS v
     INNER JOIN ${quote(m.Cliente.getTableName())} AS c ON JSON_EXTRACT(v.cliente, '$.id') = c.id
     GROUP BY c.id, c.nombre
     HAVING puntos > 0
     ORDER BY puntos DESC, c.nombre ASC, c.id ASC
     LIMIT 10`,
    { type: QueryTypes.SELECT },
  );
  res.json(compradores);
});

router.post('/', async (req, res) => {
  const { operacion, productos, metodo, recibido, clienteId } = req.body || {};
  if (typeof operacion !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(operacion)) invalido('Identificador de operación inválido.');
  if (!['efectivo', 'tarjeta', 'movil'].includes(metodo)) invalido('Selecciona efectivo, tarjeta o transferencia bancaria.');
  if (!Array.isArray(productos) || productos.length < 1 || productos.length > 100) invalido('Selecciona entre 1 y 100 productos.');
  const ids = new Set();
  for (const p of productos) {
    if (!p || !idValido(p.id) || !Number.isInteger(p.cantidad) || p.cantidad < 1 || p.cantidad > 10000 || ids.has(p.id)) invalido('Revisa productos y cantidades, sin repetir productos.');
    ids.add(p.id);
  }
  if (clienteId != null && (!Number.isInteger(clienteId) || !idValido(clienteId))) invalido('Selecciona un cliente válido.');
  const m = req.app.locals.modelos;
  const venta = await m.Venta.sequelize.transaction(async (transaction) => {
    const anterior = await m.Venta.findOne({ where: { operacion }, transaction });
    if (anterior) { const e = new Error('Esta operación ya fue registrada.'); e.status = 409; throw e; }
    let cliente = null;
    if (clienteId != null) {
      const registrado = await m.Cliente.findByPk(clienteId, { transaction, include: { model: m.Usuario, as: 'Usuario', attributes: ['nombre', 'email'], required: false } });
      if (!registrado) invalido('El cliente seleccionado ya no existe.');
      const { id, nombre, telefono } = registrado;
      cliente = { id, nombre: registrado.Usuario?.nombre || nombre, telefono, ...(registrado.Usuario ? { email: registrado.Usuario.email } : {}) };
    }
    let total = 0; const detalle = [];
    for (const p of productos) {
      const producto = await m.Producto.findByPk(p.id, { transaction, lock: transaction.LOCK.UPDATE });
      if (!producto) invalido('Un producto ya no existe.');
      const subtotal = centavos(producto.precio) * p.cantidad; total += subtotal;
      if (total > 9999999999) invalido('El total supera el máximo permitido.');
      detalle.push({ productoId: producto.id, nombre: producto.nombre, precio: producto.precio, cantidad: p.cantidad, subtotal: (subtotal / 100).toFixed(2) });
    }
    const monto = centavos(recibido);
    if (monto < total) invalido('El monto recibido es insuficiente.');
    if (metodo !== 'efectivo' && monto !== total) invalido('En medios electrónicos ingresa el monto exacto.');
    return m.Venta.create({ operacion, cuentaId: req.cuenta.id, cliente, metodo, total: (total / 100).toFixed(2), recibido: (monto / 100).toFixed(2), cambio: ((monto - total) / 100).toFixed(2), detalle }, { transaction });
  });
  res.status(201).json(venta);
});
module.exports = router;
