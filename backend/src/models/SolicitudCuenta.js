const { DataTypes } = require('sequelize');
module.exports = db => db.define('SolicitudCuenta', {
  id: { type: DataTypes.UUID, primaryKey: true },
  seguimientoHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
  nombre: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false },
  emailPendiente: { type: DataTypes.STRING(255), unique: true, allowNull: true },
  rol: { type: DataTypes.ENUM('administrador', 'cajero'), allowNull: false },
  tipoDocumento: { type: DataTypes.STRING(3), allowNull: true },
  documentoCifrado: { type: DataTypes.STRING(80), allowNull: true },
  documentoHash: { type: DataTypes.STRING(64), allowNull: true, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: true },
  estado: { type: DataTypes.ENUM('pendiente', 'aprobada', 'rechazada', 'expirada'), allowNull: false, defaultValue: 'pendiente' },
  expira: { type: DataTypes.DATE, allowNull: false },
  decididoPor: { type: DataTypes.INTEGER, allowNull: true },
  decididoEn: { type: DataTypes.DATE, allowNull: true },
}, { tableName: 'solicitudes_cuenta', indexes: [{ fields: ['estado', 'createdAt'] }] });
