const { DataTypes } = require('sequelize');

module.exports = (sequelize) => sequelize.define('Sesion', {
  tokenHash: { type: DataTypes.CHAR(64), primaryKey: true },
  cuentaId: { type: DataTypes.INTEGER, allowNull: false },
  expira: { type: DataTypes.DATE, allowNull: false },
}, {
  tableName: 'sesiones',
  timestamps: false,
});
