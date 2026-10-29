import { useState } from 'react';
import api, { mensajeError } from '../services/api';
export default function ImportarCostos({ actualizado }) {
  const [filas, setFilas] = useState([]);
  const [cero, setCero] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  async function leer(e) {
    setFilas([]); setError(''); setAviso(''); setCero(false);
    const file = e.target.files[0]; if (!file) return;
    if (file.size > 65536) { setError('El archivo debe ocupar máximo 64 KB.'); return; }
    try {
      const lines = (await file.text()).trim().replace(/^\uFEFF/, '').split(/\r?\n/);
      const separador = lines[0].includes(';') ? ';' : ',';
      if (lines[0].toLowerCase() !== `id${separador}costo`) throw new Error('La cabecera debe ser id,costo o id;costo. Usa punto para los decimales.');
      const datos = lines.slice(1).map((linea) => {
        const c = linea.split(separador).map((x) => x.trim());
        if (c.length !== 2 || !/^[1-9]\d*$/.test(c[0]) || !/^\d{1,8}(\.\d{1,2})?$/.test(c[1])) throw new Error('Revisa los IDs y los costos de cada fila.');
        return { id: Number(c[0]), costo: c[1] };
      });
      if (!datos.length || datos.length > 500) throw new Error('Incluye entre 1 y 500 filas.');
      if (new Set(datos.map((x) => x.id)).size !== datos.length) throw new Error('Hay IDs repetidos.');
      setFilas(datos);
    } catch (e) { setError(e.message); }
  }
  async function importar(e) {
    e.preventDefault(); setOcupado(true); setError(''); setAviso('');
    try {
      const { data } = await api.post('/productos/costos/importar', { filas, confirmarCostoCero: cero });
      const advertencias = data.productos.flatMap((p) => p.advertencias.map((a) => `#${p.id}: ${a}`));
      setAviso([data.mensaje, ...advertencias].join(' ')); setFilas([]); await actualizado();
    } catch (e) { setError(mensajeError(e)); } finally { setOcupado(false); }
  }
  return <details className="crud-panel"><summary>Actualizar costos desde un archivo</summary><p>CSV con cabecera id,costo, una fila por producto existente y punto decimal. Hasta 500 filas. Se guardan todas o ninguna.</p>
    <form onSubmit={importar}><label>Archivo de costos<input type="file" accept=".csv,text/csv" onChange={leer} disabled={ocupado} /></label>
      {!!filas.length && <p>{filas.length} costos listos para importar.</p>}
      {filas.some((f) => Number(f.costo) === 0) && <label className="check-line"><input type="checkbox" checked={cero} onChange={(e) => setCero(e.target.checked)} />Confirmo los costos cero del archivo</label>}
      <button disabled={ocupado || !filas.length || (filas.some((f) => Number(f.costo) === 0) && !cero)}>Actualizar costos</button></form>
    {error && <p role="alert" className="crud-error">{error}</p>}{aviso && <p role="status" className="crud-success">{aviso}</p>}
  </details>;
}
