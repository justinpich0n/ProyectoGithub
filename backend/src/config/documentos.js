const { Op, DataTypes } = require('sequelize');
module.exports = async function prepararDocumentos(m) {
  const qi = m.Cuenta.sequelize.getQueryInterface();
  for (const modelo of [m.Cuenta, m.SolicitudCuenta]) {
    const tabla = modelo.getTableName();
    for (const [campo, type] of [['tipoDocumento', DataTypes.STRING(3)], ['documentoCifrado', DataTypes.STRING(80)], ['documentoHash', DataTypes.STRING(64)]]) {
      if (!(await qi.describeTable(tabla))[campo]) {
        try { await qi.addColumn(tabla, campo, { type, allowNull: true }); }
        catch (error) { if (!(await qi.describeTable(tabla))[campo]) throw error; }
      }
    }
  }
  // Si hay documentos previos, falla de forma segura ante una clave equivocada.
  const existente = await m.Cuenta.findOne({ where: { documentoCifrado: { [Op.ne]: null } }, attributes: ['documentoCifrado'] });
  if (existente) require('../auth/documento').leerNumero(existente.documentoCifrado);
  const tabla = m.Cuenta.getTableName();
  const existe = indices => indices.some(i => i.unique && i.fields.length === 1 && i.fields[0].attribute === 'documentoHash');
  if (!existe(await qi.showIndex(tabla))) {
    try { await qi.addIndex(tabla, ['documentoHash'], { unique: true, name: 'cuentas_documento_unico' }); }
    catch (error) { if (!existe(await qi.showIndex(tabla))) throw error; }
  }
};
