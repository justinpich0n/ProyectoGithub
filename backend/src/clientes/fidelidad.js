const { fn, col, literal, where } = require('sequelize');
const { asegurarCliente } = require('./vinculo');
const puntosDeVenta = total => Math.floor(Math.round(Number(total) * 100) / 100000);
// Usa el ID explícito guardado en el comprobante; no atribuye compras por nombres.
const ventasCliente = id => where(literal("JSON_EXTRACT(`cliente`, '$.id')"), id);
async function perfilCompras(m, cliente, pagina) {
  return m.Venta.sequelize.transaction({ isolationLevel: 'REPEATABLE READ' }, async transaction => {
    const filtro = ventasCliente(cliente.id);
    const resumen = await m.Venta.findOne({ where: filtro, attributes: [[fn('COUNT', col('id')), 'compras'], [fn('SUM', col('total')), 'totalGastado'], [fn('SUM', literal('FLOOR(total / 1000)')), 'puntos']], raw: true, transaction });
    const resultado = await m.Venta.findAndCountAll({ where: filtro, order: [['createdAt', 'DESC'], ['id', 'DESC']], limit: 15, offset: (pagina - 1) * 15, transaction });
    const usuario = cliente.usuarioId ? await m.Usuario.findByPk(cliente.usuarioId, { attributes: ['nombre', 'email'], transaction }) : null;
    return {
      cliente: { nombre: usuario?.nombre || cliente.nombre, telefono: cliente.telefono, direccion: cliente.direccion, email: usuario?.email || null },
      resumen: { compras: Number(resumen?.compras || 0), totalGastado: String(resumen?.totalGastado || '0.00'), puntos: Number(resumen?.puntos || 0) },
      total: resultado.count, pagina,
      compras: resultado.rows.map(v => ({ id: v.id, createdAt: v.createdAt, metodo: v.metodo, total: v.total, recibido: v.recibido, cambio: v.cambio, detalle: v.detalle, cliente: v.cliente ? { nombre: v.cliente.nombre, telefono: v.cliente.telefono } : null, puntosGanados: puntosDeVenta(v.total) })),
    };
  });
}
module.exports = { asegurarCliente, perfilCompras, puntosDeVenta };
