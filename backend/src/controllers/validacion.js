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
  let imagen;
  if (Object.hasOwn(body, 'imagen')) {
    imagen = body.imagen;
    if (imagen !== null) {
      if (typeof imagen !== 'string' || imagen.length > 700000) invalido('La imagen supera el tamaño permitido.');
      if (/^https:\/\//i.test(imagen)) {
        let url;
        try { url = new URL(imagen); } catch { invalido('Pega una dirección HTTPS válida para la imagen.'); }
        if (imagen.length > 2048 || !url.hostname || url.username || url.password) invalido('La dirección de la imagen no es válida.');
      } else if (!/^\/productos\/[a-z]+\.svg$/.test(imagen)) {
        const partes = /^data:image\/(png|jpeg);base64,([A-Za-z0-9+/]+={0,2})$/.exec(imagen);
        if (!partes) invalido('Pega una dirección HTTPS de imagen o adjunta un PNG/JPG.');
        const bytes = Buffer.from(partes[2], 'base64');
        const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
        const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
        if (bytes.length > 500000 || (partes[1] === 'png' ? !png : !jpg)) invalido('La imagen no es un PNG/JPG válido de hasta 500 KB.');
      }
    }
  }
  return {
    ...(imagen !== undefined ? { imagen } : {}),
    nombre,
    precio,
    costo,
    cantidad: Number(body.cantidad),
    descripcion: body.descripcion ?? null,
    usuarioId: Number(body.usuarioId),
  };
}
module.exports = { datosUsuario, datosProducto, datosCliente, idValido, moneda, texto, invalido };
