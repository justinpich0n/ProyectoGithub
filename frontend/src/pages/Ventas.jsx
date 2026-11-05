import { useEffect, useRef, useState } from 'react';
import api, { mensajeError } from '../services/api';
import './Catalogo.css';
const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP' });
const fecha = valor => new Date(valor).toLocaleString('es-CO', { timeZone: 'America/Bogota' });
export default function Ventas() {
  const [filtros, setFiltros] = useState({ desde: '', hasta: '', metodo: '' });
  const [consulta, setConsulta] = useState({ pagina: 1 });
  const [datos, setDatos] = useState(null);
  const [error, setError] = useState('');
  const [cargando, setCargando] = useState(false);
  const [elegida, setElegida] = useState(null);
  const detalle = useRef(null);
  useEffect(() => {
    const control = new AbortController();
    api.get('/registro-ventas', { params: consulta, signal: control.signal })
      .then(r => { setDatos(r.data); setError(''); })
      .catch(e => { if (!control.signal.aborted) setError(mensajeError(e)); })
      .finally(() => { if (!control.signal.aborted) setCargando(false); });
    return () => control.abort();
  }, [consulta]);
  function consultar(pagina) { setCargando(true); setConsulta({ ...filtros, pagina }); }
  return <section className="page"><p className="eyebrow">CONTROL DEL NEGOCIO</p><h1>Registro de ventas</h1><p>Ventas de todas las cuentas de la tienda. Fechas en hora de Colombia.</p>
    <form className="crud-panel ventas-filtros" onSubmit={e => { e.preventDefault(); consultar(1); }}>
      <label>Desde<input type="date" value={filtros.desde} onChange={e => setFiltros({ ...filtros, desde: e.target.value })} /></label>
      <label>Hasta<input type="date" value={filtros.hasta} min={filtros.desde} onChange={e => setFiltros({ ...filtros, hasta: e.target.value })} /></label>
      <label>Medio de pago<select value={filtros.metodo} onChange={e => setFiltros({ ...filtros, metodo: e.target.value })}><option value="">Todos</option><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="movil">Pago móvil</option></select></label>
      <button className="crud-primary" disabled={cargando}>Consultar</button>
    </form>
    {error && <p className="crud-error" role="alert">{error}</p>}
    {cargando && <p role="status">Consultando ventas…</p>}
    {datos && <><div className="ventas-resumen"><article>Ventas registradas<strong>{datos.total}</strong></article><article>Total vendido<strong>{pesos.format(datos.resumen.total)}</strong></article><article>Cambio entregado<strong>{pesos.format(datos.resumen.cambio)}</strong></article></div>
    <div className="table-scroll"><table className="crud-table"><thead><tr><th>Comprobante</th><th>Fecha</th><th>Cajero</th><th>Cliente</th><th>Medio</th><th>Total</th><th>Detalle</th></tr></thead><tbody>
      {datos.ventas.map(v => <tr key={v.id}><td>#{v.id}</td><td>{fecha(v.createdAt)}</td><td>{v.vendedor.nombre}<small style={{ display: 'block' }}>{v.vendedor.rol}</small></td><td>{v.cliente?.nombre || 'Consumidor final'}</td><td>{v.metodo}</td><td>{pesos.format(v.total)}</td><td><button onClick={() => { setElegida(v); detalle.current.showModal(); }}>Ver comprobante</button></td></tr>)}
    </tbody></table></div>
    {!datos.total && <p>No hay ventas con esos filtros.</p>}
    <div className="crud-actions"><button disabled={cargando || consulta.pagina === 1} onClick={() => { setCargando(true); setConsulta({ ...consulta, pagina: consulta.pagina - 1 }); }}>Anterior</button><span>Página {consulta.pagina}</span><button disabled={cargando || consulta.pagina * 25 >= datos.total} onClick={() => { setCargando(true); setConsulta({ ...consulta, pagina: consulta.pagina + 1 }); }}>Siguiente</button></div></>}
    <dialog ref={detalle} className="ventas-detalle" aria-label="Detalle de la venta"><form method="dialog"><button autoFocus>Cerrar</button></form>{elegida && <><h2>Comprobante #{elegida.id}</h2><p>{fecha(elegida.createdAt)} · {elegida.vendedor.nombre}</p><p>Cliente · {elegida.cliente?.nombre || 'Consumidor final'}</p><ul>{elegida.detalle.map((p, i) => <li key={i}>{p.cantidad} × {p.nombre} · {pesos.format(p.subtotal)}</li>)}</ul><p>Pago · {elegida.metodo}</p><p>Recibido · {pesos.format(elegida.recibido)}</p><p>Cambio · {pesos.format(elegida.cambio)}</p><h3>Total · {pesos.format(elegida.total)}</h3></>}</dialog>
  </section>;
}
