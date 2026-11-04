import { useEffect, useRef, useState } from 'react';
import api, { mensajeError } from '../services/api';
import { useSesion } from '../services/sesion';
import CompartirAcceso from '../components/CompartirAcceso';
import './Cobro.css';

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 });
const metodos = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', movil: 'Transferencia bancaria' };

export default function Cobro() {
  const { usuario } = useSesion();
  const [q, setQ] = useState('');
  const [opciones, setOpciones] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [metodo, setMetodo] = useState('');
  const [recibido, setRecibido] = useState('');
  const [error, setError] = useState('');
  const [venta, setVenta] = useState(null);
  const [cliente, setCliente] = useState(null);
  const [buscarCliente, setBuscarCliente] = useState('');
  const [clientes, setClientes] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [ventaAnterior, setVentaAnterior] = useState(null);
  const [estadoHistorial, setEstadoHistorial] = useState('');
  const dialogoHistorial = useRef(null);
  const comprobante = ventaAnterior || venta;
  const [ocupado, setOcupado] = useState(false);
  const [operacion, setOperacion] = useState(() => crypto.randomUUID());
  const qr = useRef(null);
  const busqueda = useRef(null);

  useEffect(() => {
    const control = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const respuesta = await api.get('/productos', { params: { q }, signal: control.signal });
        setOpciones(respuesta.data);
      } catch (e) {
        if (!control.signal.aborted) setError(mensajeError(e));
      }
    }, 200);
    return () => { clearTimeout(timer); control.abort(); };
  }, [q]);

  useEffect(() => {
    if (buscarCliente.trim().length < 2 || cliente) return;
    const control = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const { data } = await api.get('/ventas/clientes', { params: { q: buscarCliente }, signal: control.signal });
        if (!control.signal.aborted) setClientes(data);
      } catch (e) {
        if (!control.signal.aborted) setError(mensajeError(e));
      }
    }, 200);
    return () => { clearTimeout(timer); control.abort(); };
  }, [buscarCliente, cliente]);

  async function abrirHistorial() {
    setHistorial([]);
    setVentaAnterior(null);
    setEstadoHistorial('Cargando comprobantes…');
    dialogoHistorial.current.showModal();
    try {
      const { data } = await api.get('/ventas');
      setHistorial(data);
      setEstadoHistorial(data.length ? '' : 'Todavía no hay cobros registrados en esta cuenta.');
    } catch (e) {
      setEstadoHistorial(mensajeError(e));
    }
  }

  function limpiarCliente() {
    setCliente(null);
    setBuscarCliente('');
    setClientes([]);
  }

  const total = carrito.reduce((suma, p) => suma + Math.round(Number(p.precio) * 100) * p.cantidad, 0);
  const valor = metodo === 'efectivo' ? recibido.trim().replace(',', '.') : (total / 100).toFixed(2);
  const monto = /^\d{1,8}(\.\d{1,2})?$/.test(valor) ? Math.round(Number(valor) * 100) : null;
  const cambio = monto === null ? null : monto - total;
  const valido = carrito.length > 0 && carrito.length <= 100 && total <= 9999999999
    && metodo && cambio !== null && cambio >= 0;

  function sumar(p) {
    setCarrito((actual) => {
      const agregado = actual.find((item) => item.id === p.id);
      if (agregado) return actual.map((item) => item.id === p.id ? { ...item, cantidad: Math.min(10000, item.cantidad + 1) } : item);
      return actual.length < 100 ? [...actual, { ...p, cantidad: 1 }] : actual;
    });
  }

  function restar(id) {
    setCarrito((actual) => actual.map((p) => p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p).filter((p) => p.cantidad > 0));
  }

  async function guardar(e) {
    e.preventDefault();
    if (!valido || ocupado) return;
    setOcupado(true);
    setError('');
    try {
      const { data } = await api.post('/ventas', {
        operacion, clienteId: cliente?.id, productos: carrito.map(({ id, cantidad }) => ({ id, cantidad })), metodo, recibido: valor,
      });
      setVenta(data);
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }

  function nuevoCobro() {
    setVenta(null);
    limpiarCliente();
    setCarrito([]);
    setRecibido('');
    setMetodo('');
    setQ('');
    setOperacion(crypto.randomUUID());
    busqueda.current?.focus();
  }

  return <section className="page caja">
    <header className="caja-cabecera">
      <div><span className="caja-marca">BIZZSTOCK · PUNTO DE VENTA</span><h1>Caja de feria</h1><p>Elige productos, registra el pago y muestra el comprobante.</p></div>
      <div className="caja-acciones">
        <button type="button" disabled={ocupado} onClick={abrirHistorial}>Últimos comprobantes</button>
        {usuario.propietario && <button type="button" onClick={() => qr.current.showModal()}>Mostrar QR de acceso</button>}
      </div>
    </header>
    {usuario.propietario && <dialog ref={qr} className="caja-qr" aria-label="QR para visitantes">
      <form method="dialog"><button autoFocus>Cerrar</button></form>
      <h2>Escanea para solicitar acceso</h2>
      <CompartirAcceso abierto />
    </dialog>}
    <dialog ref={dialogoHistorial} className="caja-qr" aria-label="Últimos comprobantes">
      <form method="dialog"><button autoFocus>Cerrar</button></form>
      <h2>Últimos 15 comprobantes de esta cuenta</h2>
      {estadoHistorial && <p role="status">{estadoHistorial}</p>}
      <ul className="caja-historial">
        {historial.map((item) => <li key={item.id}>
          <button type="button" onClick={() => {
            setVentaAnterior(item);
            dialogoHistorial.current.close();
          }}>#{item.id} · {new Date(item.createdAt).toLocaleString('es-CO')} · {pesos.format(item.total)}</button>
        </li>)}
      </ul>
    </dialog>
    {error && <p className="crud-error" role="alert">{error}</p>}
    <div className="caja-grid">
      <section className="caja-panel" aria-label="Catálogo de caja">
        <h2>1. Elige productos</h2>
        <label>Buscar por nombre<input ref={busqueda} value={q} onChange={(e) => setQ(e.target.value)} maxLength={100} placeholder="Ej. Cuaderno" /></label>
        <div className="caja-productos">
          {opciones.map((p) => <button key={p.id} type="button" disabled={ocupado || !!comprobante} onClick={() => sumar(p)}>
            <span>{p.nombre}</span><strong>{pesos.format(p.precio)}</strong><span aria-hidden="true">＋</span>
          </button>)}
          {!opciones.length && <p>No hay productos para mostrar.</p>}
        </div>
      </section>
      {comprobante ? <section className="caja-panel caja-recibo">
        <span className="caja-marca" role="status">PAGO REGISTRADO</span>
        <h2>Comprobante #{comprobante.id}</h2>
        <p>{new Date(comprobante.createdAt).toLocaleString('es-CO')}</p>
        {comprobante.cliente && <p>Cliente: {comprobante.cliente.nombre} · {comprobante.cliente.telefono}</p>}
        <p>{metodos[comprobante.metodo]} · Simulación de caja</p>
        <ul>{comprobante.detalle.map((p) => <li key={p.productoId}><span>{p.cantidad} × {p.nombre}</span><strong>{pesos.format(p.subtotal)}</strong></li>)}</ul>
        <dl><div><dt>Total pagado</dt><dd>{pesos.format(comprobante.total)}</dd></div><div><dt>Recibido</dt><dd>{pesos.format(comprobante.recibido)}</dd></div><div><dt>Cambio</dt><dd>{pesos.format(comprobante.cambio)}</dd></div></dl>
        {ventaAnterior
          ? <button type="button" onClick={() => setVentaAnterior(null)}>Volver a caja</button>
          : <button type="button" className="crud-primary" onClick={nuevoCobro}>Nuevo cobro</button>}
      </section> : <form className="caja-panel" onSubmit={guardar}>
        <h2>2. Revisa la compra</h2>
        {carrito.length ? <ul className="caja-lineas">{carrito.map((p) => <li key={p.id}>
          <span>{p.nombre}<small>{pesos.format(p.precio)} c/u</small></span>
          <div className="caja-cantidad">
            <button type="button" disabled={ocupado} onClick={() => restar(p.id)} aria-label={`Quitar una unidad de ${p.nombre}`}>−</button>
            <strong>{p.cantidad}</strong>
            <button type="button" disabled={ocupado || p.cantidad >= 10000} onClick={() => sumar(p)} aria-label={`Agregar una unidad de ${p.nombre}`}>+</button>
          </div>
          <strong>{pesos.format(Number(p.precio) * p.cantidad)}</strong>
        </li>)}</ul> : <p>Agrega un producto del catálogo para empezar.</p>}
        <div className="caja-total"><span>Total a cobrar</span><strong>{pesos.format(total / 100)}</strong></div>
        <fieldset disabled={ocupado} className="caja-pago">
          <legend>3. Registra el pago</legend>
          {cliente ? <div>
            <p>Cliente: {cliente.nombre} · {cliente.telefono}</p>
            <button type="button" onClick={limpiarCliente}>Quitar cliente</button>
          </div> : <>
            <label>Cliente habitual (opcional)
              <input value={buscarCliente} maxLength={100} placeholder="Busca por nombre"
                onChange={(e) => { setBuscarCliente(e.target.value); setClientes([]); }} />
            </label>
            {clientes.length > 0 && <div className="caja-metodos">
              {clientes.map((item) => <button key={item.id} type="button" onClick={() => setCliente(item)}>
                {item.nombre} · {item.telefono}
              </button>)}
            </div>}
          </>}
          <div className="caja-metodos">{Object.entries(metodos).map(([id, nombre]) => <button key={id} type="button" aria-pressed={metodo === id} onClick={() => setMetodo(id)}>{nombre}</button>)}</div>
          {metodo === 'efectivo' && <>
            <label>Efectivo recibido<input required inputMode="decimal" value={recibido} onChange={(e) => setRecibido(e.target.value)} /></label>
            <div className="caja-metodos"><button type="button" onClick={() => setRecibido((total / 100).toFixed(2))}>Pago exacto</button>{[10000, 20000, 50000].filter((billete) => billete * 100 >= total).map((billete) => <button key={billete} type="button" onClick={() => setRecibido(String(billete))}>{pesos.format(billete)}</button>)}</div>
            <p role="status">{cambio === null ? 'Ingresa el efectivo recibido.' : cambio < 0 ? `Faltan ${pesos.format(-cambio / 100)}` : `Cambio a entregar: ${pesos.format(cambio / 100)}`}</p>
          </>}
          {metodo && metodo !== 'efectivo' && <p>Se registrará un pago simulado de {pesos.format(total / 100)}.</p>}
        </fieldset>
        <button className="crud-primary" disabled={!valido || ocupado}>{ocupado ? 'Registrando…' : 'Confirmar pago'}</button>
      </form>}
    </div>
  </section>;
}
