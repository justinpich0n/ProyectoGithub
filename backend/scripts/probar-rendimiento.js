const { spawnSync } = require('node:child_process');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'bizzstock-rnf-'));
const muestras = [];
try {
  for (let ronda = 1; ronda <= 3; ronda++) for (const prueba of ['ppi.integration.js', 'cobro.integration.js']) {
    const salida = path.join(dir, `${ronda}-${prueba}.json`);
    const r = spawnSync(process.execPath, ['--require', './scripts/medir-http.js', `test/${prueba}`], {
      cwd: path.join(__dirname, '..'), encoding: 'utf8', env: { ...process.env, BIZZSTOCK_RENDIMIENTO: '1', BIZZSTOCK_MEDICIONES: salida },
    });
    process.stdout.write(r.stdout || ''); process.stderr.write(r.stderr || '');
    if (r.status !== 0) throw new Error(`Falló ronda ${ronda}: ${prueba}`);
    const filas = JSON.parse(fs.readFileSync(salida)); if (!filas.length) throw new Error('Sin mediciones.');
    muestras.push(...filas.map(f => ({ ronda, prueba, ...f })));
  }
  const orden = muestras.map(x => x.ms).sort((a, b) => a - b);
  const informe = { fecha: new Date().toISOString(), entorno: { plataforma: os.platform(), arquitectura: os.arch(), cpu: os.cpus()[0].model, memoriaGB: Math.round(os.totalmem() / 1024 ** 3), node: process.version }, concurrencia: 1, productosFicticiosPorRondaPPI: 3000, importacionCostos: 500, limiteMs: 2000, cantidad: muestras.length, maximoMs: orden.at(-1), p95Ms: orden[Math.ceil(orden.length * .95) - 1], todasBajoLimite: orden.every(x => x <= 2000), muestras };
  fs.writeFileSync(path.join(__dirname, '../../docs/rendimiento-2026-11-03.json'), JSON.stringify(informe, null, 2) + '\n');
  console.log(JSON.stringify({ cantidad: informe.cantidad, maximoMs: informe.maximoMs, p95Ms: informe.p95Ms, todasBajoLimite: informe.todasBajoLimite }));
} finally { fs.rmSync(dir, { recursive: true, force: true }); }
