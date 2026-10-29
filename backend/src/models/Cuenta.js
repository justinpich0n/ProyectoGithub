const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Cuenta', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: { type: DataTypes.INTEGER, allowNull: false, unique: true },
  passwordHash: { type: DataTypes.STRING(255), allowNull: false },
  rol: { type: DataTypes.ENUM('administrador', 'cajero'), allowNull: false },
  activo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, { tableName: 'cuentas' });
