const { test } = require('node:test');
const assert = require('node:assert/strict');
const opcionesSSL = require('../src/config/ssl');
test('MySQL local sin TLS y remoto con certificado e identidad verificados', () => {
  assert.equal(opcionesSSL({}), undefined);
  assert.deepEqual(opcionesSSL({ DB_SSL: 'true' }), { rejectUnauthorized: true, verifyIdentity: true });
  const ca = '-----BEGIN CERTIFICATE-----\nprueba\n-----END CERTIFICATE-----';
  assert.equal(opcionesSSL({ DB_SSL: 'true', DB_SSL_CA_BASE64: Buffer.from(ca).toString('base64') }).ca, ca);
  assert.throws(() => opcionesSSL({ DB_SSL: 'true', DB_SSL_CA_BASE64: 'invalid' }));
});
test('Modo desplegado sirve React, conserva rutas privadas y no expone archivos locales', async () => {
  process.env.SERVE_FRONTEND = 'true';
  const app = require('../src/app');
  const server = app.listen(0, '127.0.0.1'); await new Promise(r => server.once('listening', r));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    for (const ruta of ['/', '/solicitudes', '/clientes']) {
      const r = await fetch(base + ruta); assert.equal(r.status, 200); assert.match(r.headers.get('content-type'), /text\/html/); assert.match(await r.text(), /<div id="root">/);
    }
    const index = await (await fetch(base)).text();
    const asset = index.match(/src="([^"]+\.js)"/)[1]; const js = await (await fetch(base + asset)).text();
    assert.equal(js.includes('http://127.0.0.1:3000/api'), false);
    assert.equal(js.includes('TWILIO_AUTH_TOKEN'), false);
    for (const ruta of ['/api/desconocida', '/API/desconocida']) assert.equal((await fetch(base + ruta)).status, 404);
    for (const ruta of ['/.env', '/backend/.env', '/.inicio-propietario.json', '/backend/server.js']) {
      const r = await fetch(base + ruta); const body = await r.text(); assert.equal(body.includes('DB_PASSWORD='), false); assert.equal(body.includes('iniciarServidor'), false);
    }
    assert.equal((await fetch(base + '/api/health')).status, 503);
  } finally { await new Promise(r => server.close(r)); delete process.env.SERVE_FRONTEND; }
});
