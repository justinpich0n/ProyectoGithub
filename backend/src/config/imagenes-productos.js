module.exports = function imagenProducto(nombre) {
  const texto = nombre.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const categorias = [
    ['cinta', 'cinta'], ['esfero|boligrafo', 'esfero'], ['lapiz', 'lapiz'],
    ['cuaderno', 'cuaderno'], ['marcador', 'marcador'], ['resaltador', 'resaltador'],
    ['tijera', 'tijeras'], ['pegante', 'pegante'], ['carpeta', 'carpeta'],
    ['papel regalo', 'regalo'], ['bolsa', 'bolsa'], ['pila', 'pilas'],
    ['llavero', 'llavero'], ['regla', 'regla'], ['borrador', 'borrador'],
    ['plastilina', 'plastilina'],
  ];
  const categoria = categorias.find(([patron]) => new RegExp(patron).test(texto))?.[1];
  return categoria ? `/productos/${categoria}.jpg` : '/productos/producto.svg';
};
