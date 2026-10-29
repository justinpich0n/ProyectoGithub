const { DataTypes } = require('sequelize');
module.exports = (sequelize) => sequelize.define('Cliente', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: { type: DataTypes.STRING, allowNull: false },
  telefono: { type: DataTypes.STRING(20), allowNull: false, unique: true },
  direccion: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'clientes', indexes: [{ fields: ['nombre'] }] });
