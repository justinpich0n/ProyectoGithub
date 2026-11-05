async function asegurarCliente(m, usuario, transaction) {
  const [cliente] = await m.Cliente.findOrCreate({
    where: { usuarioId: usuario.id }, defaults: { nombre: usuario.nombre }, transaction,
  });
  return cliente;
}
async function sincronizarCompradores(m) {
  const cuentas = await m.Cuenta.findAll({ where: { rol: 'comprador' }, attributes: ['id', 'usuarioId'], include: { model: m.Usuario, attributes: ['id', 'nombre'] } });
  for (const cuenta of cuentas) if (cuenta.Usuario) await asegurarCliente(m, cuenta.Usuario);
}
module.exports = { asegurarCliente, sincronizarCompradores };
