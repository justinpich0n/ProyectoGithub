const router = require('express').Router();
const c = require('../controllers/cliente.controller');
const { idValido } = require('../controllers/validacion');
router.param('id', (req, res, next, id) => {
  if (!idValido(id)) return res.status(400).json({ error: 'El ID debe ser un entero positivo.' });
  next();
});
router.get('/', c.listar);
router.get('/:id/compras', async (req, res) => {
  const pagina = Number(req.query.pagina || 1);
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 10000) require('../controllers/validacion').invalido('Página inválida.');
  const cliente = await req.app.locals.modelos.Cliente.findByPk(req.params.id);
  if (!cliente) return res.status(404).json({ error: 'Cliente no encontrado.' });
  res.set('Cache-Control', 'no-store');
  res.json(await require('../clientes/fidelidad').perfilCompras(req.app.locals.modelos, cliente, pagina));
});
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
module.exports = router;
