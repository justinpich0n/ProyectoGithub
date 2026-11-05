import { useEffect, useState } from 'react';
import api, { mensajeError } from '../services/api';
const precio = valor => Number(valor).toLocaleString('es-CO', { style: 'currency', currency: 'COP' });
export default function Catalogo() {
  const [q, setQ] = useState('');
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(true);
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setCargando(true); setError('');
      api.get('/productos', { signal: controller.signal, params: { q } })
        .then(r => { if (!controller.signal.aborted) setProductos(r.data); })
        .catch(e => { if (!controller.signal.aborted) setError(mensajeError(e)); })
        .finally(() => { if (!controller.signal.aborted) setCargando(false); });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [q]);
  return <section className="page"><p className="eyebrow">TU TIENDA, A UN CLIC</p><h1>Catálogo de productos</h1><p>Consulta los productos y sus precios. Para comprar, acércate a la caja del negocio.</p><label>Buscar por nombre<input type="search" maxLength={100} value={q} onChange={e => setQ(e.target.value)} /></label>{error && <p className="crud-error" role="alert">{error}</p>}{cargando ? <p role="status">Cargando productos…</p> : <><p role="status">{productos.length ? `${productos.length} productos encontrados` : 'No encontramos productos con ese nombre.'}</p><div className="buyer-catalog">{productos.map(p => <article className="crud-panel" key={p.id}><h2>{p.nombre}</h2><strong>{precio(p.precio)}</strong>{p.descripcion && <p>{p.descripcion}</p>}<p>{p.cantidad === null ? 'Consulta disponibilidad en caja' : p.cantidad > 0 ? `Disponibles: ${p.cantidad}` : 'Agotado'}</p></article>)}</div></>}</section>;
}
