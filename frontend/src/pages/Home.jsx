import { Link } from 'react-router-dom';
export default function Home() {
  return (
    <section className="page">
      <div className="page-heading">
        <p className="eyebrow">BIENVENIDO A BIZZSTOCK</p>
        <h1>
          Más orden.
          <br />
          Más espacio para <em>crecer.</em>
        </h1>
        <p className="intro">
          Cada producto tiene su lugar. Cada idea, su oportunidad.
          <br />
          El nuevo espacio de trabajo de Arte y Belleza empieza aquí.
        </p>
      </div>
      <div className="home-grid">
        <Link className="feature-card products-card" to="/productos">
          <div className="card-top">
            <span>01 / PRODUCTOS</span>
            <span className="arrow">↗</span>
          </div>
          <div className="stationery" aria-hidden="true">
            <div className="notebook">
              B.
              <i />
              <i />
              <i />
            </div>
            <div className="pencil" />
            <div className="paper">
              Ideas que
              <br />
              toman forma.
              <i />
            </div>
          </div>
          <div>
            <h2>
              Todo empieza
              <br />
              con un buen catálogo.
            </h2>
            <p>Conoce el espacio para organizar tus productos.</p>
            <span className="card-action">Explorar productos →</span>
          </div>
        </Link>
        <Link className="feature-card people-card" to="/usuarios">
          <div className="card-top">
            <span>02 / USUARIOS</span>
            <span className="arrow">↗</span>
          </div>
          <div className="people-art" aria-hidden="true">
            <span>A</span>
            <span>C</span>
            <i>EN EQUIPO</i>
          </div>
          <div>
            <h2>
              Las personas
              <br />
              detrás del negocio.
            </h2>
            <p>Registra y consulta los usuarios de tu equipo.</p>
            <span className="card-action">Explorar usuarios →</span>
          </div>
        </Link>
      </div>
      <aside className="status-strip">
        <span className="status-icon" aria-hidden="true">
          ✦
        </span>
        <div>
          <h3>Estamos construyendo lo que sigue.</h3>
          <p>
            Ya puedes crear, consultar, editar y eliminar usuarios y productos.
            También puedes buscar productos, registrar costos y gestionar clientes con tu cuenta. Las ventas, pagos y alertas de inventario siguen pendientes.
          </p>
        </div>
        <span className="small-tag">Etapa inicial</span>
      </aside>
    </section>
  );
}
