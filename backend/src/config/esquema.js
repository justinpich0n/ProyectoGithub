const { DataTypes } = require('sequelize');
// Migración aditiva explícita: no modifica ni inventa costo/stock de registros previos.
module.exports = async function prepararEsquema(sequelize) {
  const qi = sequelize.getQueryInterface();
  const tablas = await qi.showAllTables();
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
