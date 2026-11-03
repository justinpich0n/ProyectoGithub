// Precarga exclusiva de pruebas: mide hasta consumir el JSON; no registra cuerpos ni credenciales.
const fs = require('node:fs');
const original = global.fetch;
const mediciones = [];
global.fetch = async function (url, opciones) {
  const inicio = performance.now();
  const r = await original(url, opciones);
  const json = r.json.bind(r);
  r.json = async () => {
    const body = await json();
    const ms = performance.now() - inicio;
    const ruta = new URL(url).pathname.replace(/\/\d+(?=\/|$)/g, '/:id');
    mediciones.push({ metodo: opciones?.method || 'GET', ruta, estado: r.status, ms: Number(ms.toFixed(2)) });
    if (ms > 2000) { console.error(`Supera dos segundos: ${ruta} (${ms.toFixed(2)} ms)`); process.exitCode = 1; }
    return body;
  };
  return r;
};
process.on('exit', () => {
  if (process.env.BIZZSTOCK_MEDICIONES) fs.writeFileSync(process.env.BIZZSTOCK_MEDICIONES, JSON.stringify(mediciones, null, 2));
});
