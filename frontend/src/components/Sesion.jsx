import { useEffect, useState } from 'react';
import api, { mensajeError } from '../services/api';
import { SesionContext } from '../services/sesion';
export default function Sesion({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [verificando, setVerificando] = useState(!!sessionStorage.getItem('bizzstock-token'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    if (sessionStorage.getItem('bizzstock-token')) {
      api.get('/auth/sesion', { signal: controller.signal }).then((r) => setUsuario(r.data))
        .catch((e) => { if (!controller.signal.aborted) setError(mensajeError(e)); })
        .finally(() => { if (!controller.signal.aborted) setVerificando(false); });
    }
    const salir = () => { setUsuario(null); setVerificando(false); };
    window.addEventListener('bizzstock-sesion-cerrada', salir);
    return () => { controller.abort(); window.removeEventListener('bizzstock-sesion-cerrada', salir); };
  }, []);
  async function entrar(e) {
    e.preventDefault(); setOcupado(true); setError('');
    try {
      const { data } = await api.post('/auth/login', { email, password });
      sessionStorage.setItem('bizzstock-token', data.token); setUsuario(data.usuario); setPassword('');
    } catch (e) { setError(mensajeError(e)); } finally { setOcupado(false); }
  }
  async function salir() {
    try { await api.post('/auth/logout'); }
    catch (e) { setError(mensajeError(e)); return; }
    sessionStorage.removeItem('bizzstock-token'); setUsuario(null);
  }
  if (verificando) return <p role="status" className="page">Comprobando sesión…</p>;
  if (!usuario) return <main className="login-page"><section className="crud-panel"><p className="eyebrow">BIZZSTOCK · ARTE Y BELLEZA</p><h1>Tu negocio, en orden.</h1><p>Inicia sesión para continuar.</p>
    {error && <p role="alert" className="crud-error">{error}</p>}
    <form onSubmit={entrar} className="crud-fields"><label>Correo<input type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} /></label>
      <label>Contraseña<input type="password" required autoComplete="current-password" maxLength={128} value={password} onChange={(e) => setPassword(e.target.value)} /></label>
      <button className="crud-primary" disabled={ocupado}>{ocupado ? 'Ingresando…' : 'Iniciar sesión'}</button></form>
    <p className="crud-note">Solicita tu cuenta al administrador del negocio.</p>
  </section></main>;
  return <SesionContext.Provider value={{ usuario, salir }}>{children}</SesionContext.Provider>;
}
