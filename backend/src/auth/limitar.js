// Límites en memoria para esta instancia. Un despliegue con varias réplicas debe compartirlos.
function limitar(mapa, maximo, ventana) {
  return (req, res, next) => {
    const ahora = Date.now();
    for (const [k, v] of mapa) if (v.expira <= ahora) mapa.delete(k);
    if (!mapa.has(req.ip) && mapa.size >= 10000) return res.status(429).json({ error: 'Hay demasiadas solicitudes. Intenta más tarde.' });
    const estado = mapa.get(req.ip) || { cantidad: 0, expira: ahora + ventana };
    if (estado.cantidad >= maximo) return res.status(429).json({ error: 'Demasiadas solicitudes. Espera antes de volver a intentarlo.' });
    estado.cantidad++; mapa.set(req.ip, estado); next();
  };
}
module.exports = { limitar };
