import { useEffect, useState } from 'react';
import api, { mensajeError } from '../services/api';
export default function Cobro() {
  const [q, setQ] = useState(''); const [opciones, setOpciones] = useState([]); const [carrito, setCarrito] = useState([]);
  const [metodo, setMetodo] = useState(''); const [recibido, setRecibido] = useState(''); const [error, setError] = useState(''); const [venta, setVenta] = useState(null); const [ocupado, setOcupado] = useState(false);
  const [operacion, setOperacion] = useState(() => crypto.randomUUID());
  useEffect(() => { const c = new AbortController(); const t = setTimeout(() => { api.get('/productos', { params: { q }, signal: c.signal }).then((r) => { setOpciones(r.data); setError(''); }).catch((e) => { if (!c.signal.aborted) setError(mensajeError(e)); }); }, 250); return () => { clearTimeout(t); c.abort(); }; }, [q]);
  const total = carrito.reduce((s, p) => s + Math.round(Number(p.precio) * 100) * p.cantidad, 0);
  const monto = /^\d{1,8}(\.\d{1,2})?$/.test(recibido) ? Math.round(Number(recibido) * 100) : null;
  const cambio = monto === null ? null : monto - total;
  async function guardar(e) {
    e.preventDefault(); setOcupado(true); setError('');
    try { const r = await api.post('/ventas', { operacion, productos: carrito.map(({ id, cantidad }) => ({ id, cantidad })), metodo, recibido }); setVenta(r.data); }
    catch (e) { setError(mensajeError(e)); } finally { setOcupado(false); }
  }
  if (venta) return <section className="page"><h1>Cobro registrado</h1><p role="status">Operación #{venta.id} · {venta.metodo} · Total ${venta.total} · Recibido ${venta.recibido} · Cambio ${venta.cambio}</p><button onClick={() => { setVenta(null); setCarrito([]); setRecibido(''); setMetodo(''); setOperacion(crypto.randomUUID()); }}>Nuevo cobro</button></section>;
  return <section className="page"><h1>Registrar cobro</h1><p>Calcula el cambio y guarda el método de pago. Este avance aún no descuenta inventario ni emite factura. Los pagos electrónicos se registran manualmente; no se procesan cargos.</p>
    {error && <p className="crud-error" role="alert">{error}</p>}
    <section className="crud-panel"><label>Buscar productos por inicio del nombre<input value={q} onChange={(e) => setQ(e.target.value)} /></label>
    <ul>{opciones.map((p) => <li key={p.id}>{p.nombre} · ${p.precio} <button disabled={ocupado || carrito.some((x) => x.id === p.id)} onClick={() => setCarrito([...carrito, { ...p, cantidad: 1 }])}>Agregar</button></li>)}</ul></section>
    <form className="crud-panel crud-fields" onSubmit={guardar}>
      {carrito.map((p) => <div key={p.id}><label>{p.nombre}<input aria-label={`Cantidad de ${p.nombre}`} type="number" min="1" max="10000" required value={p.cantidad} onChange={(e) => setCarrito(carrito.map((x) => x.id === p.id ? { ...x, cantidad: Number(e.target.value) } : x))} /></label><button type="button" onClick={() => setCarrito(carrito.filter((x) => x.id !== p.id))}>Quitar</button></div>)}
      <strong>Total ${(total / 100).toFixed(2)}</strong><label>Método de pago<select required value={metodo} onChange={(e) => setMetodo(e.target.value)}><option value="">Seleccionar</option><option value="efectivo">Efectivo</option><option value="tarjeta">Tarjeta</option><option value="movil">Pago móvil</option></select></label>
      <label>Monto recibido<input required inputMode="decimal" pattern="[0-9]{1,8}([.][0-9]{1,2})?" value={recibido} onChange={(e) => setRecibido(e.target.value)} /></label>
      <p role="status">{cambio === null ? 'Ingresa el monto usando punto decimal.' : cambio < 0 ? 'El monto recibido es insuficiente.' : `Cambio: $${(cambio / 100).toFixed(2)}`}</p>{metodo && metodo !== 'efectivo' && <p>Para tarjeta o pago móvil ingresa el monto exacto.</p>}
      <button className="crud-primary" disabled={ocupado || !carrito.length || !metodo || cambio === null || cambio < 0 || (metodo !== 'efectivo' && cambio !== 0)}>{ocupado ? 'Registrando…' : 'Confirmar cobro'}</button>
    </form></section>;
}
