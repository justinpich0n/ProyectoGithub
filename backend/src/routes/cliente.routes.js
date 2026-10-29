const router = require('express').Router();
const c = require('../controllers/cliente.controller');
const { idValido } = require('../controllers/validacion');
router.param('id', (req, res, next, id) => {
  if (!idValido(id)) return res.status(400).json({ error: 'El ID debe ser un entero positivo.' });
  next();
});
router.get('/', c.listar);
router.get('/:id', c.obtener);
router.post('/', c.crear);
router.put('/:id', c.actualizar);
module.exports = router;
