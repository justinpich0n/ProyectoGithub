const router = require('express').Router();
const { Op, fn, col } = require('sequelize');
const { invalido } = require('../controllers/validacion');
router.get('/', async (req, res) => {
  const m = req.app.locals.modelos;
  const pagina = Number(req.query.pagina || 1);
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 10000) invalido('Página inválida.');
  const where = {};
  if (req.query.metodo) {
    if (!['efectivo', 'tarjeta', 'movil'].includes(req.query.metodo)) invalido('Método inválido.');
    where.metodo = req.query.metodo;
  }
  const fechas = {};
  for (const [campo, operador, hora] of [['desde', Op.gte, '00:00:00.000'], ['hasta', Op.lte, '23:59:59.999']]) {
    const valor = req.query[campo];
    if (!valor) continue;
    if (typeof valor !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(valor)
      || !Number.isFinite(Date.parse(valor)) || new Date(valor).toISOString().slice(0, 10) !== valor) invalido('Fecha inválida.');
    fechas[operador] = new Date(valor + 'T' + hora + '-05:00');
  }
  if (req.query.desde && req.query.hasta && req.query.desde > req.query.hasta) invalido('Revisa el rango de fechas.');
  if (Reflect.ownKeys(fechas).length) where.createdAt = fechas;
  const [resultado, resumen] = await Promise.all([
    m.Venta.findAndCountAll({ where, order: [['createdAt', 'DESC'], ['id', 'DESC']], limit: 25, offset: (pagina - 1) * 25 }),
    m.Venta.findOne({ where, attributes: [[fn('SUM', col('total')), 'total'], [fn('SUM', col('recibido')), 'recibido'], [fn('SUM', col('cambio')), 'cambio']], raw: true }),
  ]);
  const ids = [...new Set(resultado.rows.map(v => v.cuentaId))];
  const cuentas = ids.length ? await m.Cuenta.findAll({
    where: { id: ids }, attributes: ['id', 'rol'],
    include: { model: m.Usuario, attributes: ['nombre', 'email'] },
  }) : [];
  const porId = new Map(cuentas.map(c => [c.id, { nombre: c.Usuario.nombre, email: c.Usuario.email, rol: c.rol }]));
  res.set('Cache-Control', 'no-store');
  res.json({
    ventas: resultado.rows.map(v => ({ ...v.toJSON(), vendedor: v.vendedor || porId.get(v.cuentaId) || { nombre: 'Cuenta histórica' } })),
    total: resultado.count, pagina, resumen: { total: resumen?.total || '0.00', recibido: resumen?.recibido || '0.00', cambio: resumen?.cambio || '0.00' },
  });
});
module.exports = router;
