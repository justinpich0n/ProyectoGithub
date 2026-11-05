const router = require('express').Router();
const { Op } = require('sequelize');
const { invalido } = require('../controllers/validacion');
router.get('/', async (req, res) => {
  const q = req.query.q || '';
  if (typeof q !== 'string' || q.length > 100) invalido('La búsqueda admite hasta 100 caracteres.');
  const pagina = Number(req.query.pagina || 1);
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 10000) invalido('Página inválida.');
  const { count, rows } = await req.app.locals.modelos.Producto.findAndCountAll({
    attributes: ['id', 'nombre', 'precio', 'cantidad', 'descripcion', 'imagen'],
    where: q.trim() ? { nombre: { [Op.like]: '%' + q.trim().replace(/[\\%_]/g, '\\$&') + '%' } } : {},
    order: [['nombre', 'ASC'], ['id', 'ASC']], limit: 24, offset: (pagina - 1) * 24,
  });
  res.json({
    productos: rows, total: count, pagina,
    tienda: {
      nombre: 'BizzStock · Tienda de demostración',
      ubicacion: 'Tecnológico de Antioquia · Campus Robledo',
      direccion: 'Calle 78B No. 72A–220, Medellín, Colombia',
      mapa: 'https://www.google.com/maps/search/?api=1&query=Tecnol%C3%B3gico%20de%20Antioquia%20Calle%2078B%2072A%20220%20Medell%C3%ADn',
    },
  });
});
module.exports = router;
