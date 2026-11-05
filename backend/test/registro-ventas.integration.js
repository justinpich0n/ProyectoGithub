const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
require('dotenv').config({ quiet: true });
const db = require('../src/config/database')();
const m = require('../src/models')(db);
const app = require('../src/app');
const { hashPassword, abrirSesion } = require('../src/auth/seguridad');
const prefijo = 'test_reg_' + randomBytes(4).toString('hex') + '_';
const nombres = new Map(Object.values(m).map(x => [x.tableName, prefijo + x.tableName]));
for (const x of Object.values(m)) x.tableName = nombres.get(x.tableName);
for (const x of Object.values(m)) for (const a of Object.values(x.rawAttributes)) if (a.references && nombres.has(a.references.model)) a.references.model = nombres.get(a.references.model);
async function main() {
 let server, total = 0;
 try {
  await db.sync(); app.locals.modelos = m;
  const cuentas = [];
  for (const [i, rol] of ['administrador', 'administrador', 'cajero', 'cajero', 'comprador'].entries()) {
   const u = await m.Usuario.create({ nombre: 'Persona ficticia ' + i, email: `registro${i}@example.com` });
   const c = await m.Cuenta.create({ usuarioId: u.id, rol, passwordHash: await hashPassword('abc123') });
   cuentas.push({ cuenta: c, token: await abrirSesion(m, c.id) });
  }
  await m.ConfiguracionAcceso.create({ id: 1, propietarioCuentaId: cuentas[0].cuenta.id });
  const venta = async (vendedor, fecha, monto, metodo = 'efectivo') => m.Venta.create({ cuentaId: cuentas[vendedor].cuenta.id, operacion: randomUUID(), total: monto, recibido: monto, cambio: '0.00', metodo, detalle: [{ productoId: 1, nombre: 'Producto ficticio', cantidad: 1, precio: monto, subtotal: monto }], createdAt: new Date(fecha), updatedAt: new Date(fecha) });
  await venta(2,'2026-11-05T04:59:59.999Z','1000.00'); // Fuera del día de Colombia.
  await venta(2,'2026-11-05T05:00:00.000Z','2000.00');
  await venta(3,'2026-11-06T04:59:59.999Z','3000.00','movil');
  await venta(3,'2026-11-06T05:00:00.000Z','4000.00'); // Fuera del día.
  server = app.listen(0,'127.0.0.1'); await new Promise(r => server.once('listening',r));
  const pedir = async (ruta, status, token) => {
   const r = await fetch(`http://127.0.0.1:${server.address().port}/api/registro-ventas${ruta}`, { headers: token ? { Authorization: `Bearer ${token}` } : {} });
   const body = await r.json(); assert.equal(r.status,status,JSON.stringify(body)); total++;
   if(status===200)assert.equal(r.headers.get('cache-control'),'no-store');
   return body;
  };
  await pedir('',401);
  await pedir('',403,cuentas[2].token); await pedir('',403,cuentas[3].token); await pedir('',403,cuentas[4].token);
  for (const admin of [cuentas[0],cuentas[1]]) {
   const r = await pedir('',200,admin.token); assert.equal(r.total,4); assert.equal(Number(r.resumen.total),10000);
   assert.deepEqual(new Set(r.ventas.map(v=>v.cuentaId)),new Set([cuentas[2].cuenta.id,cuentas[3].cuenta.id]));
   assert.ok(r.ventas.every(v=>v.vendedor.nombre&&v.vendedor.rol==='cajero'&&!v.passwordHash&&!v.vendedor.passwordHash));
  }
  const dia = await pedir('?desde=2026-11-05&hasta=2026-11-05',200,cuentas[0].token);
  assert.equal(dia.total,2);assert.equal(Number(dia.resumen.total),5000);
  const transferencia = await pedir('?metodo=movil',200,cuentas[0].token);assert.equal(transferencia.total,1);assert.equal(Number(transferencia.resumen.total),3000);
  const vacio = await pedir('?metodo=tarjeta',200,cuentas[0].token);assert.equal(vacio.total,0);assert.equal(Number(vacio.resumen.total),0);
  for(const q of ['?pagina=0','?pagina=1.5','?pagina=10001','?metodo=otro','?desde=2026-02-30','?hasta=hola','?desde=2026-11-06&hasta=2026-11-05']) await pedir(q,400,cuentas[0].token);
  for(let i=0;i<24;i++)await venta(2,'2026-11-05T12:00:00Z','1000.00');
  const uno = await pedir('?pagina=1',200,cuentas[0].token);const dos = await pedir('?pagina=2',200,cuentas[0].token);
  assert.equal(uno.total,28);assert.equal(uno.ventas.length,25);assert.equal(dos.ventas.length,3);
  assert.equal(Number(uno.resumen.total),34000);assert.equal(Number(dos.resumen.total),34000);
  assert.equal(new Set([...uno.ventas,...dos.ventas].map(v=>v.id)).size,28);
  await cuentas[3].cuenta.destroy();
  const historico = await pedir('?metodo=movil',200,cuentas[0].token);assert.equal(historico.ventas[0].vendedor.nombre,'Cuenta histórica');assert.equal(historico.total,1);
  console.log(`${total} pruebas HTTP de registro global correctas: solo administradores, todas las cajas, filtros, hora de Colombia, resúmenes, paginación y cuentas históricas.`);
 } finally {
  if(server)await new Promise(r=>server.close(r));for(const x of Object.values(m))assert.ok(x.tableName.startsWith(prefijo));await db.drop();await db.close();
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
