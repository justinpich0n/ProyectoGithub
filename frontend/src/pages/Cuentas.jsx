import CamposDocumento from '../components/CamposDocumento';
import { useState } from 'react';
import api, { mensajeError } from '../services/api';
import { useSesion } from '../services/sesion';
export default function Cuentas() {
  const { usuario } = useSesion();
  const [datos, setDatos] = useState({ nombre: '', email: '', password: '', confirmar: '', tipoDocumento: '', numeroDocumento: '', rol: 'cajero' });
  const [visible, setVisible] = useState(false); const [ocupado, setOcupado] = useState(false); const [mensaje, setMensaje] = useState(''); const [error, setError] = useState('');
  if (!usuario.propietario) return <p className="page">Solo el propietario puede crear cuentas.</p>;
  async function guardar(e) {
    e.preventDefault(); setError(''); setMensaje('');
    if (datos.password !== datos.confirmar) { setError('Las contraseñas no coinciden.'); return; }
    setOcupado(true);
    try { const cuenta = { nombre: datos.nombre, email: datos.email, password: datos.password, rol: datos.rol, tipoDocumento: datos.tipoDocumento, numeroDocumento: datos.numeroDocumento }; await api.post('/cuentas', cuenta); setMensaje('Cuenta creada. Ya puede ingresar con su correo y contraseña.'); setDatos({ nombre: '', email: '', password: '', confirmar: '', tipoDocumento: '', numeroDocumento: '', rol: 'cajero' }); }
    catch (e) { setError(mensajeError(e)); } finally { setOcupado(false); }
  }
  return <section className="page"><h1>Crear cuenta</h1><p>Crea una cuenta de cliente/comprador o del equipo. Elige sus permisos antes de guardar.</p><section className="crud-panel">
    {error && <p role="alert" className="crud-error">{error}</p>}{mensaje && <p role="status">{mensaje}</p>}
    <form className="crud-fields" onSubmit={guardar}>
      <CamposDocumento datos={datos} cambiar={(campo, valor) => setDatos(actual => ({ ...actual, [campo]: valor }))} />
      {['nombre', 'email', 'password', 'confirmar'].map((campo) => <label key={campo}>{({ nombre: 'Nombre', email: 'Correo', password: 'Contraseña', confirmar: 'Repetir contraseña' })[campo]}<input required maxLength={campo === 'nombre' || campo === 'email' ? 255 : 128} minLength={['password', 'confirmar'].includes(campo) ? 6 : undefined} type={campo === 'email' ? 'email' : ['password', 'confirmar'].includes(campo) ? (visible ? 'text' : 'password') : 'text'} autoComplete={['password', 'confirmar'].includes(campo) ? 'new-password' : 'off'} value={datos[campo]} onChange={(e) => setDatos({ ...datos, [campo]: e.target.value })} /></label>)}
      <label><input type="checkbox" checked={visible} onChange={(e) => setVisible(e.target.checked)} /> Mostrar contraseñas</label><p>De 6 a 128 caracteres.</p>
      <label>Permisos<select value={datos.rol} onChange={(e) => setDatos({ ...datos, rol: e.target.value })}><option value="comprador">Cliente / comprador</option><option value="cajero">Cajero</option><option value="administrador">Administrador</option></select></label><p>El cliente/comprador consulta el catálogo, sus compras y puntos. El cajero consulta productos y registra cobros. El administrador gestiona el negocio; solo el propietario autoriza cuentas.</p>
      <button className="crud-primary" disabled={ocupado}>{ocupado ? 'Creando…' : 'Crear cuenta'}</button>
    </form></section></section>;
}
