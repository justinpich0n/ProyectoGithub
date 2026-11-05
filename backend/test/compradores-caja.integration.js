const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
const { DataTypes } = require('sequelize');
require('dotenv').config({ quiet: true });
const db = require('../src/config/database')();const m = require('../src/models')(db);const app = require('../src/app');
const { hashPassword, abrirSesion } = require('../src/auth/seguridad');
const preparar = require('../src/config/clientes-cuentas');
const { sincronizarCompradores, asegurarCliente } = require('../src/clientes/vinculo');
const prefijo='test_vinc_'+randomBytes(4).toString('hex')+'_';
const nombres=new Map(Object.values(m).map(x=>[x.tableName,prefijo+x.tableName]));
for(const x of Object.values(m))x.tableName=nombres.get(x.tableName);
for(const x of Object.values(m))for(const a of Object.values(x.rawAttributes))if(a.references&&nombres.has(a.references.model))a.references.model=nombres.get(a.references.model);
async function main(){let server,total=0;try{
 await db.sync();
 // Reproduce el esquema anterior únicamente en la tabla aislada de esta prueba.
 assert.ok(m.Cliente.tableName.startsWith(prefijo));await m.Cliente.drop();
 await db.getQueryInterface().createTable(m.Cliente.tableName,{
  id:{type:DataTypes.INTEGER,primaryKey:true,autoIncrement:true},nombre:{type:DataTypes.STRING,allowNull:false},telefono:{type:DataTypes.STRING(20),allowNull:false,unique:true},direccion:{type:DataTypes.STRING,allowNull:false},createdAt:{type:DataTypes.DATE,allowNull:false},updatedAt:{type:DataTypes.DATE,allowNull:false}
 });
 const ahora=new Date();await db.getQueryInterface().bulkInsert(m.Cliente.tableName,[{nombre:'Cliente manual conservado',telefono:'3000000000',direccion:'Dirección ficticia',createdAt:ahora,updatedAt:ahora}]);
 const anterior=await m.Usuario.create({nombre:'Roberth de prueba',email:'antiguo@example.com'});
 await m.Cuenta.create({usuarioId:anterior.id,rol:'comprador',passwordHash:await hashPassword('abc123')});
 await preparar(m);await preparar(m);
 const manual=await m.Cliente.findOne({where:{telefono:'3000000000'}});assert.equal(manual.nombre,'Cliente manual conservado');assert.equal(manual.direccion,'Dirección ficticia');assert.equal(manual.usuarioId,null);
 const migrado=await m.Cliente.findOne({where:{usuarioId:anterior.id}});assert.ok(migrado);assert.equal(migrado.telefono,null);assert.equal(migrado.direccion,null);assert.equal(await m.Cliente.count(),2);
 const administrador=await m.Usuario.create({nombre:'Administrador ficticio',email:'admin@example.com'});
 const adminCuenta=await m.Cuenta.create({usuarioId:administrador.id,rol:'administrador',passwordHash:await hashPassword('abc123')});
 await m.ConfiguracionAcceso.create({id:1,propietarioCuentaId:adminCuenta.id});
 const cajero=await m.Usuario.create({nombre:'Cajero ficticio',email:'cajero@example.com'});
 const cajeroCuenta=await m.Cuenta.create({usuarioId:cajero.id,rol:'cajero',passwordHash:await hashPassword('abc123')});
 const token=await abrirSesion(m,cajeroCuenta.id),adminToken=await abrirSesion(m,adminCuenta.id);
 const producto=await m.Producto.create({nombre:'Producto ficticio',precio:'12500.00',costo:'8000.00',cantidad:20,usuarioId:administrador.id});
 app.locals.modelos=m;server=app.listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
 async function pedir(method,ruta,datos,status,auth){const r=await fetch(`http://127.0.0.1:${server.address().port}/api${ruta}`,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:`Bearer ${auth}`}:{})},body:datos===undefined?undefined:JSON.stringify(datos)});const b=await r.json();assert.equal(r.status,status,JSON.stringify(b));total++;return b;}
 const nuevo={nombre:'Roberth de prueba',email:'nuevo@example.com',password:'abc123',rol:'comprador'};
 const registro=await pedir('POST','/solicitudes',nuevo,201);const perfil=await m.Cliente.findOne({where:{usuarioId:registro.usuario.id}});assert.ok(perfil);assert.notEqual(perfil.id,migrado.id);
 const resultados=await pedir('GET','/ventas/clientes?q=Rober',undefined,200,token);assert.equal(resultados.length,2);assert.deepEqual(new Set(resultados.map(x=>x.email)),new Set(['antiguo@example.com','nuevo@example.com']));
 const porCorreo=await pedir('GET','/ventas/clientes?q=nuevo%40example.com',undefined,200,token);assert.equal(porCorreo.length,1);assert.equal(porCorreo[0].id,perfil.id);
 assert.equal((await pedir('GET','/ventas/clientes?q=3000000000',undefined,200,token))[0].id,manual.id);
 await pedir('GET','/ventas/clientes?q=Rober',undefined,403,registro.token);await pedir('GET','/clientes',undefined,403,token);
 const venta={operacion:randomUUID(),productos:[{id:producto.id,cantidad:1}],metodo:'efectivo',recibido:'15000.00',clienteId:perfil.id};
 const cobro=await pedir('POST','/ventas',venta,201,token);assert.equal(cobro.cliente.id,perfil.id);assert.equal(cobro.cliente.email,nuevo.email);assert.equal(cobro.total,'12500.00');
 await pedir('POST','/ventas',venta,409,token);
 const ranking=await pedir('GET','/ventas/mejores-compradores',undefined,200,token);assert.equal(ranking.length,1);assert.equal(ranking[0].id,perfil.id);assert.equal(Number(ranking[0].puntos),12);
 const global=await pedir('GET','/registro-ventas',undefined,200,adminToken);assert.equal(global.ventas[0].cliente.id,perfil.id);assert.equal(global.ventas[0].cliente.email,nuevo.email);
 assert.equal((await pedir('GET','/ventas',undefined,200,token))[0].cliente.id,perfil.id);
 await pedir('POST','/ventas',{...venta,operacion:randomUUID(),clienteId:2147483647},400,token);
 await pedir('POST','/solicitudes',nuevo,409);assert.equal(await m.Cliente.count({where:{usuarioId:registro.usuario.id}}),1);
 await Promise.all([sincronizarCompradores(m),sincronizarCompradores(m),asegurarCliente(m,anterior)]);assert.equal(await m.Cliente.count(),3);assert.equal(await m.Venta.count(),1);
 const actualizado=await pedir('PUT','/clientes/'+perfil.id,{nombre:nuevo.nombre,telefono:'3000000001',direccion:'Prueba'},200,adminToken);assert.equal(actualizado.usuarioId,registro.usuario.id);
 await anterior.destroy();await migrado.reload();assert.equal(migrado.usuarioId,null);assert.equal(await m.Cliente.count(),3);
 console.log(`${total} pruebas HTTP de comprador → cliente → cobro → puntos correctas; migración del esquema anterior, preservación, duplicados y sincronización concurrente verificadas con tablas aisladas.`);
}finally{if(server)await new Promise(r=>server.close(r));for(const x of Object.values(m))assert.ok(x.tableName.startsWith(prefijo));await db.drop();await db.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
