const { DataTypes } = require('sequelize');
module.exports = db => db.define('ConfiguracionAcceso', {
  id: { type: DataTypes.INTEGER, primaryKey: true },
  propietarioCuentaId: { type: DataTypes.INTEGER, allowNull: false },
}, { tableName: 'configuracion_acceso', timestamps: true });
