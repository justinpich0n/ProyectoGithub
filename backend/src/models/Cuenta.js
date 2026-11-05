const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Cuenta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  tipoDocumento: { type: DataTypes.STRING(3), allowNull: true },
  documentoCifrado: { type: DataTypes.STRING(80), allowNull: true },
  documentoHash: { type: DataTypes.STRING(64), allowNull: true, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('administrador', 'cajero', 'comprador'), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'cuentas' });
