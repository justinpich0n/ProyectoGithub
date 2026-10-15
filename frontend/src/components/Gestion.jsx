import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { mensajeError } from '../services/api';

export default function Gestion({ producto = false }) {
  const recurso = producto ? 'productos' : 'usuarios';
  const singular = producto ? 'producto' : 'usuario';
  const titulo = producto ? 'Productos' : 'Usuarios';
  const vacio = producto
    ? { nombre: '', precio: '', descripcion: '', usuarioId: '' }
    : { nombre: '', email: '' };
  const [filas, setFilas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [form, setForm] = useState(vacio);
  const [editandoId, setEditandoId] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [ocupado, setOcupado] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const cargar = useCallback(
    async (signal) => {
      const [lista, equipo] = await Promise.all([
        api.get(`/${recurso}`, { signal }),
        producto ? api.get('/usuarios', { signal }) : Promise.resolve(null),
      ]);
      return { lista, equipo };
    },
    [recurso, producto],
  );
  function mostrar({ lista, equipo }) {
    setFilas(lista.data);
    if (equipo) setUsuarios(equipo.data);
  }
  useEffect(() => {
    const controller = new AbortController();
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
    return () => controller.abort();
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
  async function guardar(e) {
    e.preventDefault();
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      if (editandoId) await api.put(`/${recurso}/${editandoId}`, form);
      else await api.post(`/${recurso}`, form);
      setAviso(editandoId ? 'Cambios guardados.' : 'Registro creado.');
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
            nombre: fila.nombre,
            precio: fila.precio,
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
      <div className="crud-panel">
        <div className="section-title">
          <h2>{editandoId ? `Editar ${singular}` : `Nuevo ${singular}`}</h2>
          <span className="small-tag">
            {editandoId ? `Registro #${editandoId}` : 'Empecemos aquí'}
          </span>
        </div>
        <form id={`form-${recurso}`} onSubmit={guardar}>
          <fieldset disabled={ocupado || cargando} className="crud-fields">
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
                  Precio
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
                disabled={producto && !usuarios.length}
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
            Estos registros todavía no habilitan inicio de sesión ni permisos.
          </p>
        )}
        {producto && !cargando && !error && !usuarios.length && (
          <p className="crud-note">
            Primero <Link to="/usuarios">crea un usuario</Link> para registrar
            productos.
          </p>
        )}
      </div>
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
              : `Todavía no hay ${recurso}. Crea el primero con el formulario.`}
          </p>
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
                  <th>ID</th>
                  <th>Nombre</th>
                  {producto ? (
                    <>
                      <th>Precio</th>
                      <th>Descripción</th>
                      <th>Usuario</th>
                    </>
                  ) : (
                    <th>Correo</th>
                  )}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((fila) => (
                  <tr key={fila.id}>
                    <td>#{fila.id}</td>
                    <td>{fila.nombre}</td>
                    {producto ? (
                      <>
                        <td className="price-cell">
                          {Number(fila.precio).toLocaleString('es-CO', {
                            minimumFractionDigits: 2,
                          })}
                        </td>
                        <td>{fila.descripcion || '—'}</td>
                        <td>{fila.Usuario?.nombre || '—'}</td>
                      </>
                    ) : (
                      <td>{fila.email}</td>
                    )}
                    <td>
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
                    </td>
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
