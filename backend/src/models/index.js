const definirUsuario = require('./Usuario');
const definirProducto = require('./Producto');

module.exports = function crearModelos(sequelize) {
  const Usuario = definirUsuario(sequelize);
  const Producto = definirProducto(sequelize);
  Usuario.hasMany(Producto, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
  Producto.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  return { Usuario, Producto };
};
