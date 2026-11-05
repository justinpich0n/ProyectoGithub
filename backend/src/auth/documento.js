const { createHmac, createCipheriv, createDecipheriv, randomBytes } = require('node:crypto');
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
  const clave = claveDocumento();
  // La huella permite detectar duplicados. El cifrado permite mostrar el número al propietario.
  const documentoHash = createHmac('sha256', clave).update(numero.replace(/^0+(?=\d+$)/, '')).digest('hex');
  const iv = randomBytes(12);
  const cifrador = createCipheriv('aes-256-gcm', claveCifrado(clave), iv);
  const cifrado = Buffer.concat([cifrador.update(numero, 'utf8'), cifrador.final()]);
  const documentoCifrado = Buffer.concat([iv, cifrador.getAuthTag(), cifrado]).toString('base64');
  return { tipoDocumento, documentoHash, documentoCifrado };
}

function claveDocumento() {
  const clave = process.env.BIZZSTOCK_DOCUMENTO_KEY;
  if (!clave || clave.length < 32) {
    throw Object.assign(new Error('La verificación de documentos no está disponible.'), { status: 503 });
  }
  return clave;
}

function claveCifrado(clave) {
  return createHmac('sha256', clave).update('bizzstock:documentos:cifrado:v1').digest();
}

function leerNumero(valor) {
  if (!valor) return null;
  const bytes = Buffer.from(valor, 'base64');
  const descifrador = createDecipheriv('aes-256-gcm', claveCifrado(claveDocumento()), bytes.subarray(0, 12));
  descifrador.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([descifrador.update(bytes.subarray(28)), descifrador.final()]).toString('utf8');
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
module.exports = { documento, leerNumero, bloquearAltas, verificarDuplicado };
