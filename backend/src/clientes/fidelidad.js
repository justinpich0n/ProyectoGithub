const { fn, col, literal } = require('sequelize');

const puntosDeVenta = total => Math.floor(Math.round(Number(total) * 100) / 100000);

async function asegurarCliente(m, usuario, transaction) {
  const [cliente] = await m.Cliente.findOrCreate({
    where: { usuarioId: usuario.id }, defaults: { nombre: usuario.nombre }, transaction,
  });
  return cliente;
}

async function sincronizarCompradores(m) {
  const cuentas = await m.Cuenta.findAll({ where: { rol: 'comprador' }, attributes: ['usuarioId'], include: { model: m.Usuario, attributes: ['id', 'nombre'] } });
  for (const cuenta of cuentas) await asegurarCliente(m, cuenta.Usuario);
}

async function vincularVentasAnteriores(m) {
  // Solo se recupera el identificador que ya figuraba en el comprobante.
  // No se atribuyen compras por coincidencias de nombres o correos.
  const ventas = await m.Venta.findAll({ where: { clienteId: null }, attributes: ['id', 'cliente'] });
  const ids = new Set((await m.Cliente.findAll({ attributes: ['id'] })).map(c => c.id));
  for (const venta of ventas) {
    if (Number.isInteger(venta.cliente?.id) && ids.has(venta.cliente.id)) {
      await m.Venta.update({ clienteId: venta.cliente.id }, { where: { id: venta.id, clienteId: null } });
    }
  }
}

async function resumenClientes(m, ids, transaction) {
  if (!ids.length) return new Map();
  const filas = await m.Venta.findAll({
    where: { clienteId: ids },
    attributes: ['clienteId', [fn('COUNT', col('id')), 'compras'], [fn('SUM', col('total')), 'totalGastado'], [fn('SUM', literal('FLOOR(total / 1000)')), 'puntos']],
    group: ['clienteId'], raw: true, transaction,
  });
  return new Map(filas.map(f => [f.clienteId, { compras: Number(f.compras), totalGastado: String(f.totalGastado), puntos: Number(f.puntos) }]));
}
const resumenVacio = () => ({ compras: 0, totalGastado: '0.00', puntos: 0 });

async function perfilCompras(m, cliente, pagina) {
  return m.Venta.sequelize.transaction({ isolationLevel: 'REPEATABLE READ' }, async transaction => {
    const [resumen, resultado, usuario] = await Promise.all([
      resumenClientes(m, [cliente.id], transaction),
      m.Venta.findAndCountAll({ where: { clienteId: cliente.id }, order: [['createdAt', 'DESC'], ['id', 'DESC']], limit: 15, offset: (pagina - 1) * 15, transaction }),
      cliente.usuarioId ? m.Usuario.findByPk(cliente.usuarioId, { attributes: ['email'], transaction }) : null,
    ]);
    return {
      cliente: { nombre: cliente.nombre, telefono: cliente.telefono, direccion: cliente.direccion, email: usuario?.email ?? null },
      resumen: resumen.get(cliente.id) || resumenVacio(), total: resultado.count, pagina,
      compras: resultado.rows.map(v => ({ id: v.id, createdAt: v.createdAt, metodo: v.metodo, total: v.total, recibido: v.recibido, cambio: v.cambio, detalle: v.detalle, cliente: v.cliente ? { nombre: v.cliente.nombre, telefono: v.cliente.telefono } : null, puntosGanados: puntosDeVenta(v.total) })),
    };
  });
}
module.exports = { puntosDeVenta, asegurarCliente, sincronizarCompradores, vincularVentasAnteriores, resumenClientes, resumenVacio, perfilCompras };
