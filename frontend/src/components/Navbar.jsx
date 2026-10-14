import { NavLink } from 'react-router-dom';
export default function Navbar() {
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <NavLink className="brand" to="/" aria-label="BizzStock, inicio">
        <span className="brand-mark">B.</span>
        <span>
          BizzStock<small>ARTE Y BELLEZA</small>
        </span>
      </NavLink>
      <p className="nav-label">TU ESPACIO DE TRABAJO</p>
      <ul>
        {[
          ['/', '⌂', 'Inicio'],
          ['/productos', '▦', 'Productos'],
          ['/usuarios', '◎', 'Usuarios'],
        ].map(([path, icon, label]) => (
          <li key={path}>
            <NavLink to={path} end>
              <span aria-hidden="true">{icon}</span>
              {label}
            </NavLink>
          </li>
        ))}
      </ul>
      <div className="nav-note">
        Un negocio, muchas ideas.
        <p>Un espacio pensado para organizar lo que haces crecer.</p>
      </div>
    </nav>
  );
}
