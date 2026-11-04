const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Venta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  operacion: { type: DataTypes.UUID, allowNull: false, unique: true },
  cuentaId: { type: DataTypes.INTEGER, allowNull: false },
  metodo: { type: DataTypes.ENUM('efectivo', 'tarjeta', 'movil'), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  recibido: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cambio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cliente: { type: DataTypes.JSON, allowNull: true },
  detalle: { type: DataTypes.JSON, allowNull: false },
}, { tableName: 'ventas', timestamps: true, indexes: [{ name: 'ventas_cuenta_recientes', fields: ['cuentaId', 'id'] }] });
