const definirUsuario = require('./Usuario');
const definirProducto = require('./Producto');

module.exports = function crearModelos(sequelize) {
  const Usuario = definirUsuario(sequelize);
  const Producto = definirProducto(sequelize);
  Usuario.hasMany(Producto, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
  Producto.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  const Cuenta = require('./Cuenta')(sequelize);
  const Cliente = require('./Cliente')(sequelize);
  Usuario.hasOne(Cliente, { foreignKey: 'usuarioId', as: 'Cliente', onDelete: 'SET NULL' });
  Cliente.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'Usuario' });
  Usuario.hasOne(Cuenta, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
  Cuenta.belongsTo(Usuario, { foreignKey: 'usuarioId' });
  const Venta = require('./Venta')(sequelize);
  const ConfiguracionAcceso = require('./ConfiguracionAcceso')(sequelize);
  const SolicitudCuenta = require('./SolicitudCuenta')(sequelize);
  const Sesion = require('./Sesion')(sequelize);
  return { Sesion, Usuario, Producto, Cuenta, Cliente, Venta, ConfiguracionAcceso, SolicitudCuenta };
};
