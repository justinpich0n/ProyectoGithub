import ImagenProducto from './ImagenProducto';
import '../pages/Catalogo.css';
import { useCallback, useEffect, useState } from 'react';
import { useSesion } from '../services/sesion';
import ImportarCostos from './ImportarCostos';
import api, { mensajeError } from '../services/api';

const fechaInicio = new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Bogota' });
const roles = { administrador: 'Administrador', cajero: 'Cajero', comprador: 'Comprador' };

export default function Gestion({ producto = false }) {
  const { usuario } = useSesion();
  const admin = usuario.rol === 'administrador';
  const [q, setQ] = useState('');
  const recurso = producto ? 'productos' : 'usuarios';
  const singular = producto ? 'producto' : 'usuario';
  const titulo = producto ? 'Productos' : 'Usuarios';
  const vacio = producto
    ? { nombre: '', precio: '', costo: '', cantidad: '', descripcion: '', usuarioId: '', imagen: null, confirmarCostoCero: false }
    : { nombre: '', email: '' };
  const [filas, setFilas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [cargandoImagen, setCargandoImagen] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const cargar = useCallback(
    async (signal) => {
      const [lista, equipo] = await Promise.all([
        api.get(`/${recurso}`, { signal, params: producto ? { q } : {} }),
        producto && admin ? api.get('/usuarios', { signal }) : Promise.resolve(null),
      ]);
      return { lista, equipo };
    },
    [recurso, producto, q, admin],
  );
  function mostrar({ lista, equipo }) {
    setFilas(lista.data);
    if (equipo) setUsuarios(equipo.data.filter(u => u.rol !== 'comprador'));
  }
  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => {
    setCargando(true); setError('');
    cargar(controller.signal)
      .then((datos) => {
        if (!controller.signal.aborted) mostrar(datos);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setError(mensajeError(e));
      })
      .finally(() => {
        if (!controller.signal.aborted) setCargando(false);
      });
    }, 250);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [cargar]);
  function limpiar() {
    setForm(vacio);
    setEditandoId(null);
  }
  function campo(nombre, valor) {
    setForm((actual) => ({ ...actual, [nombre]: valor }));
  }
  async function refrescar() {
    setCargando(true);
    setError('');
    setAviso('');
    try {
      mostrar(await cargar());
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setCargando(false);
    }
  }
  async function cargarImagen(e) {
    const archivo = e.target.files?.[0];
    if (!archivo) return;
    setCargandoImagen(true);
    try {
      if (!['image/png', 'image/jpeg'].includes(archivo.type) || archivo.size > 5 * 1024 * 1024) throw new Error('Adjunta un PNG/JPG de hasta 5 MB.');
      const bitmap = await createImageBitmap(archivo);
      const escala = Math.min(1, 1000 / Math.max(bitmap.width, bitmap.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.max(1, Math.round(bitmap.width * escala));
      canvas.height = Math.max(1, Math.round(bitmap.height * escala));
      const context = canvas.getContext('2d');
      context.fillStyle = '#ffffff';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      bitmap.close();
      const imagen = canvas.toDataURL('image/jpeg', .78);
      if (imagen.length > 660000) throw new Error('La imagen contiene demasiado detalle. Usa una imagen más pequeña.');
      campo('imagen', imagen);
      setError('');
    } catch (error) { setError(error.message || 'No se pudo leer la imagen.'); }
    setCargandoImagen(false);
    e.target.value = '';
  }
  async function guardar(e) {
    e.preventDefault();
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      if (editandoId) await api.put(`/${recurso}/${editandoId}`, form);
      else await api.post(`/${recurso}`, form);
      setAviso([editandoId ? 'Cambios guardados.' : 'Registro creado.', ...(Number(form.precio) < Number(form.costo) ? ['El precio de venta es menor al costo: posible pérdida económica.'] : [])].join(' '));
      limpiar();
      mostrar(await cargar());
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  function editar(fila) {
    setEditandoId(fila.id);
    setForm(
      producto
        ? {
            imagen: fila.imagen,
            nombre: fila.nombre,
            precio: fila.precio,
            costo: fila.costo ?? '',
            cantidad: fila.cantidad ?? '',
            confirmarCostoCero: false,
            descripcion: fila.descripcion || '',
            usuarioId: fila.usuarioId,
          }
        : { nombre: fila.nombre, email: fila.email },
    );
    setAviso('');
    setError('');
    document
      .getElementById(`form-${recurso}`)
      .scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  async function eliminar(fila) {
    const efecto = producto
      ? ''
      : ' También se eliminarán TODOS sus productos asociados.';
    if (
      !window.confirm(
        `¿Eliminar «${fila.nombre}»?${efecto} Este cambio no se puede deshacer.`,
      )
    )
      return;
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      await api.delete(`/${recurso}/${fila.id}`);
      if (editandoId === fila.id) limpiar();
      setAviso('Registro eliminado.');
      mostrar(await cargar());
    } catch (e) {
      setError(mensajeError(e));
    } finally {
      setOcupado(false);
    }
  }
  return (
    <section className="page crud-page">
      <div className="page-heading">
        <p className="eyebrow">
          {producto
            ? 'EL CORAZÓN DE TU PAPELERÍA'
            : 'PERSONAS QUE HACEN EQUIPO'}
        </p>
        <h1>
          {titulo}, <em>{producto ? 'en su lugar.' : 'en equipo.'}</em>
        </h1>
        <p className="intro">
          {producto
            ? 'Registra tus productos, actualiza su información y asígnalos a un usuario.'
            : 'Registra el nombre y correo de las personas que asociarás a tus productos.'}
        </p>
      </div>
      {!producto && admin && <p className="text-muted">Último inicio de sesión del equipo, en hora de Colombia. Se registra al ingresar correctamente; las cuentas anteriores comenzarán a mostrarlo en su próximo ingreso.</p>}
      {error && (
        <p role="alert" className="crud-error">
          {error}
        </p>
      )}
      {aviso && (
        <p role="status" className="crud-success">
          {aviso}
        </p>
      )}
      {admin && <div className="crud-panel">
        <div className="section-title">
          <h2>{editandoId ? `Editar ${singular}` : `Nuevo ${singular}`}</h2>
          <span className="small-tag">
            {editandoId ? `Registro #${editandoId}` : 'Empecemos aquí'}
          </span>
        </div>
        <form id={`form-${recurso}`} onSubmit={guardar}>
          <fieldset disabled={ocupado || cargando || cargandoImagen} className="crud-fields">
            <label>
              Nombre
              <input
                required
                maxLength={255}
                value={form.nombre}
                onChange={(e) => campo('nombre', e.target.value)}
              />
            </label>
            {producto ? (
              <>
                <label>
                  Precio de venta
                  <input
                    type="number"
                    min="0"
                    max="99999999.99"
                    step="0.01"
                    required
                    value={form.precio}
                    onChange={(e) => campo('precio', e.target.value)}
                  />
                </label>
                <label>Dirección de la imagen<input type="url" maxLength={2048} placeholder="https://ejemplo.com/producto.jpg" value={/^https?:/i.test(form.imagen || '') ? form.imagen : ''} onChange={e => campo('imagen', e.target.value.trim() || null)} pattern="https://.*" /><small>Pega el enlace directo de una foto pública HTTPS.</small><a href="/productos/fotos.html" target="_blank" rel="noreferrer">Ver fotos JPG de ejemplo ↗</a></label>
                <label>O subir imagen PNG o JPG<input type="file" accept="image/png,image/jpeg" onChange={cargarImagen} /><small>Hasta 5 MB. Se optimiza al cargar.</small></label>
                {form.imagen && <div><ImagenProducto producto={{ nombre: form.nombre, imagen: form.imagen }} /><button type="button" onClick={() => campo('imagen', null)}>Quitar imagen</button></div>}
                <label>Precio de costo<input type="number" min="0" max="99999999.99" step="0.01" required value={form.costo} onChange={(e) => { campo('costo', e.target.value); campo('confirmarCostoCero', false); }} /></label>
                <label>Cantidad disponible<input type="number" min="0" max="2147483647" step="1" required value={form.cantidad} onChange={(e) => campo('cantidad', e.target.value)} /></label>
                {form.costo !== '' && Number(form.costo) === 0 && <label className="check-line"><input type="checkbox" required checked={form.confirmarCostoCero} onChange={(e) => campo('confirmarCostoCero', e.target.checked)} />Confirmo guardar el costo en cero</label>}
                {form.costo !== '' && form.precio !== '' && Number(form.precio) < Number(form.costo) && <p role="status" className="crud-warning full-field">El precio de venta es menor al costo: posible pérdida económica.</p>}
                <label>
                  Usuario
                  <select
                    required
                    value={form.usuarioId}
                    onChange={(e) => campo('usuarioId', e.target.value)}
                  >
                    <option value="">Selecciona un usuario</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="full-field">
                  Descripción (opcional)
                  <textarea
                    rows={3}
                    maxLength={10000}
                    value={form.descripcion}
                    onChange={(e) => campo('descripcion', e.target.value)}
                  />
                </label>
              </>
            ) : (
              <label>
                Correo
                <input
                  type="email"
                  required
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => campo('email', e.target.value)}
                />
              </label>
            )}
            <div className="crud-actions full-field">
              <button
                className="crud-primary"
                type="submit"
                disabled={cargandoImagen || (producto && !usuarios.length)}
              >
                {ocupado
                  ? 'Guardando…'
                  : editandoId
                    ? 'Guardar cambios'
                    : `Crear ${singular}`}
              </button>
              {editandoId && (
                <button type="button" onClick={limpiar}>
                  Cancelar edición
                </button>
              )}
            </div>
          </fieldset>
        </form>
        {!producto && (
          <p className="crud-note">
            Los datos de usuarios y sus cuentas de acceso se gestionan por separado.
          </p>
        )}
        {producto && !cargando && !error && !usuarios.length && (
          <p className="crud-note">
            Primero crea un usuario en la sección Usuarios para registrar productos.
          </p>
        )}
      </div>}
      {producto && admin && <ImportarCostos actualizado={refrescar} />}
      {producto && <div className="crud-panel"><label>Buscar productos por nombre<input type="search" list="productos-sugeridos" autoComplete="off" maxLength={100} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Escribe el inicio del nombre" /></label><datalist id="productos-sugeridos">{filas.slice(0, 10).map((p) => <option key={p.id} value={p.nombre} />)}</datalist><p className="crud-note">Coincidencias por inicio del nombre. Hasta 100 resultados; las sugerencias se actualizan mientras escribes.</p></div>}
      <div className="crud-panel">
        <div className="section-title">
          <h2>{titulo} registrados</h2>
          <button
            type="button"
            disabled={ocupado || cargando}
            onClick={refrescar}
          >
            Actualizar lista
          </button>
        </div>
        {cargando ? (
          <p role="status">Cargando {recurso}…</p>
        ) : filas.length === 0 ? (
          <p className="crud-note">
            {error
              ? 'No se pudo cargar la lista.'
              : `No se encontraron ${recurso}${q ? " con ese nombre" : ""}.`}
          </p>
        ) : producto ? (
          <div className="catalogo-grid">{filas.map(fila => <article className="producto-tarjeta" key={fila.id}>
            <ImagenProducto producto={fila} /><div>
              <h2>{fila.nombre}</h2><strong>{Number(fila.precio).toLocaleString('es-CO', { style:'currency', currency:'COP' })}</strong>
              <p>Existencias · {fila.cantidad ?? 'Por completar'}</p>
              <p>{fila.descripcion || 'Sin descripción'}</p>
              <small>Responsable · {fila.Usuario?.nombre || 'Por asignar'}</small>
              {admin && <><p>Costo · {fila.costo ?? 'Por completar'}</p><div className="row-actions">
                <button disabled={ocupado} onClick={() => editar(fila)}>Editar</button>
                <button className="crud-danger" disabled={ocupado} onClick={() => eliminar(fila)}>Eliminar</button>
              </div></>}
            </div>
          </article>)}</div>
        ) : (
          <div
            className="table-scroll"
            tabIndex={0}
            role="region"
            aria-label={`Lista de ${recurso}`}
          >
            <table className="crud-table">
              <thead>
                <tr>
                  <th>{producto ? 'Imagen' : 'Tipo'}</th>
                  {!producto && <th>Número de documento</th>}
                  <th>Nombre</th>
                  {producto ? (
                    <>
                      <th>Precio de venta</th><th>Costo</th><th>Disponible</th>
                      <th>Descripción</th>
                      <th>Usuario</th>
                    </>
                  ) : (
                    <th>Correo</th>
                  )}
                  {!producto && admin && <><th>Rol</th><th>Último inicio de sesión</th></>}
                  {admin && <th>Acciones</th>}
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.id}>
                    <td>{producto ? <ImagenProducto producto={fila} /> : fila.tipoDocumento || '—'}</td>
                    {!producto && <td>{usuario.propietario ? fila.numeroDocumento || 'Pendiente' : 'Reservado'}</td>}
                    <td>{fila.nombre}</td>
                    {producto ? (
                      <>
                        <td className="price-cell">
                          {Number(fila.precio).toLocaleString('es-CO', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td>{fila.costo ?? 'Por completar'}</td><td>{fila.cantidad ?? 'Por completar'}</td>
                        <td>{fila.descripcion || '—'}</td>
                        <td>{fila.Usuario?.nombre || '—'}</td>
                      </>
                    ) : (
                      <td>{fila.email}</td>
                    )}
                    {!producto && admin && <><td>{roles[fila.rol] || 'Sin cuenta de acceso'}</td><td>{['administrador', 'cajero'].includes(fila.rol) ? (fila.ultimoInicioSesion ? <time dateTime={fila.ultimoInicioSesion}>{fechaInicio.format(new Date(fila.ultimoInicioSesion))}</time> : 'Sin registro desde esta actualización') : 'No aplica'}</td></>}
                    {admin && <td>
                      <div className="row-actions">
                        <button
                          disabled={ocupado}
                          onClick={() => editar(fila)}
                          aria-label={`Editar ${fila.nombre}`}
                        >
                          Editar
                        </button>
                        <button
                          className="crud-danger"
                          disabled={ocupado}
                          onClick={() => eliminar(fila)}
                          aria-label={`Eliminar ${fila.nombre}`}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
