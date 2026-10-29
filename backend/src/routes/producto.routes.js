const router = require('express').Router();
const controller = require('../controllers/producto.controller');
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
const { administrador } = require('../auth/seguridad');
router.post('/costos/importar', administrador, controller.importarCostos);
router.post('/', administrador, controller.crear);
router.put('/:id', administrador, controller.actualizar);
router.delete('/:id', administrador, controller.eliminar);
module.exports = router;
