const { test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../src/app');

test('health comprueba cada consulta, informa fallos sin detalles y se recupera', async () => {
  let queries = 0;
  let fail = false;
  app.locals.pool = {
    async query({ sql }) {
      assert.equal(sql, 'SELECT 1 AS ok');
      queries++;
      if (fail) throw new Error('DATO_PRIVADO_NO_PUBLICAR');
      return [[{ ok: 1 }]];
    },
  };
  const server = app.listen(0, '127.0.0.1');
  await new Promise((resolve) => server.once('listening', resolve));
  const url = `http://127.0.0.1:${server.address().port}/api/health`;

  try {
    let response = await fetch(url);
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.equal((await response.json()).baseDeDatos, 'conectada');

    fail = true;
    response = await fetch(url);
    assert.equal(response.status, 503);
    const failure = await response.text();
    assert.equal(JSON.parse(failure).baseDeDatos, 'no disponible');
    assert.equal(failure.includes('DATO_PRIVADO_NO_PUBLICAR'), false);

    fail = false;
    response = await fetch(url);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).baseDeDatos, 'conectada');
    assert.equal(queries, 3);

    app.locals.pool = null;
    response = await fetch(url);
    assert.equal(response.status, 503);
    assert.equal((await response.json()).baseDeDatos, 'deshabilitada');
  } finally {
    delete app.locals.pool;
    await new Promise((resolve) => server.close(resolve));
  }
});
