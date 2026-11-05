const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Cliente', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  usuarioId: { type: DataTypes.INTEGER, allowNull: true, unique: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  telefono: { type: DataTypes.STRING(20), allowNull: true, unique: true },
  direccion: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'clientes', indexes: [{ fields: ['nombre'] }] });
