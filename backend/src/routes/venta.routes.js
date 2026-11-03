const router = require('express').Router();
const { moneda, idValido, invalido } = require('../controllers/validacion');
const centavos = (v) => Math.round(Number(moneda(v, 'Monto')) * 100);
router.post('/', async (req, res) => {
  const { operacion, productos, metodo, recibido } = req.body || {};
  if (typeof operacion !== 'string' || !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(operacion)) invalido('Identificador de operación inválido.');
  if (!['efectivo', 'tarjeta', 'movil'].includes(metodo)) invalido('Selecciona efectivo, tarjeta o pago móvil.');
  if (!Array.isArray(productos) || productos.length < 1 || productos.length > 100) invalido('Selecciona entre 1 y 100 productos.');
  const ids = new Set();
  for (const p of productos) {
    if (!p || !idValido(p.id) || !Number.isInteger(p.cantidad) || p.cantidad < 1 || p.cantidad > 10000 || ids.has(p.id)) invalido('Revisa productos y cantidades, sin repetir productos.');
    ids.add(p.id);
  }
  const m = req.app.locals.modelos;
  const venta = await m.Venta.sequelize.transaction(async (transaction) => {
    const anterior = await m.Venta.findOne({ where: { operacion }, transaction });
    if (anterior) { const e = new Error('Esta operación ya fue registrada.'); e.status = 409; throw e; }
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
    return m.Venta.create({ operacion, cuentaId: req.cuenta.id, metodo, total: (total / 100).toFixed(2), recibido: (monto / 100).toFixed(2), cambio: ((monto - total) / 100).toFixed(2), detalle }, { transaction });
  });
  res.status(201).json(venta);
});
module.exports = router;
