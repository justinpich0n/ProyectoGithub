const { DataTypes } = require('sequelize');
module.exports = (sequelize) =>
  sequelize.define(
    'Producto',
    {
      id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
      nombre: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { notEmpty: true },
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0,
      },
      descripcion: { type: DataTypes.TEXT, allowNull: true },
      usuarioId: { type: DataTypes.INTEGER, allowNull: false },
    },
    { tableName: 'productos', timestamps: true },
  );
