import Catalogo from './pages/Catalogo';
import Ventas from './pages/Ventas';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Solicitudes from './pages/Solicitudes';
import Cuentas from './pages/Cuentas';
import Cobro from './pages/Cobro';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Productos from './pages/Productos.jsx';
import './App.css';
import Clientes from './pages/Clientes';
import Sesion from './components/Sesion';
import { useSesion } from './services/sesion';

function Contenido() {
  const { usuario, salir } = useSesion();
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <header className="topbar">
          <span>Papelería & variedades</span>
          <span>{usuario.nombre} · {usuario.rol} <button onClick={salir}>Cerrar sesión</button></span>
          <span className="stage">
            <i />
            Proyecto en desarrollo
          </span>
        </header>
        <Routes>
          <Route path="/solicitudes" element={<Solicitudes />} />
          <Route path="/cuentas" element={<Cuentas />} />
          <Route path="/cobro" element={usuario.rol !== 'comprador' ? <Cobro /> : <Catalogo />} />
          <Route path="/ventas" element={usuario.rol === 'administrador' ? <Ventas /> : <Catalogo />} />
          <Route path="/catalogo" element={<Catalogo />} />
          <Route path="/" element={usuario.rol === 'comprador' ? <Catalogo /> : <Home />} />
          <Route path="/usuarios" element={usuario.rol === 'administrador' ? <Usuarios /> : <p className="page">Esta sección requiere administrador.</p>} />
          <Route path="/clientes" element={usuario.rol === 'administrador' ? <Clientes /> : <Catalogo />} />
          <Route path="/productos" element={usuario.rol === 'comprador' ? <Catalogo /> : <Productos />} />
        </Routes>
        <footer className="page-footer">
          <span>BizzStock · Arte y Belleza</span>
          <span>Hecho para el día a día de tu negocio. <a href="/productos/fotos.html" target="_blank" rel="noreferrer">Créditos de fotos</a></span>
        </footer>
      </main>
    </BrowserRouter>
  );
}

export default function App() { return <Sesion><Contenido /></Sesion>; }
