import { useEffect, useState } from 'react';
import api, { mensajeError } from '../services/api';
import Bienvenida from './Bienvenida';
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
  if (!usuario) return <Bienvenida email={email} setEmail={setEmail} password={password} setPassword={setPassword} error={error} ocupado={ocupado} entrar={entrar} completar={(data) => { sessionStorage.setItem('bizzstock-token', data.token); setUsuario(data.usuario); setPassword(''); }} />;
  return <SesionContext.Provider value={{ usuario, salir }}>{children}</SesionContext.Provider>;
}
