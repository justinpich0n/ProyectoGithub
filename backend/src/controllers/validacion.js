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
function datosProducto(body = {}) {
  if (!body || typeof body !== 'object' || Array.isArray(body))
    invalido('Se requiere un objeto JSON.');
  const nombre = texto(body.nombre, 'Nombre');
  if (!idValido(body.usuarioId)) invalido('Selecciona un usuario válido.');
  const precio = body.precio === undefined ? 0 : body.precio;
  if (
    !['string', 'number'].includes(typeof precio) ||
    !/^\d{1,8}(\.\d{1,2})?$/.test(String(precio))
  ) {
    invalido(
      'El precio debe estar entre 0 y 99999999.99, con máximo dos decimales.',
    );
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
    descripcion: body.descripcion ?? null,
    usuarioId: Number(body.usuarioId),
  };
}
module.exports = { datosUsuario, datosProducto, idValido };
