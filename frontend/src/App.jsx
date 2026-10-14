import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Home from './pages/Home.jsx';
import Usuarios from './pages/Usuarios.jsx';
import Productos from './pages/Productos.jsx';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <header className="topbar">
          <span>Papelería & variedades</span>
          <span className="stage">
            <i />
            Proyecto en desarrollo
          </span>
        </header>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/usuarios" element={<Usuarios />} />
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

export default App;
