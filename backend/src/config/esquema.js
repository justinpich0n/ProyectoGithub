const { DataTypes } = require('sequelize');
// Migración aditiva explícita: no modifica ni inventa costo/stock de registros previos.
module.exports = async function prepararEsquema(sequelize) {
  const qi = sequelize.getQueryInterface();
  const tablas = await qi.showAllTables();
  for (const tabla of ['cuentas', 'solicitudes_cuenta']) {
    if (!tablas.includes(tabla)) continue;
    const columnas = await qi.describeTable(tabla);
    if (!columnas.tipoDocumento) await qi.addColumn(tabla, 'tipoDocumento', { type: DataTypes.STRING(3) });
    if (!columnas.documentoHash) await qi.addColumn(tabla, 'documentoHash', { type: DataTypes.STRING(64) });
    const indices = await qi.showIndex(tabla);
    if (!indices.some(i => i.unique && i.fields.length === 1 && i.fields[0].attribute === 'documentoHash')) {
      await qi.addIndex(tabla, ['documentoHash'], { unique: true, name: tabla + '_documento_unico' });
    }
  }
  if (tablas.includes('ventas')) {
    const columnasVenta = await qi.describeTable('ventas');
    if (!columnasVenta.cliente) await qi.addColumn('ventas', 'cliente', {
      type: DataTypes.JSON,
      allowNull: true,
    });
  }
  if (!tablas.includes('productos')) return;
  const columnas = await qi.describeTable('productos');
  for (const campo of ['costo', 'cantidad']) {
    if (!columnas[campo]) await qi.addColumn('productos', campo, {
      type: campo === 'costo' ? DataTypes.DECIMAL(10, 2) : DataTypes.INTEGER,
      allowNull: true,
    });
  }
  const indices = await qi.showIndex('productos');
  if (!indices.some((i) => i.name === 'productos_nombre_busqueda')) {
    await qi.addIndex('productos', ['nombre'], { name: 'productos_nombre_busqueda' });
  }
};
