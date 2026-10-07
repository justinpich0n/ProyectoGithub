import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <nav className="navbar" aria-label="Navegación principal">
      <h2>BizzStock</h2>
      <ul>
        <li><Link to="/">Inicio</Link></li>
        <li><Link to="/usuarios">Usuarios</Link></li>
        <li><Link to="/productos">Productos</Link></li>
      </ul>
    </nav>
  );
}

export default Navbar;
