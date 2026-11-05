import { useEffect, useState } from 'react';
import api, { mensajeError } from '../services/api';
import ImagenProducto from '../components/ImagenProducto';
import './Catalogo.css';
const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
export default function Catalogo() {
  const [q, setQ] = useState('');
  const [pagina, setPagina] = useState(1);
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    const control = new AbortController();
    const timer = setTimeout(() => {
      setCargando(true);
      api.get('/catalogo', { params: { q, pagina }, signal: control.signal })
        .then(r => { setDatos(r.data); setError(''); })
        .catch(e => { if (!control.signal.aborted) setError(mensajeError(e)); })
        .finally(() => { if (!control.signal.aborted) setCargando(false); });
    }, 200);
    return () => { clearTimeout(timer); control.abort(); };
  }, [q, pagina]);
  return <section className="page">
    <p className="eyebrow">BIZZSTOCK · CATÁLOGO</p><h1>Encuentra lo que necesitas</h1>
    {datos?.tienda && <aside className="crud-panel tienda-info"><h2>{datos.tienda.nombre}</h2><p>{datos.tienda.ubicacion}</p><p>{datos.tienda.direccion}</p><a href={datos.tienda.mapa} target="_blank" rel="noreferrer">Ver ubicación en el mapa ↗</a></aside>}
    <label>Buscar productos<input type="search" maxLength={100} value={q} onChange={e => { setQ(e.target.value); setPagina(1); }} /></label>
    {error && <p role="alert" className="crud-error">{error}</p>}
    {cargando ? <p role="status">Consultando catálogo…</p> : <div className="catalogo-grid">{datos?.productos.map(p => <article className="producto-tarjeta" key={p.id}>
      <ImagenProducto producto={p} /><div><h2>{p.nombre}</h2><strong>{pesos.format(p.precio)}</strong>
      <p>{p.cantidad === null ? 'Disponibilidad por confirmar' : p.cantidad > 0 ? `Disponible · ${p.cantidad} unidades registradas` : 'Agotado'}</p>
      <p>{p.descripcion}</p><small>Campus Robledo · Tienda de demostración</small></div>
    </article>)}</div>}
    {!cargando && datos?.total === 0 && <p>No hay productos con esa búsqueda.</p>}
    <div className="crud-actions"><button disabled={cargando || pagina === 1} onClick={() => setPagina(p => p - 1)}>Anterior</button><span>Página {pagina}</span><button disabled={cargando || !datos || pagina * 24 >= datos.total} onClick={() => setPagina(p => p + 1)}>Siguiente</button></div>
  </section>;
}
