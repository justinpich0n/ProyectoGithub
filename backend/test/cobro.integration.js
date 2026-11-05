process.env.BIZZSTOCK_DOCUMENTO_KEY ||= require('node:crypto').randomBytes(32).toString('hex');
const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
require('dotenv').config({ quiet: true });
const db = require('../src/config/database')(); const m = require('../src/models')(db); const app = require('../src/app');
const { hashPassword } = require('../src/auth/seguridad');

  const prefijoTablas = 'test_regresion_' + require('node:crypto').randomBytes(4).toString('hex') + '_';
  const nombresTablas = new Map(Object.values(m).map(x => [x.tableName, prefijoTablas + x.tableName]));
  for (const x of Object.values(m)) x.tableName = nombresTablas.get(x.tableName);
  for (const x of Object.values(m)) for (const a of Object.values(x.rawAttributes)) if (a.references && nombresTablas.has(a.references.model)) a.references.model = nombresTablas.get(a.references.model);
async function main() {
 let server; const usuarios = []; const ventas = []; const clientes = []; const productos = []; let total = 0; const marca = randomUUID();
 const { DataTypes } = require('sequelize');
 const config = db.define('ConfigPrueba', { id: { type: DataTypes.INTEGER, primaryKey: true }, propietarioCuentaId: DataTypes.INTEGER }, { tableName: 'test_owner_' + marca.replace(/-/g, '').slice(0, 12), timestamps: false });
 m.ConfiguracionAcceso = config;
 try {
  await db.sync(); app.locals.modelos = m;
  for (const rol of ['administrador','cajero']) { const u = await m.Usuario.create({ nombre: 'Prueba ficticia', email: `${rol}-${marca}@example.com` }); usuarios.push(u.id); await m.Cuenta.create({usuarioId:u.id,rol,passwordHash:await hashPassword('abc123')}); }
  const propietario = await m.Cuenta.findOne({ where: { usuarioId: usuarios[0] } }); await config.create({ id: 1, propietarioCuentaId: propietario.id });
  server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
  async function pedir(ruta,datos,status,token) { const r=await fetch(`http://127.0.0.1:${server.address().port}/api${ruta}`,{method:datos === undefined ? 'GET' : 'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:`Bearer ${token}`}:{})},body:JSON.stringify(datos)}); const b=await r.json();assert.equal(r.status,status,JSON.stringify(b));total++;return b; }
  const admin=(await pedir('/auth/login',{email:`administrador-${marca}@example.com`,password:'abc123'},200)).token;
  const cajero=(await pedir('/auth/login',{email:`cajero-${marca}@example.com`,password:'abc123'},200)).token;
  const cuenta={nombre:'Cuenta ficticia',email:`nueva-${marca}@example.com`,password:'abcdef',rol:'cajero',tipoDocumento:'CC',numeroDocumento:'9000000000000301'};
  await pedir('/cuentas',cuenta,401);await pedir('/cuentas',cuenta,403,cajero);await pedir('/cuentas',{...cuenta,password:'12345'},400,admin);await pedir('/cuentas',cuenta,201,admin);
  usuarios.push((await m.Usuario.findOne({where:{email:cuenta.email}})).id);
  await pedir('/cuentas',cuenta,409,admin);await pedir('/auth/login',{email:cuenta.email,password:cuenta.password},200);
  const producto=await m.Producto.create({nombre:'Producto ficticio',precio:'10.25',costo:'5.00',cantidad:10,usuarioId:usuarios[0]});productos.push(producto.id);
  const datos=()=>({operacion:randomUUID(),productos:[{id:producto.id,cantidad:2}],metodo:'efectivo',recibido:'25.00'});
  await pedir('/ventas',datos(),401);
  for(const alterar of [x=>{x.recibido='1';},x=>{x.recibido='-1';},x=>{x.recibido='20.501';},x=>{x.metodo='';},x=>{x.productos[0].cantidad=0;},x=>{x.productos=[];},x=>{x.productos.push(x.productos[0]);},x=>{x.productos[0].id=2147483647;},x=>{x.total='0';x.recibido='0';}]){const d=datos();alterar(d);await pedir('/ventas',d,400,cajero);}
  const d=datos();const v=await pedir('/ventas',d,201,cajero);ventas.push(v.id);assert.equal(v.total,'20.50');assert.equal(v.cambio,'4.50');await pedir('/ventas',d,409,cajero);
  for(const metodo of ['efectivo','tarjeta','movil']){const v=await pedir('/ventas',{...datos(),metodo,recibido:'20.50'},201,admin);ventas.push(v.id);assert.equal(v.cambio,'0.00');assert.equal((await m.Venta.findByPk(v.id)).metodo,metodo);}
  const cliente = await m.Cliente.create({ nombre: `Cliente ${marca}`, telefono: String(Date.now()), direccion: 'Dirección de prueba' });
  clientes.push(cliente.id);
  const encontrados = await pedir('/ventas/clientes?q=' + marca, undefined, 200, cajero);
  assert.deepEqual(encontrados, [{ id: cliente.id, nombre: cliente.nombre, telefono: cliente.telefono }]);
  await pedir('/ventas', { ...datos(), clienteId: -1 }, 400, cajero);
  for (let i = 0; i < 15; i++) {
   const comprobante = await pedir('/ventas', { ...datos(), clienteId: cliente.id }, 201, cajero);
   ventas.push(comprobante.id);
  }
  await cliente.update({ nombre: 'Nombre actualizado' });
  const recientes = await pedir('/ventas', undefined, 200, cajero);
  assert.equal(recientes.length, 15);
  assert.deepEqual(recientes.map((item) => item.id), ventas.slice(-15).reverse());
  assert.deepEqual(recientes[0].cliente, encontrados[0]);
  assert.equal((await m.Venta.findByPk(v.id)).cliente, null);
  assert.equal((await pedir('/ventas', undefined, 200, admin)).length, 3);
  await pedir('/ventas', undefined, 401);
  const registrado = await pedir('/ventas/clientes', {
    nombre: `Cliente de caja ${marca}`, telefono: String(Date.now() + 1), direccion: 'Dirección de prueba',
  }, 201, cajero);
  clientes.push(registrado.id);
  await producto.update({ precio: '6250.00' });
  const compraConPuntos = { ...datos(), recibido: '12500.00', clienteId: registrado.id };
  ventas.push((await pedir('/ventas', compraConPuntos, 201, cajero)).id);
  await pedir('/ventas', compraConPuntos, 409, cajero);
  const ranking = await pedir('/ventas/mejores-compradores', undefined, 200, cajero);
  assert.equal(Number(ranking.find((fila) => fila.id === registrado.id)?.puntos), 12);
  assert.ok(!ranking.some((fila) => fila.id === cliente.id));
  await pedir('/ventas',{...datos(),metodo:'tarjeta'},400,admin);
  assert.equal((await m.Producto.findByPk(producto.id)).cantidad,10);
  console.log(`${total} pruebas HTTP correctas: cuentas, permisos, montos, cambio, métodos, duplicados y persistencia.`);
 } finally {if(server) await new Promise(r=>server.close(r));await m.Venta.destroy({where:{id:ventas}});await m.Cliente.destroy({where:{id:clientes}});await m.Producto.destroy({where:{id:productos}});await m.Cuenta.destroy({where:{usuarioId:usuarios}});await m.Usuario.destroy({where:{id:usuarios}});await config.drop();for(const x of Object.values(m))if(x!==config)assert.ok(x.tableName.startsWith(prefijoTablas));await db.drop();await db.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
