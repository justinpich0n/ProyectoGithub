import './Comprobante.css';

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 });
const metodos = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', movil: 'Transferencia bancaria' };

export default function Comprobante({ venta, children }) {
  const unidades = venta.detalle.reduce((total, producto) => total + producto.cantidad, 0);
  return <article className="comprobante" aria-label={`Comprobante de venta ${venta.id}`}>
    <header className="comprobante-cabecera">
      <span className="comprobante-check" aria-hidden="true"><svg viewBox="0 0 52 52" fill="none"><circle cx="26" cy="26" r="23" /><path d="m15 26 7 7 15-15" /></svg></span>
      <p className="comprobante-marca">BIZZSTOCK · ARTE Y BELLEZA</p>
      <h2>¡Pago registrado!</h2>
      <p className="comprobante-estado" role="status">La venta quedó guardada correctamente.</p>
      <strong className="comprobante-importe">{pesos.format(venta.total)}</strong>
      <span className="comprobante-etiqueta">{metodos[venta.metodo] || venta.metodo} · Simulación</span>
    </header>
    <dl className="comprobante-datos">
      <div><dt>Comprobante</dt><dd>#{String(venta.id).padStart(5, '0')}</dd></div>
      <div><dt>Fecha y hora</dt><dd>{new Date(venta.createdAt).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' })}</dd></div>
      <div><dt>Cliente</dt><dd>{venta.cliente?.nombre || 'Consumidor final'}{venta.cliente?.telefono && <small>{venta.cliente.telefono}</small>}</dd></div>
      {venta.vendedor?.nombre && <div><dt>Atendido por</dt><dd>{venta.vendedor.nombre}</dd></div>}
    </dl>
    <section className="comprobante-compra" aria-label="Productos de la venta">
      <div className="comprobante-subtitulo"><h3>Tu compra</h3><span>{unidades} {unidades === 1 ? 'unidad' : 'unidades'}</span></div>
      <ul>{venta.detalle.map((p, i) => <li key={p.productoId || i}><span className="comprobante-cantidad">{p.cantidad}×</span><div><strong>{p.nombre}</strong>{p.precio != null && <small>{pesos.format(p.precio)} por unidad</small>}</div><strong>{pesos.format(p.subtotal)}</strong></li>)}</ul>
    </section>
    <dl className="comprobante-totales">
      <div><dt>Recibido</dt><dd>{pesos.format(venta.recibido)}</dd></div>
      <div><dt>Cambio entregado</dt><dd>{pesos.format(venta.cambio)}</dd></div>
      <div className="comprobante-total"><dt>Total pagado</dt><dd>{pesos.format(venta.total)}</dd></div>
    </dl>
    {venta.cliente && venta.puntosGanados != null && <p className="comprobante-puntos">Esta compra suma <strong>{venta.puntosGanados} puntos</strong> al cliente.</p>}
    <footer className="comprobante-pie"><p>Gracias por apoyar una buena idea.</p><small>Comprobante de demostración · No es factura electrónica.<br />No se realizó un cargo bancario real.</small></footer>
    <div className="comprobante-acciones"><button type="button" onClick={() => window.print()}>Imprimir o guardar PDF</button>{children}</div>
  </article>;
}
