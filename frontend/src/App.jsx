import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
          <Route path="/" element={<Home />} />
          <Route path="/usuarios" element={usuario.rol === 'administrador' ? <Usuarios /> : <p className="page">Esta sección requiere administrador.</p>} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/productos" element={<Productos />} />
        </Routes>
        <footer className="page-footer">
          <span>BizzStock · Arte y Belleza</span>
          <span>Hecho para el día a día de tu negocio.</span>
        </footer>
      </main>
    </BrowserRouter>
  );
}

export default function App() { return <Sesion><Contenido /></Sesion>; }
