import { useEffect, useRef, useState } from 'react';
import CompartirAcceso from '../components/CompartirAcceso';
import api, { mensajeError } from '../services/api';
import { useSesion } from '../services/sesion';
export default function Solicitudes() {
  const revisionRef = useRef(null);
  const { usuario } = useSesion(); const [filas, setFilas] = useState([]); const [estado, setEstado] = useState('pendiente');
  const [error, setError] = useState(''); const [mensaje, setMensaje] = useState(''); const [ocupado, setOcupado] = useState(false); const [elegida, setElegida] = useState(null); const [rol, setRol] = useState('cajero');
  const [pagina, setPagina] = useState(1); const [total, setTotal] = useState(0); const [revision, setRevision] = useState(0);
  useEffect(() => {
    if (!usuario.propietario) return;
    const c = new AbortController();
    const cargar = () => api.get('/solicitudes', { params: { estado, pagina }, signal: c.signal }).then(r => { setFilas(r.data.solicitudes); setTotal(r.data.total); setError(''); }).catch(e => { if (!c.signal.aborted) setError(mensajeError(e)); });
    cargar(); const t = setInterval(cargar, 10000); return () => { c.abort(); clearInterval(t); };
  }, [estado, pagina, revision, usuario.propietario]);
  useEffect(() => { if (elegida) { revisionRef.current?.focus(); revisionRef.current?.scrollIntoView({ block: 'start' }); } }, [elegida]);
  if (!usuario.propietario) return <section className="page"><h1>Solicitudes de acceso</h1><p>Solo el propietario puede revisar y autorizar cuentas.</p></section>;
  async function decidir(decision) {
    setOcupado(true); setError('');
    try { await api.post(`/solicitudes/${elegida.id}/decision`, { decision, rol }); setMensaje(decision === 'aprobar' ? 'Cuenta aprobada. La persona ya puede iniciar sesión.' : 'Solicitud rechazada. No se creó una cuenta.'); setElegida(null); setRevision(x => x + 1); }
    catch (e) { setError(mensajeError(e)); setRevision(x => x + 1); } finally { setOcupado(false); }
  }
  return <section className="page"><p className="eyebrow">SOLO PARA TI</p><h1>Quién entra a tu negocio</h1><p>Revisa a cada persona antes de darle acceso. Las solicitudes se actualizan cada 10 segundos y vencen a las 24 horas.</p>
    <CompartirAcceso /><div className="approval-toolbar"><label>Mostrar<select value={estado} onChange={e => { setEstado(e.target.value); setPagina(1); setElegida(null); }}><option value="pendiente">Pendientes</option><option value="aprobada">Aprobadas</option><option value="rechazada">Rechazadas</option><option value="expirada">Expiradas</option></select></label><button className="welcome-link" onClick={() => setRevision(x => x + 1)}>Actualizar ahora</button></div>
    {error && <p role="alert" className="crud-error">{error}</p>}{mensaje && <p role="status">{mensaje}</p>}
    {!filas.length && <section className="crud-panel"><h2>Todo al día</h2><p>No hay solicitudes en este estado.</p></section>}
    <div className="approval-grid">{filas.map(s => <article className="approval-card" key={s.id}><span className="approval-status">{s.estado}</span><h2>{s.nombre}</h2><p className="approval-email">{s.email}</p><p>Solicita acceso como <strong>{s.rol}</strong>.</p><small>Recibida: {new Date(s.createdAt).toLocaleString('es-CO')}</small>{s.estado === 'pendiente' && <button className="welcome-primary" onClick={() => { setElegida(s); setRol(s.rol); setMensaje(''); }}>Revisar solicitud →</button>}</article>)}</div>
    {total > 50 && <div className="approval-toolbar"><button disabled={pagina === 1} onClick={() => setPagina(x => x - 1)}>Anterior</button><span>Página {pagina}</span><button disabled={pagina * 50 >= total} onClick={() => setPagina(x => x + 1)}>Siguiente</button></div>}
    {elegida && <section ref={revisionRef} tabIndex={-1} className="approval-review" aria-labelledby="revision-titulo"><h2 id="revision-titulo">¿Autorizas a {elegida.nombre} a entrar a BizzStock?</h2><p>{elegida.email}</p><label>Permisos que tendrá<select disabled={ocupado} value={rol} onChange={e => setRol(e.target.value)}><option value="cajero">Cajero</option><option value="administrador">Administrador</option></select></label><p>{rol === 'cajero' ? 'Podrá consultar productos y registrar cobros.' : 'Podrá gestionar productos, usuarios y clientes, además de registrar cobros. No podrá autorizar nuevas cuentas.'}</p><div className="approval-actions"><button className="welcome-primary" disabled={ocupado} onClick={() => decidir('aprobar')}>{ocupado ? 'Guardando…' : 'Sí, aprobar cuenta'}</button><button className="approval-deny" disabled={ocupado} onClick={() => decidir('rechazar')}>Rechazar solicitud</button><button className="welcome-link" disabled={ocupado} onClick={() => setElegida(null)}>Decidir después</button></div></section>}
  </section>;
}
