export default function ImagenProducto({ producto }) {
  return <img className="producto-imagen" src={producto.imagen || '/productos/producto.svg'} alt={producto.nombre} loading="lazy"
    onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/productos/producto.svg'; }} />;
}
