const definirUsuario = require('./Usuario');
const definirProducto = require('./Producto');

module.exports = function crearModelos(sequelize) {
  const Usuario = definirUsuario(sequelize);
  const Producto = definirProducto(sequelize);
  Usuario.hasMany(Producto, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
  Producto.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  const Cuenta = require('./Cuenta')(sequelize);
  const Cliente = require('./Cliente')(sequelize);
  Usuario.hasOne(Cuenta, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
  Cuenta.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  return { Usuario, Producto, Cuenta, Cliente };
};
