import axios from 'axios';
export default axios.create({
  baseURL: 'http://127.0.0.1:3000/api',
  timeout: 10000,
});
export function mensajeError(error) {
  return (
    error.response?.data?.error ||
    'No se pudo confirmar la operación. Comprueba el backend y actualiza la lista antes de repetirla.'
  );
}
