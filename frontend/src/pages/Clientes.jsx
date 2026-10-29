import { useEffect, useState } from 'react';
import api, { mensajeError } from '../services/api';
import { useSesion } from '../services/sesion';
const vacio = { nombre: '', telefono: '', direccion: '' };
export default function Clientes() {
  const { usuario } = useSesion();
  const [form, setForm] = useState(vacio);
  const [id, setId] = useState(null);
  const [q, setQ] = useState('');
  const [filas, setFilas] = useState([]);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      if (usuario.rol !== 'administrador') { setCargando(false); return; }
      setCargando(true); setError('');
      api.get('/clientes', { params: { q }, signal: controller.signal }).then((r) => { if (!controller.signal.aborted) setFilas(r.data); })
        .catch((e) => { if (!controller.signal.aborted) setError(mensajeError(e)); })
        .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [q, revision, usuario.rol]);
  if (usuario.rol !== 'administrador') return <section className="page"><h1>Clientes</h1><p>La gestión de clientes requiere permisos de administrador.</p></section>;
  const campo = (nombre, valor) => setForm((f) => ({ ...f, [nombre]: valor }));
  async function guardar(e) {
    e.preventDefault(); setOcupado(true); setError(''); setAviso('');
    try {
      if (id) await api.put(`/clientes/${id}`, form); else await api.post('/clientes', form);
      setAviso(id ? 'Cliente actualizado.' : 'Cliente registrado.'); setId(null); setForm(vacio); setRevision((v) => v + 1);
    } catch (e) { setError(mensajeError(e)); } finally { setOcupado(false); }
  }
  return <section className="page crud-page"><div className="page-heading"><p className="eyebrow">PERSONAS QUE CONFÍAN EN TU NEGOCIO</p><h1>Clientes, <em>más cerca.</em></h1></div>
    {error && <p role="alert" className="crud-error">{error}</p>}{aviso && <p role="status" className="crud-success">{aviso}</p>}
    <div className="crud-panel"><h2>{id ? 'Editar cliente' : 'Nuevo cliente'}</h2><form onSubmit={guardar}><fieldset disabled={ocupado} className="crud-fields">
      <label>Nombre completo<input required maxLength={255} value={form.nombre} onChange={(e) => campo('nombre', e.target.value)} /></label>
      <label>Teléfono<input type="tel" required maxLength={25} pattern="[+0-9 ()-]{7,25}" value={form.telefono} onChange={(e) => campo('telefono', e.target.value)} aria-describedby="ayuda-telefono" /><small id="ayuda-telefono">Entre 7 y 15 dígitos; puedes incluir prefijo internacional.</small></label>
      <label className="full-field">Dirección<input required maxLength={255} value={form.direccion} onChange={(e) => campo('direccion', e.target.value)} /></label>
      <div className="crud-actions"><button className="crud-primary">{ocupado ? 'Guardando…' : id ? 'Guardar cliente' : 'Crear cliente'}</button>{id && <button type="button" onClick={() => { setId(null); setForm(vacio); }}>Cancelar edición</button>}</div>
    </fieldset></form></div>
    <div className="crud-panel"><label>Buscar clientes por nombre<input type="search" maxLength={100} value={q} onChange={(e) => setQ(e.target.value)} /></label><button onClick={() => setRevision((v) => v + 1)} disabled={cargando}>Actualizar clientes</button>
      {cargando ? <p role="status">Buscando clientes…</p> : !filas.length ? <p role="status">{error ? 'No se pudo consultar. Puedes reintentar.' : 'No se encontraron clientes.'}</p> : <div className="table-scroll" tabIndex={0} role="region" aria-label="Lista de clientes"><table className="crud-table"><thead><tr><th>Nombre</th><th>Teléfono</th><th>Dirección</th><th>Acciones</th></tr></thead><tbody>{filas.map((c) => <tr key={c.id}><td>{c.nombre}</td><td>{c.telefono}</td><td>{c.direccion}</td><td><button aria-label={`Editar cliente ${c.nombre}`} onClick={() => { setId(c.id); setForm({ nombre: c.nombre, telefono: c.telefono, direccion: c.direccion }); setAviso(''); }}>Editar</button></td></tr>)}</tbody></table></div>}
      <p className="crud-note">Se muestran hasta 100 resultados. Usa el nombre para encontrar un cliente. No se registran créditos en esta sección.</p>
    </div>
  </section>;
}
