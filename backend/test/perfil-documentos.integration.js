process.env.BIZZSTOCK_DOCUMENTO_KEY ||= require('node:crypto').randomBytes(32).toString('hex');
const assert = require('node:assert/strict');
const { randomBytes, randomUUID } = require('node:crypto');
const { DataTypes } = require('sequelize');
require('dotenv').config({ quiet: true });
const db = require('../src/config/database')();const m = require('../src/models')(db);const app = require('../src/app');
const { hashPassword, abrirSesion } = require('../src/auth/seguridad');
const preparar = require('../src/config/clientes-cuentas');
const { sincronizarCompradores, asegurarCliente } = require('../src/clientes/vinculo');
const prefijo='test_pd_'+randomBytes(4).toString('hex')+'_';
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
 const qi=db.getQueryInterface();
 for(const modelo of [m.Cuenta,m.SolicitudCuenta]){
  for(const i of await qi.showIndex(modelo.tableName))if(i.fields.some(f=>f.attribute==='documentoHash'))await qi.removeIndex(modelo.tableName,i.name);
  for(const campo of ['tipoDocumento','documentoCifrado','documentoHash'])await qi.removeColumn(modelo.tableName,campo);
 }
 await require('../src/config/documentos')(m);await require('../src/config/documentos')(m);
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
 async function pedir(method,ruta,datos,status,auth){if(method==='POST'&&ruta==='/solicitudes')datos={tipoDocumento:'CC',numeroDocumento:'9000000000000081',...datos};const r=await fetch(`http://127.0.0.1:${server.address().port}/api${ruta}`,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:`Bearer ${auth}`}:{})},body:datos===undefined?undefined:JSON.stringify(datos)});const b=await r.json();assert.equal(r.status,status,JSON.stringify(b));total++;return b;}
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
 // Perfil del comprador: puntos derivados de las ventas, solo propios.
 let propio=await pedir('GET','/mi-perfil',undefined,200,registro.token);
 assert.equal(propio.resumen.puntos,12);assert.equal(propio.resumen.compras,1);assert.equal(propio.compras[0].puntosGanados,12);
 assert.equal(propio.cliente.email,nuevo.email);assert.equal(JSON.stringify(propio).includes('documento'),false);assert.equal(JSON.stringify(propio).includes('cuentaId'),false);
 const ajeno=await pedir('POST','/auth/login',{email:anterior.email,password:'abc123'},200);
 assert.equal((await pedir('GET','/mi-perfil',undefined,200,ajeno.token)).resumen.puntos,0);
 assert.equal((await pedir('GET','/mi-perfil?clienteId='+migrado.id,undefined,200,registro.token)).cliente.email,nuevo.email);
 await pedir('GET','/mi-perfil',undefined,401);await pedir('GET','/mi-perfil',undefined,403,token);await pedir('GET','/mi-perfil',undefined,403,adminToken);
 await pedir('GET',`/clientes/${perfil.id}/compras`,undefined,403,ajeno.token);await pedir('GET',`/clientes/${perfil.id}/compras`,undefined,403,token);
 assert.equal((await pedir('GET',`/clientes/${perfil.id}/compras`,undefined,200,adminToken)).resumen.puntos,12);
 await pedir('GET','/mi-perfil?pagina=0',undefined,400,registro.token);
 for(let i=0;i<16;i++)await m.Venta.create({...cobro,id:undefined,operacion:randomUUID(),cuentaId:cajeroCuenta.id,cliente:{id:perfil.id,nombre:nuevo.nombre},total:'1000.00',recibido:'1000.00',cambio:'0.00',detalle:[{nombre:'Prueba',cantidad:1,precio:'1000.00',subtotal:'1000.00'}]});
 const uno=await pedir('GET','/mi-perfil',undefined,200,registro.token),dos=await pedir('GET','/mi-perfil?pagina=2',undefined,200,registro.token);
 assert.equal(uno.total,17);assert.equal(uno.compras.length,15);assert.equal(dos.compras.length,2);assert.equal(dos.resumen.puntos,28);
 // Cuenta anterior: completar documento una vez y conservarlo en nuevas sesiones.
 const doc={tipoDocumento:'CC',numeroDocumento:'9000000000000101'};
 assert.equal(ajeno.usuario.faltaDocumento,true);
 await pedir('POST','/auth/documento',doc,401);await pedir('POST','/auth/documento',{tipoDocumento:'CC',numeroDocumento:'abc'},400,ajeno.token);
 await pedir('POST','/auth/documento',doc,200,ajeno.token);await pedir('POST','/auth/documento',doc,200,ajeno.token);
 assert.equal((await pedir('GET','/auth/sesion',undefined,200,ajeno.token)).faltaDocumento,false);
 await pedir('POST','/auth/logout',{},200,ajeno.token);
 const reingreso=await pedir('POST','/auth/login',{email:anterior.email,password:'abc123'},200);assert.equal(reingreso.usuario.faltaDocumento,false);
 await pedir('POST','/auth/documento',{...doc,numeroDocumento:'9000000000000102'},409,reingreso.token);
 await pedir('POST','/auth/documento',doc,409,token);
 const guardada=await m.Cuenta.findOne({where:{usuarioId:anterior.id}});
 assert.equal(require('../src/auth/documento').leerNumero(guardada.documentoCifrado),doc.numeroDocumento);assert.notEqual(guardada.documentoCifrado,doc.numeroDocumento);
 // Documento duplicado entre roles, normalización y solicitudes pendientes.
 await pedir('POST','/solicitudes',{...nuevo,email:'sin-doc@example.com',tipoDocumento:null,numeroDocumento:null},400);
 await pedir('POST','/solicitudes',{...nuevo,email:'tipo-invalido@example.com',tipoDocumento:'OTRO'},400);
 await pedir('POST','/solicitudes',{...nuevo,email:'dupedoc@example.com',tipoDocumento:'CE',numeroDocumento:'09000000000000101'},409);
 const pendiente={...nuevo,email:'pendiente@example.com',rol:'cajero',tipoDocumento:'CC',numeroDocumento:'9000000000000103'};
 await pedir('POST','/solicitudes',pendiente,202);await pedir('POST','/solicitudes',{...pendiente,email:'dupepend@example.com',rol:'comprador'},409);
 const solicitud=await m.SolicitudCuenta.findOne({where:{emailPendiente:pendiente.email}});
 await pedir('POST',`/solicitudes/${solicitud.id}/decision`,{decision:'aprobar',rol:'cajero'},200,adminToken);
 assert.equal((await pedir('POST','/auth/login',{email:pendiente.email,password:nuevo.password},200)).usuario.faltaDocumento,false);
 await pedir('POST','/cuentas',{...nuevo,email:'panel-pd@example.com',tipoDocumento:'CC',numeroDocumento:'9000000000000104'},201,adminToken);
 await pedir('POST','/cuentas',{...nuevo,email:'panel-dupe@example.com',tipoDocumento:'CC',numeroDocumento:'9000000000000104'},409,adminToken);
 const carrera=await Promise.all(['carrera1@example.com','carrera2@example.com'].map(async email=>{
  const r=await fetch(`http://127.0.0.1:${server.address().port}/api/solicitudes`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...nuevo,email,tipoDocumento:'CC',numeroDocumento:'9000000000000105'})});total++;return r.status;
 }));assert.deepEqual(carrera.sort(),[201,409]);
 const lista=await pedir('GET','/usuarios',undefined,200,adminToken);assert.equal(lista.find(u=>u.id===anterior.id).numeroDocumento,doc.numeroDocumento);assert.equal(JSON.stringify(lista).includes('documentoHash'),false);assert.equal(JSON.stringify(lista).includes('passwordHash'),false);
 const otroAdmin=await m.Usuario.create({nombre:'Otro administrador ficticio',email:'otro-admin@example.com'});
 const otraCuenta=await m.Cuenta.create({usuarioId:otroAdmin.id,rol:'administrador',passwordHash:await hashPassword('abc123')});const otroToken=await abrirSesion(m,otraCuenta.id);
 assert.ok((await pedir('GET','/usuarios',undefined,200,otroToken)).every(u=>u.numeroDocumento===null));
 const clave=process.env.BIZZSTOCK_DOCUMENTO_KEY;delete process.env.BIZZSTOCK_DOCUMENTO_KEY;
 await pedir('POST','/auth/documento',{tipoDocumento:'CC',numeroDocumento:'9000000000000106'},503,adminToken);process.env.BIZZSTOCK_DOCUMENTO_KEY=clave;
 const actualizado=await pedir('PUT','/clientes/'+perfil.id,{nombre:nuevo.nombre,telefono:'3000000001',direccion:'Prueba'},200,adminToken);assert.equal(actualizado.usuarioId,registro.usuario.id);
 const cantidadAntes=await m.Cliente.count();await anterior.destroy();await migrado.reload();assert.equal(migrado.usuarioId,null);assert.equal(await m.Cliente.count(),cantidadAntes);
 console.log(`${total} pruebas HTTP de perfil propio, puntos, documentos persistentes, migración, duplicados concurrentes, aprobación y privacidad correctas con tablas aisladas.`);
}finally{if(server)await new Promise(r=>server.close(r));for(const x of Object.values(m))assert.ok(x.tableName.startsWith(prefijo));await db.drop();await db.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
