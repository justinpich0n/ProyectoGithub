require('dotenv').config({ quiet: true });
const readline = require('node:readline/promises');
const crearSequelize = require('../src/config/database');
const crearModelos = require('../src/models');
const { hashPassword } = require('../src/auth/seguridad');
async function main() {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  const sequelize = crearSequelize();
  try {
    const modelos = crearModelos(sequelize);
    await require('../src/config/esquema')(sequelize); await sequelize.sync();
    const nombre = (await rl.question('Nombre: ')).trim();
    const email = (await rl.question('Correo: ')).trim().toLowerCase();
    const rol = (await rl.question('Rol (administrador/cajero): ')).trim();
    if (!nombre || !/^\S+@\S+\.\S+$/.test(email) || !['administrador', 'cajero'].includes(rol)) throw new Error('Revisa nombre, correo y rol.');
    // No recibir contraseña como argumento ni mostrarla al escribir.
    rl.close();
    const password = await new Promise((resolve, reject) => {
      if (!process.stdin.isTTY) return reject(new Error('Ejecuta este asistente en una terminal interactiva.'));
      process.stdout.write('Contraseña nueva (6 a 128 caracteres, no se muestra): ');
      let valor = '';
      process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.setEncoding('utf8');
      const leer = (s) => {
        if (s.includes('\u0003')) { limpiar(); reject(new Error('Cancelado.')); }
        else if (s.includes('\r') || s.includes('\n')) { limpiar(); resolve(valor); }
        else if (s === '\u007f') valor = valor.slice(0, -1);
        else if (valor.length + s.length <= 128) valor += s;
      };
      function limpiar() { process.stdin.off('data', leer); process.stdin.setRawMode(false); process.stdin.pause(); process.stdout.write('\n'); }
      process.stdin.on('data', leer);
    });
    const passwordHash = await hashPassword(password);
    await sequelize.transaction(async (transaction) => {
      const [usuario] = await modelos.Usuario.findOrCreate({ where: { email }, defaults: { nombre }, transaction });
      if (await modelos.Cuenta.findOne({ where: { usuarioId: usuario.id }, transaction })) throw new Error('La cuenta ya existe. No se sobrescriben sus credenciales.');
      await modelos.Cuenta.create({ usuarioId: usuario.id, passwordHash, rol }, { transaction });
    });
    console.log('Cuenta creada. Ya puedes iniciar sesión en BizzStock.');
  } finally { rl.close(); await sequelize.close(); }
}
main().catch(() => { console.error('No se creó la cuenta. Revisa los datos, la conexión y que no exista previamente.'); process.exitCode = 1; });
