// Prueba explícita contra el servidor LOCAL iniciado. Solo elimina sus propios registros.
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const base = 'http://127.0.0.1:3000/api';
async function pedir(method, ruta, datos, esperado = 200) {
  const res = await fetch(base + ruta, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: datos === undefined ? undefined : JSON.stringify(datos),
  });
  const body = await res.json();
  assert.equal(
    res.status,
    esperado,
    `${method} ${ruta}: ${JSON.stringify(body)}`,
  );
  return body;
}
async function probar() {
  let usuario;
  try {
    await pedir('GET', '/health');
    usuario = await pedir(
      'POST',
      '/usuarios',
      {
        nombre: 'Prueba automática',
        email: `prueba-${randomUUID()}@example.com`,
      },
      201,
    );
    assert.equal(
      (await pedir('GET', `/usuarios/${usuario.id}`)).nombre,
      usuario.nombre,
    );
    assert.ok(
      (await pedir('GET', '/usuarios')).some((u) => u.id === usuario.id),
    );
    await pedir(
      'POST',
      '/usuarios',
      { nombre: 'Duplicado', email: usuario.email },
      409,
    );
    await pedir(
      'POST',
      '/usuarios',
      { nombre: 'Inválido', email: 'sin-correo' },
      400,
    );
    await pedir(
      'POST',
      '/usuarios',
      { nombre: '   ', email: 'invalido@example.com' },
      400,
    );
    await pedir('GET', '/usuarios/no-numero', undefined, 400);
    await pedir('PUT', `/usuarios/${usuario.id}`, {
      nombre: 'Prueba editada',
      email: usuario.email,
    });
    assert.equal(
      (await pedir('GET', `/usuarios/${usuario.id}`)).nombre,
      'Prueba editada',
    );
    const datos = {
      nombre: 'Cuaderno de prueba',
      precio: '4500.50',
      descripcion: 'Solo prueba',
      usuarioId: usuario.id,
    };
    const producto = await pedir('POST', '/productos', datos, 201);
    const consultado = await pedir('GET', `/productos/${producto.id}`);
    assert.equal(consultado.Usuario.id, usuario.id);
    assert.equal(consultado.precio, '4500.50');
    assert.ok(
      (await pedir('GET', '/productos')).some(
        (p) => p.id === producto.id && p.Usuario.id === usuario.id,
      ),
    );
    for (const precio of ['-1', '1.999', '', null, true, '100000000']) {
      await pedir('POST', '/productos', { ...datos, precio }, 400);
    }
    await pedir('PUT', `/productos/${producto.id}`, {
      ...datos,
      nombre: 'Cuaderno editado',
      precio: '5000.25',
    });
    assert.equal(
      (await pedir('GET', `/productos/${producto.id}`)).precio,
      '5000.25',
    );
    await pedir('DELETE', `/productos/${producto.id}`);
    await pedir('GET', `/productos/${producto.id}`, undefined, 404);
    await pedir('PUT', `/productos/${producto.id}`, datos, 404);
    await pedir('DELETE', `/productos/${producto.id}`, undefined, 404);
    const cascada = await pedir(
      'POST',
      '/productos',
      { nombre: 'Prueba cascada', usuarioId: usuario.id },
      201,
    );
    assert.equal(
      (await pedir('GET', `/productos/${cascada.id}`)).precio,
      '0.00',
    );
    await pedir('DELETE', `/usuarios/${usuario.id}`);
    await pedir('GET', `/productos/${cascada.id}`, undefined, 404);
    await pedir('GET', `/usuarios/${usuario.id}`, undefined, 404);
    await pedir('POST', '/productos', datos, 400);
    usuario = null;
    console.log(
      'CRUD real aprobado: altas, consultas, edición, eliminación, persistencia, validación, correo único y cascada.',
    );
  } finally {
    if (usuario) await pedir('DELETE', `/usuarios/${usuario.id}`);
  }
}
probar().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
