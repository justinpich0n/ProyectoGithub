const { DataTypes } = require('sequelize');
// Amplía únicamente el enum de roles; conserva las cuentas y sus permisos existentes.
module.exports = async function prepararRolComprador(sequelize, tabla = 'cuentas') {
  const qi = sequelize.getQueryInterface();
  const columnas = await qi.describeTable(tabla);
  if (!columnas.rol.type.includes('comprador')) {
    await qi.changeColumn(tabla, 'rol', { type: DataTypes.ENUM('administrador', 'cajero', 'comprador'), allowNull: false });
  }
};
