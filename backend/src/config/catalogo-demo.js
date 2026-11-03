const productos = [
  ['Cuaderno cuadriculado', 6500, 4200, 30],
  ['Esfero azul', 1500, 800, 80],
  ['Lápiz HB', 1000, 500, 60],
  ['Marcador permanente negro', 4200, 2400, 25],
  ['Resaltador amarillo', 3500, 1900, 24],
  ['Tijeras escolares', 5800, 3200, 18],
  ['Pegante en barra', 3900, 2200, 28],
  ['Cinta adhesiva transparente', 2800, 1400, 35],
  ['Carpeta oficio', 2300, 1100, 40],
  ['Papel regalo', 2500, 1200, 32],
  ['Bolsas de regalo', 4500, 2400, 20],
  ['Pilas AA x2', 6200, 3800, 26],
  ['Llavero de colores', 4800, 2400, 16],
  ['Regla de 30 cm', 2200, 950, 25],
  ['Borrador blanco', 1200, 600, 40],
  ['Plastilina de 6 colores', 5600, 2900, 21],
];

module.exports = async function cargarCatalogoDemo({ Usuario, Producto }) {
  return Producto.sequelize.transaction(async (transaction) => {
    const [responsable] = await Usuario.findOrCreate({
      where: { email: 'catalogo-feria@example.invalid' },
      defaults: { nombre: 'Catálogo de feria' },
      transaction,
    });
    await responsable.reload({ transaction, lock: transaction.LOCK.UPDATE });
    const existentes = await Producto.findAll({
      where: { usuarioId: responsable.id },
      attributes: ['nombre'],
      transaction,
      lock: transaction.LOCK.UPDATE,
    });
    const nombres = new Set(existentes.map((producto) => producto.nombre));
    const nuevos = productos.filter(([nombre]) => !nombres.has(nombre));
    await Producto.bulkCreate(nuevos.map(([nombre, precio, costo, cantidad]) => ({
      nombre, precio, costo, cantidad, usuarioId: responsable.id,
      descripcion: 'Producto ficticio de la feria BizzStock',
    })), { transaction });
    return nuevos.length;
  });
};
