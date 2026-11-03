import { useEffect, useState } from 'react';
import api, { mensajeError } from '../services/api';
const claveConfiguracion = new URLSearchParams(window.location.hash.slice(1)).get('configurar') || '';
export default function Bienvenida({ email, setEmail, password, setPassword, error, ocupado, entrar, completar }) {
  const [clave] = useState(claveConfiguracion);
  const [configurado, setConfigurado] = useState(null); const [modo, setModo] = useState(claveConfiguracion || new URLSearchParams(window.location.search).get('solicitar') === '1' ? 'crear' : 'login');
  const [paso, setPaso] = useState(1); const [nombre, setNombre] = useState(''); const [confirmar, setConfirmar] = useState('');
  const [rol, setRol] = useState('cajero'); const [visible, setVisible] = useState(false); const [fallo, setFallo] = useState(''); const [guardando, setGuardando] = useState(false);
  const [seguimiento, setSeguimiento] = useState(() => sessionStorage.getItem('bizzstock-solicitud') || ''); const [estado, setEstado] = useState('pendiente');
  useEffect(() => { if (clave) window.history.replaceState(null, '', window.location.pathname + window.location.search); }, [clave]);
  useEffect(() => { const c = new AbortController(); api.get('/inicio', { signal: c.signal }).then(r => setConfigurado(r.data.configurado)).catch(e => { if (!c.signal.aborted) setFallo(mensajeError(e)); }); return () => c.abort(); }, []);
  useEffect(() => {
    if (!seguimiento) return;
    const c = new AbortController();
    const cargar = () => api.post('/solicitudes/estado', { seguimiento }, { signal: c.signal }).then(r => { setEstado(r.data.estado); setFallo(''); }).catch(e => { if (!c.signal.aborted) setFallo(mensajeError(e)); });
    cargar(); const t = setInterval(cargar, 10000); return () => { c.abort(); clearInterval(t); };
  }, [seguimiento]);
  async function siguiente(e) {
    e.preventDefault(); setFallo('');
    if (paso === 1) { setPaso(2); return; }
    if (password !== confirmar) { setFallo('Las contraseñas no coinciden.'); return; }
    setGuardando(true);
    try {
      if (clave && !configurado) { const r = await api.post('/inicio', { nombre, email, password }, { headers: { 'X-Setup-Token': clave } }); setPassword(''); setConfirmar(''); completar(r.data); }
      else { const r = await api.post('/solicitudes', { nombre, email, password, rol }); sessionStorage.setItem('bizzstock-solicitud', r.data.seguimiento); setSeguimiento(r.data.seguimiento); setEstado(r.data.estado); setPassword(''); setConfirmar(''); setModo('seguimiento'); }
    } catch (e) { setFallo(mensajeError(e)); } finally { setGuardando(false); }
  }
  const inicial = !!clave && configurado === false;
  const mostrarSeguimiento = modo === 'seguimiento' && seguimiento;
  return <main className="welcome-shell"><aside className="welcome-story"><a className="welcome-brand" href="/">B.</a><p className="eyebrow">BIZZSTOCK · ARTE Y BELLEZA</p><h1>Todo empieza<br />con una buena idea.</h1><p>Tu papelería, tus productos y tu equipo.<br />Un espacio para ponerlos en orden.</p><div className="welcome-illustration" aria-hidden="true"><span>Tu negocio</span><strong>En orden.</strong><i>✓</i></div><small>Hecho para el día a día de tu negocio.</small></aside>
  <section className="welcome-form"><p className="eyebrow">{inicial ? 'CONFIGURACIÓN PRIVADA' : modo === 'crear' ? 'UN ACCESO A TU MEDIDA' : 'QUÉ BUENO VERTE'}</p><h2>{mostrarSeguimiento ? ({ pendiente: 'Tu solicitud está en revisión', aprobada: 'Tu cuenta está lista', rechazada: 'Solicitud no autorizada', expirada: 'La solicitud venció' })[estado] : modo === 'crear' ? (inicial ? 'Estrena tu negocio' : 'Solicita tu cuenta') : 'Volvamos a lo tuyo'}</h2>
  <p>{mostrarSeguimiento ? (estado === 'pendiente' ? 'El propietario debe aprobar tu acceso. Puedes dejar esta pantalla abierta: se actualiza automáticamente.' : estado === 'aprobada' ? 'Ya puedes iniciar sesión con el correo y la contraseña que elegiste.' : 'No se creó una cuenta con esta solicitud. Si necesitas acceso, consulta con el propietario.') : inicial ? 'Crea tu cuenta propietaria en dos pasos. Este enlace privado solo funciona una vez.' : modo === 'crear' ? 'Completa tus datos. El propietario revisará tus permisos antes de que puedas entrar.' : 'Ingresa para continuar donde lo dejaste.'}</p>
  {(fallo || error) && <p className="crud-error" role="alert">{fallo || error}</p>}
  {mostrarSeguimiento ? <><p className="approval-status" role="status">{estado}</p><button className="welcome-primary" onClick={() => setModo('login')}>Ir al inicio de sesión →</button>{estado !== 'pendiente' && estado !== 'aprobada' && <button className="welcome-link" onClick={() => { sessionStorage.removeItem('bizzstock-solicitud'); setSeguimiento(''); setModo('crear'); setPaso(1); }}>Enviar una nueva solicitud</button>}</> : modo === 'crear' ? <><ol className="welcome-steps" aria-label="Progreso"><li aria-current={paso === 1 ? 'step' : undefined}>1 · Tus datos</li><li aria-current={paso === 2 ? 'step' : undefined}>2 · Tu acceso</li></ol>
    {!inicial && configurado === false && <p role="status">El propietario todavía está preparando el negocio. Podrás solicitar acceso cuando termine.</p>}
    <form onSubmit={siguiente} className="crud-fields">{paso === 1 ? <><label>¿Cómo te llamas?<input autoFocus required maxLength={255} autoComplete="name" value={nombre} onChange={e => setNombre(e.target.value)} /></label><label>Tu correo<input type="email" required maxLength={255} autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} /></label>{!inicial && <label>¿Qué acceso necesitas?<select value={rol} onChange={e => setRol(e.target.value)}><option value="cajero">Cajero</option><option value="administrador">Administrador</option></select></label>}<button className="welcome-primary" disabled={configurado === null || (!inicial && !configurado)}>Continuar →</button></> : <><p>Tu cuenta: <strong>{email}</strong></p><label>Elige tu contraseña<input autoFocus type={visible ? 'text' : 'password'} required minLength={6} maxLength={128} autoComplete="new-password" value={password} onChange={e => setPassword(e.target.value)} /></label><label>Repítela para confirmar<input type={visible ? 'text' : 'password'} required minLength={6} maxLength={128} autoComplete="new-password" value={confirmar} onChange={e => setConfirmar(e.target.value)} /></label><label className="welcome-check"><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> Mostrar contraseñas</label><small>Entre 6 y 128 caracteres. {inicial ? 'Entrarás como propietario al terminar.' : 'No compartas tu contraseña con nadie, ni con el propietario.'}</small><button className="welcome-primary" disabled={guardando}>{guardando ? 'Guardando…' : inicial ? 'Crear mi cuenta propietaria →' : 'Enviar solicitud de acceso →'}</button><button type="button" className="welcome-link" disabled={guardando} onClick={() => setPaso(1)}>← Volver a mis datos</button></>}</form>
    </> : <form onSubmit={entrar} className="crud-fields"><label>Correo<input type="email" required autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} /></label><label>Contraseña<input type={visible ? 'text' : 'password'} required maxLength={128} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} /></label><label className="welcome-check"><input type="checkbox" checked={visible} onChange={e => setVisible(e.target.checked)} /> Mostrar contraseña</label><button className="welcome-primary" disabled={ocupado}>{ocupado ? 'Ingresando…' : 'Entrar a mi negocio →'}</button></form>}
    {!mostrarSeguimiento && <button type="button" className="welcome-link" onClick={() => { setFallo(''); setModo(modo === 'crear' ? 'login' : 'crear'); setPaso(1); }}>{modo === 'crear' ? 'Ya tengo una cuenta' : '¿Necesitas una cuenta? Solicita tu acceso →'}</button>}
    {seguimiento && !mostrarSeguimiento && <button className="welcome-link" onClick={() => setModo('seguimiento')}>Ver el estado de mi solicitud</button>}
  </section></main>;
}
