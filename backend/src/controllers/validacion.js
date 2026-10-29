function invalido(mensaje) {
  const error = new Error(mensaje);
  error.status = 400;
  throw error;
}
function texto(valor, campo) {
  if (typeof valor !== 'string' || !valor.trim() || valor.trim().length > 255) {
    invalido(`${campo} debe contener entre 1 y 255 caracteres.`);
  }
  return valor.trim();
}
function idValido(valor) {
  return (
    /^(?:[1-9]\d*)$/.test(String(valor)) &&
    Number.isSafeInteger(Number(valor)) &&
    Number(valor) <= 2147483647
  );
}
function datosUsuario(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    invalido('Se requiere un objeto JSON.');
  return {
    nombre: texto(body.nombre, 'Nombre'),
    email: texto(body.email, 'Correo'),
  };
}
function moneda(valor, campo) {
  if (!['string', 'number'].includes(typeof valor) || !/^\d{1,8}(\.\d{1,2})?$/.test(String(valor))) {
    invalido(`${campo} debe estar entre 0 y 99999999.99, con máximo dos decimales.`);
  }
  return String(valor);
}
function datosCliente(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) invalido('Se requiere un objeto JSON.');
  const telefonoOriginal = texto(body.telefono, 'Teléfono');
  if (!/^\+?[\d ()-]+$/.test(telefonoOriginal)) invalido('El teléfono contiene caracteres inválidos.');
  const telefono = telefonoOriginal.replace(/[ ()-]/g, '');
  if (!/^\+?\d{7,15}$/.test(telefono)) invalido('El teléfono debe contener entre 7 y 15 dígitos.');
  return { nombre: texto(body.nombre, 'Nombre completo'), telefono, direccion: texto(body.direccion, 'Dirección') };
}
function datosProducto(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    invalido('Se requiere un objeto JSON.');
  const nombre = texto(body.nombre, 'Nombre');
  if (!idValido(body.usuarioId)) invalido('Selecciona un usuario válido.');
  const precio = moneda(body.precio, 'Precio de venta');
  const costo = moneda(body.costo, 'Precio de costo');
  if (Number(costo) === 0 && body.confirmarCostoCero !== true) invalido('Confirma explícitamente el costo cero antes de guardar.');
  if (!['number', 'string'].includes(typeof body.cantidad) || !/^(0|[1-9]\d*)$/.test(String(body.cantidad)) || Number(body.cantidad) > 2147483647) {
    invalido('La cantidad debe ser un entero entre 0 y 2147483647.');
  }
  if (
    body.descripcion != null &&
    (typeof body.descripcion !== 'string' ||
      Buffer.byteLength(body.descripcion, 'utf8') > 65535)
  ) {
    invalido('La descripción debe ser un texto de hasta 65535 bytes.');
  }
  return {
    nombre,
    precio,
    costo,
    cantidad: Number(body.cantidad),
    descripcion: body.descripcion ?? null,
    usuarioId: Number(body.usuarioId),
  };
}
module.exports = { datosUsuario, datosProducto, datosCliente, idValido, moneda, texto, invalido };
