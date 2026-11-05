const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Venta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  operacion: { type: DataTypes.UUID, allowNull: false, unique: true },
  clienteId: { type: DataTypes.INTEGER, allowNull: true },
  puntosGanados: { type: DataTypes.VIRTUAL, get() { return this.clienteId ? require('../clientes/fidelidad').puntosDeVenta(this.total) : 0; } },
  cuentaId: { type: DataTypes.INTEGER, allowNull: false },
  metodo: { type: DataTypes.ENUM('efectivo', 'tarjeta', 'movil'), allowNull: false },
  total: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  recibido: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cambio: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  cliente: { type: DataTypes.JSON, allowNull: true },
  vendedor: { type: DataTypes.JSON, allowNull: true },
  detalle: { type: DataTypes.JSON, allowNull: false },
}, { tableName: 'ventas', timestamps: true, indexes: [{ name: 'ventas_cuenta_recientes', fields: ['cuentaId', 'id'] }, { name: 'ventas_cliente_recientes', fields: ['clienteId', 'id'] }] });
