export default function Productos() {
  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">EL CORAZÓN DE TU PAPELERÍA</p>
        <h1>
          Cada producto,
          <br />
          <em>en su lugar.</em>
        </h1>
        <p className="intro">
          Un catálogo pensado para reunir la información de tus productos
          <br />y facilitar el control de la papelería y tienda de variedades.
        </p>
      </div>
      <div className="section-title">
        <h2>Así se organizará tu catálogo</h2>
        <span className="small-tag">Alcance previsto</span>
      </div>
      <div className="detail-grid">
        {[
          [
            '01',
            'Información del producto',
            'Registro, consulta, búsqueda y edición de los productos del negocio.',
            'Un catálogo fácil de consultar',
          ],
          [
            '02',
            'Costos y precios',
            'Información del costo y precio de venta de cada producto, en un mismo lugar.',
            'Datos claros para cada artículo',
          ],
          [
            '03',
            'Existencias y alertas',
            'Control de las unidades disponibles y alertas al alcanzar el stock mínimo.',
            'Visibilidad sobre el inventario',
          ],
        ].map(([n, title, description, foot]) => (
          <article className="detail-card" key={n}>
            <span className="detail-number">{n}</span>
            <h3>{title}</h3>
            <p>{description}</p>
            <span className="detail-bottom">{foot}</span>
          </article>
        ))}
      </div>
      <aside className="empty-state">
        <div className="empty-symbol" aria-hidden="true">
          ▦
        </div>
        <div>
          <span className="eyebrow">PRÓXIMA ETAPA</span>
          <h2>Tu catálogo está por comenzar.</h2>
          <p>
            Esta sección presenta las funciones previstas. Todavía no permite
            registrar ni consultar productos almacenados.
          </p>
        </div>
        <span className="small-tag">En preparación</span>
      </aside>
    </section>
  );
}
