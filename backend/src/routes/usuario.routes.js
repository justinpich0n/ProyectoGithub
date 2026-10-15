const router = require('express').Router();
const controller = require('../controllers/usuario.controller');
const { idValido } = require('../controllers/validacion');
router.param('id', (req, res, next, id) => {
  if (!idValido(id))
    return res
      .status(400)
      .json({ error: 'El ID debe ser un entero positivo.' });
  next();
});
router.get('/', controller.listar);
router.get('/:id', controller.obtener);
router.post('/', controller.crear);
router.put('/:id', controller.actualizar);
router.delete('/:id', controller.eliminar);
module.exports = router;
