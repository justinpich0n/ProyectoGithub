import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import api, { mensajeError } from '../services/api';
import { useSesion } from '../services/sesion';
import Comprobante from '../components/Comprobante';
import './PerfilCliente.css';

const pesos = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 2 });
const numero = new Intl.NumberFormat('es-CO');
const fecha = valor => new Date(valor).toLocaleString('es-CO', { timeZone: 'America/Bogota', dateStyle: 'medium', timeStyle: 'short' });
const medios = { efectivo: 'Efectivo', tarjeta: 'Tarjeta', movil: 'Pago móvil' };

export default function PerfilCliente({ administracion = false }) {
  const { id } = useParams();
  const { usuario } = useSesion();
  const permitido = administracion ? usuario.rol === 'administrador' : usuario.rol === 'comprador';
  const [datos, setDatos] = useState(null);
  const [pagina, setPagina] = useState(1);
  const [revision, setRevision] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');
  const [elegida, setElegida] = useState(null);
  const dialogo = useRef(null);
  useEffect(() => {
    if (!permitido) return;
    const control = new AbortController();
    api.get(administracion ? `/clientes/${id}/compras` : '/mi-perfil', { params: { pagina }, signal: control.signal })
      .then(r => { setDatos(r.data); setError(''); })
      .catch(e => { if (!control.signal.aborted) setError(mensajeError(e)); })
      .finally(() => { if (!control.signal.aborted) setCargando(false); });
    return () => control.abort();
  }, [administracion, id, pagina, revision, permitido]);
  function cambiarPagina(valor) { setCargando(true); setPagina(valor); }
  if (!permitido) return <section className="page"><p>Esta cuenta no tiene acceso a este perfil.</p></section>;
  return <section className="page perfil-cliente">
    <header className="perfil-cabecera"><div><p className="eyebrow">{administracion ? 'HISTORIA DEL CLIENTE' : 'TU ESPACIO EN BIZZSTOCK'}</p><h1>{administracion ? 'Compras y puntos' : 'Tus compras cuentan.'}</h1>{datos && <p>{datos.cliente.nombre}{datos.cliente.email && <> · {datos.cliente.email}</>}</p>}</div><button className="crud-primary" disabled={cargando} onClick={() => { setCargando(true); setRevision(v => v + 1); }}>Actualizar</button></header>
    {error && <p className="crud-error" role="alert">{error}</p>}
    {cargando && <p role="status">Consultando compras y puntos…</p>}
    {datos && <>
      <div className="perfil-resumen"><article className="perfil-puntos"><span>Puntos acumulados</span><strong>{numero.format(datos.resumen.puntos)}</strong><small>1 punto por cada $1.000 completos en cada compra</small></article><article><span>Compras registradas</span><strong>{numero.format(datos.resumen.compras)}</strong></article><article><span>{administracion ? 'Total comprado' : 'Total de tus compras'}</span><strong>{pesos.format(datos.resumen.totalGastado)}</strong></article></div>
      {!administracion && <aside className="perfil-premios"><span className="perfil-destello" aria-hidden="true">✦</span><div><p className="eyebrow">CADA COMPRA SUMA</p><h2>Tus puntos pueden convertirse en grandes premios.</h2><p>Acumula puntos para futuros premios y beneficios del negocio.</p><small>Las recompensas, condiciones y disponibilidad se anunciarán próximamente.</small></div></aside>}
      <div className="perfil-historial-cabecera"><h2>{administracion ? 'Historial de compras' : 'Tu historial de compras'}</h2><span>{datos.total} {datos.total === 1 ? 'compra' : 'compras'}</span></div>
      {!datos.total && <div className="crud-panel"><h3>La historia empieza con tu primera compra.</h3><p>Al pagar, pide que asocien la venta a tu cuenta. La compra y sus puntos aparecerán aquí.</p></div>}
      <div className="perfil-historial">{datos.compras.map(v => <article className="perfil-compra" key={v.id}>
        <div className="perfil-compra-info"><strong>Compra #{v.id}</strong><time dateTime={v.createdAt}>{fecha(v.createdAt)}</time><span>{medios[v.metodo]}</span></div>
        <ul>{v.detalle.map((p, i) => <li key={i}><span>{p.cantidad} × {p.nombre}</span><strong>{pesos.format(p.subtotal)}</strong></li>)}</ul>
        <footer><div><small>Total de la compra</small><strong>{pesos.format(v.total)}</strong></div><span className="perfil-puntos-ganados">+{numero.format(v.puntosGanados)} puntos</span><button onClick={() => { setElegida(v); dialogo.current.showModal(); }}>Ver comprobante</button></footer>
      </article>)}</div>
      {datos.total > 15 && <div className="crud-actions"><button disabled={cargando || pagina === 1} onClick={() => cambiarPagina(pagina - 1)}>Anterior</button><span>Página {pagina}</span><button disabled={cargando || pagina * 15 >= datos.total} onClick={() => cambiarPagina(pagina + 1)}>Siguiente</button></div>}
    </>}
    <dialog className="ventas-detalle" aria-label="Comprobante de compra" ref={dialogo}><form method="dialog"><button autoFocus>Cerrar</button></form>{elegida && <Comprobante key={elegida.id} venta={{ ...elegida, cliente: elegida.cliente || { nombre: datos.cliente.nombre } }} />}</dialog>
  </section>;
}
