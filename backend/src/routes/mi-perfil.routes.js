const router = require('express').Router();
const { asegurarCliente, perfilCompras } = require('../clientes/fidelidad');
const { invalido } = require('../controllers/validacion');
router.get('/', async (req, res) => {
  if (req.cuenta.rol !== 'comprador') return res.status(403).json({ error: 'Este perfil es para cuentas de comprador.' });
  const pagina = Number(req.query.pagina || 1);
  if (!Number.isInteger(pagina) || pagina < 1 || pagina > 10000) invalido('Página inválida.');
  const m = req.app.locals.modelos;
  const cliente = await asegurarCliente(m, req.cuenta.Usuario);
  res.set('Cache-Control', 'no-store');
  res.json(await perfilCompras(m, cliente, pagina));
});
module.exports = router;
