const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
require('dotenv').config({ quiet: true });
const crearSequelize = require('../src/config/database');
const crearModelos = require('../src/models');
const { hashPassword } = require('../src/auth/seguridad');
const app = require('../src/app');
async function probar() {
  const sequelize = crearSequelize();
  const m = crearModelos(sequelize);
  const usuariosPropios = []; const clientesPropios = []; let server;
  let total = 0;
  const marca = randomUUID().replace(/-/g, '').slice(0, 12);
  try {
    await sequelize.authenticate(); await require('../src/config/esquema')(sequelize); await sequelize.sync();
    app.locals.modelos = m;
    const iniciales = await m.Producto.findAll({ attributes: ['id', 'nombre', 'precio'], raw: true });
    const password = randomUUID() + randomUUID();
    for (const rol of ['administrador', 'cajero']) {
      const u = await m.Usuario.create({ nombre: `Prueba ${rol}`, email: `${rol}-${marca}@example.com` }); usuariosPropios.push(u.id);
      await m.Cuenta.create({ usuarioId: u.id, rol, passwordHash: await hashPassword(password) });
    }
    server = app.listen(0, '127.0.0.1'); await new Promise((r) => server.once('listening', r));
    const base = `http://127.0.0.1:${server.address().port}/api`;
    async function pedir(method, ruta, datos, esperado = 200, token) {
      const r = await fetch(base + ruta, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: datos === undefined ? undefined : JSON.stringify(datos) });
      const body = await r.json(); assert.equal(r.status, esperado, `${method} ${ruta}: ${JSON.stringify(body)}`); total++; return body;
    }
    await pedir('GET', '/productos', undefined, 401);
    const admin = (await pedir('POST', '/auth/login', { email: `administrador-${marca}@example.com`, password })).token;
    const cajero = (await pedir('POST', '/auth/login', { email: `cajero-${marca}@example.com`, password })).token;
    await pedir('POST', '/auth/login', { email: `administrador-${marca}@example.com`, password: 'incorrecta' }, 401);
    await pedir('GET', '/auth/sesion', undefined, 200, admin);
    const datos = { nombre: `PPI${marca} cuaderno`, precio: '5000.25', costo: '4000.10', cantidad: 12, descripcion: 'Solo prueba ficticia', usuarioId: usuariosPropios[0] };
    await pedir('POST', '/productos', datos, 403, cajero);
    const producto = await pedir('POST', '/productos', datos, 201, admin);
    assert.equal(producto.costo, '4000.10'); assert.equal(producto.cantidad, 12);
    assert.equal((await pedir('GET', `/productos/${producto.id}`, undefined, 200, cajero)).precio, '5000.25');
    let filas = await pedir('GET', `/productos?q=${encodeURIComponent(`PPI${marca}`)}`, undefined, 200, cajero);
    assert.ok(filas.some((f) => f.id === producto.id));
    assert.equal((await pedir('GET', `/productos?q=sin-coincidencias-${marca}`, undefined, 200, admin)).length, 0);
    assert.equal((await pedir('GET', '/productos?q=%25', undefined, 200, admin)).length, 0);
    assert.equal((await pedir('GET', '/productos?q=%27%20OR%201%3D1--', undefined, 200, admin)).length, 0);
    for (const costo of [undefined, null, '', '-1', '1.999', true, '100000000']) await pedir('POST', '/productos', { ...datos, costo }, 400, admin);
    await pedir('POST', '/productos', { ...datos, costo: 0 }, 400, admin);
    await pedir('POST', '/productos', { ...datos, precio: undefined }, 400, admin);
    await pedir('POST', '/productos', { ...datos, cantidad: -1 }, 400, admin);
    const cero = await pedir('POST', '/productos', { ...datos, nombre: `PPI${marca} cero`, costo: 0, confirmarCostoCero: true }, 201, admin);
    let actualizado = await pedir('PUT', `/productos/${producto.id}`, { ...datos, precio: '3000.00' }, 200, admin);
    assert.ok(actualizado.advertencias[0].includes('menor al costo'));
    await pedir('POST', '/productos/costos/importar', { filas: [{ id: producto.id, costo: '1.00' }, { id: 2147483647, costo: '2.00' }] }, 400, admin);
    assert.equal((await pedir('GET', `/productos/${producto.id}`, undefined, 200, admin)).costo, '4000.10');
    await pedir('POST', '/productos/costos/importar', { filas: [{ id: producto.id, costo: 0 }] }, 400, admin);
    await pedir('POST', '/productos/costos/importar', { filas: [{ id: producto.id, costo: 1 }, { id: producto.id, costo: 2 }] }, 400, admin);
    await pedir('POST', '/productos/costos/importar', { filas: [{ id: producto.id, costo: '6000.00' }, { id: cero.id, costo: 0 }], confirmarCostoCero: true }, 200, admin);
    assert.equal((await pedir('GET', `/productos/${producto.id}`, undefined, 200, admin)).costo, '6000.00');
    await pedir('POST', '/productos/costos/importar', { filas: [{ id: producto.id, costo: 1 }] }, 403, cajero);
    const telefono = `57${String(Date.now()).slice(-11)}`;
    const cliente = { nombre: `Cliente ${marca}`, telefono, direccion: 'Dirección ficticia de prueba' };
    await pedir('POST', '/clientes', cliente, 403, cajero);
    await pedir('GET', '/clientes', undefined, 403, cajero);
    for (const campo of ['nombre', 'telefono', 'direccion']) await pedir('POST', '/clientes', { ...cliente, [campo]: '' }, 400, admin);
    await pedir('POST', '/clientes', { ...cliente, telefono: 'abcdefg' }, 400, admin);
    const nuevo = await pedir('POST', '/clientes', cliente, 201, admin); clientesPropios.push(nuevo.id);
    await pedir('POST', '/clientes', cliente, 409, admin);
    await pedir('POST', '/clientes', { ...cliente, telefono: telefono.slice(0, 2) + ' ' + telefono.slice(2) }, 409, admin);
    actualizado = await pedir('PUT', `/clientes/${nuevo.id}`, { ...cliente, direccion: 'Dirección ficticia editada' }, 200, admin);
    assert.equal(actualizado.direccion, 'Dirección ficticia editada');
    assert.ok((await pedir('GET', `/clientes?q=${marca}`, undefined, 200, admin)).some((c) => c.id === nuevo.id));
    assert.equal((await pedir('GET', `/clientes/${nuevo.id}`, undefined, 200, admin)).direccion, 'Dirección ficticia editada');
    await pedir('PUT', '/clientes/2147483647', cliente, 404, admin);
    await pedir('PUT', '/clientes/invalido', cliente, 400, admin);
    const indices = await sequelize.getQueryInterface().showIndex('productos');
    assert.ok(indices.some((i) => i.name === 'productos_nombre_busqueda'));
    await pedir('DELETE', `/productos/${producto.id}`, undefined, 200, admin);
    await pedir('GET', `/productos/${producto.id}`, undefined, 404, admin);
    const usuarioApi = await pedir('POST', '/usuarios', { nombre: 'Usuario ficticio', email: `api-${marca}@example.com` }, 201, admin); usuariosPropios.push(usuarioApi.id);
    await pedir('PUT', `/usuarios/${usuarioApi.id}`, { nombre: 'Nombre ficticio editado', email: usuarioApi.email }, 200, admin);
    const prodApi = await pedir('POST', '/productos', { ...datos, usuarioId: usuarioApi.id }, 201, admin);
    await pedir('DELETE', `/usuarios/${usuarioApi.id}`, undefined, 200, admin);
    await pedir('GET', `/productos/${prodApi.id}`, undefined, 404, admin);
    await pedir('POST', '/auth/logout', {}, 200, cajero);
    await pedir('GET', '/productos', undefined, 401, cajero);
    for (const previo of iniciales) {
      const actual = await m.Producto.findByPk(previo.id); assert.ok(actual); assert.equal(actual.nombre, previo.nombre); assert.equal(actual.precio, previo.precio);
    }
    console.log(`PPI aprobado: ${total} respuestas HTTP, permisos, búsqueda, clientes, costos, importación atómica, precios, persistencia e índice. Registros previos conservados.`);
  } finally {
    if (server) await new Promise((r) => server.close(r));
    for (const id of clientesPropios) await m.Cliente.destroy({ where: { id } });
    for (const id of usuariosPropios) await m.Usuario.destroy({ where: { id } });
    await sequelize.close();
  }
}
probar().catch((e) => { console.error(e.message); process.exitCode = 1; });
