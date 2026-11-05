const { DataTypes } = require('sequelize');
// Añade el vínculo sin fusionar personas por nombre ni inventar teléfono/dirección.
module.exports = async function prepararClientesCuentas(m, { sincronizar = true } = {}) {
  const qi = m.Cliente.sequelize.getQueryInterface();
  const tabla = m.Cliente.getTableName();
  let columnas = await qi.describeTable(tabla);
  if (!columnas.usuarioId) {
    try {
      await qi.addColumn(tabla, 'usuarioId', { type: DataTypes.INTEGER, allowNull: true,
        references: { model: m.Usuario.getTableName(), key: 'id' }, onDelete: 'SET NULL', onUpdate: 'CASCADE' });
    } catch (error) {
      if (!(await qi.describeTable(tabla)).usuarioId) throw error;
    }
  }
  columnas = await qi.describeTable(tabla);
  for (const campo of ['telefono', 'direccion']) if (!columnas[campo].allowNull) {
    await qi.changeColumn(tabla, campo, { type: campo === 'telefono' ? DataTypes.STRING(20) : DataTypes.STRING, allowNull: true });
  }
  const esVinculoUnico = i => i.unique && i.fields.length === 1 && i.fields[0].attribute === 'usuarioId';
  if (!(await qi.showIndex(tabla)).some(esVinculoUnico)) {
    try { await qi.addIndex(tabla, ['usuarioId'], { unique: true, name: 'clientes_usuario_cuenta_unico' }); }
    catch (error) { if (!(await qi.showIndex(tabla)).some(esVinculoUnico)) throw error; }
  }
  if (sincronizar) await require('../clientes/vinculo').sincronizarCompradores(m);
};
