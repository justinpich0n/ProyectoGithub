const { createHmac } = require('node:crypto');
const { Op } = require('sequelize');
const { invalido } = require('../controllers/validacion');

const tipos = new Set(['CC', 'TI', 'CE', 'PA', 'PPT']);

function documento({ tipoDocumento, numeroDocumento } = {}) {
  const numero = typeof numeroDocumento === 'string'
    ? numeroDocumento.trim().toUpperCase().replace(/[ .-]/g, '')
    : '';
  if (!tipos.has(tipoDocumento) || !/^[A-Z0-9]{3,24}$/.test(numero)
    || (['CC', 'TI'].includes(tipoDocumento) && !/^\d+$/.test(numero))) {
    invalido('Selecciona el tipo de documento e ingresa un número válido.');
  }
  const clave = process.env.BIZZSTOCK_DOCUMENTO_KEY;
  if (!clave || clave.length < 32) {
    throw Object.assign(new Error('La verificación de documentos no está disponible.'), { status: 503 });
  }
  // El número se compara entre tipos. Solo se conserva su huella privada.
  const documentoHash = createHmac('sha256', clave).update(numero.replace(/^0+(?=\d+$)/, '')).digest('hex');
  return { tipoDocumento, documentoHash };
}

function conflicto() {
  throw Object.assign(new Error('Ya existe una cuenta o solicitud pendiente con ese correo o documento.'), { status: 409 });
}

// Todos los flujos web de altas comparten este bloqueo.
function bloquearAltas(m, transaction) {
  return m.ConfiguracionAcceso.findByPk(1, { transaction, lock: transaction.LOCK.UPDATE });
}

async function verificarDuplicado(m, transaction, { email, documentoHash }, incluirPendientes = true) {
  const usuario = email && await m.Usuario.findOne({ where: { email }, transaction });
  if (usuario && await m.Cuenta.findOne({ where: { usuarioId: usuario.id }, transaction })) conflicto();
  if (documentoHash && await m.Cuenta.findOne({ where: { documentoHash }, transaction })) conflicto();
  if (!incluirPendientes) return;
  if (email && await m.SolicitudCuenta.findOne({ where: { emailPendiente: email, expira: { [Op.gt]: new Date() } }, transaction })) conflicto();
  if (documentoHash && await m.SolicitudCuenta.findOne({ where: { documentoHash, estado: 'pendiente', expira: { [Op.gt]: new Date() } }, transaction })) conflicto();
}
module.exports = { documento, bloquearAltas, verificarDuplicado };
