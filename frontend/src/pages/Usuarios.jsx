export default function Usuarios() {
  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">PERSONAS QUE HACEN EQUIPO</p>
        <h1>
          Un equipo conectado.
          <br />
          <em>Un negocio organizado.</em>
        </h1>
        <p className="intro">
          BizzStock contempla dos roles para acompañar el trabajo diario.
          <br />
          Sus permisos se definirán antes de habilitar el acceso.
        </p>
      </div>
      <div className="section-title">
        <h2>Roles previstos</h2>
        <span className="small-tag">Acceso en preparación</span>
      </div>
      <div className="roles-grid">
        {[
          [
            'A',
            'ORGANIZACIÓN DEL NEGOCIO',
            'Administrador',
            'Perfil previsto para la administración de la papelería y tienda de variedades.',
          ],
          [
            'C',
            'ATENCIÓN DEL DÍA A DÍA',
            'Cajero',
            'Perfil previsto para acompañar la operación de caja y la atención de ventas.',
          ],
        ].map(([letter, label, title, description]) => (
          <article className="role-card" key={letter}>
            <div className={'role-avatar ' + (letter === 'C' ? 'cashier' : '')}>
              {letter}
            </div>
            <div>
              <span className="eyebrow">{label}</span>
              <h2>{title}</h2>
              <p>{description}</p>
              <span className="role-note">Permisos por definir</span>
            </div>
          </article>
        ))}
      </div>
      <aside className="empty-state">
        <div className="empty-symbol" aria-hidden="true">
          ◎
        </div>
        <div>
          <span className="eyebrow">PRÓXIMA ETAPA</span>
          <h2>Un acceso pensado para cada rol.</h2>
          <p>
            El inicio de sesión y la gestión de permisos siguen pendientes. No
            hay cuentas ni datos personales mostrados en esta vista.
          </p>
        </div>
        <span className="small-tag">En preparación</span>
      </aside>
    </section>
  );
}
