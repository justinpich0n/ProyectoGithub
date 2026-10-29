import axios from 'axios';
const api = axios.create({
  baseURL: 'http://127.0.0.1:3000/api',
  timeout: 10000,
});
api.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('bizzstock-token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, (error) => {
  if (error.response?.status === 401 && !error.config.url.endsWith('/login')) {
    sessionStorage.removeItem('bizzstock-token');
    window.dispatchEvent(new Event('bizzstock-sesion-cerrada'));
  }
  return Promise.reject(error);
});
export default api;
export function mensajeError(error) {
  return (
    error.response?.data?.error ||
    'No se pudo confirmar la operación. Comprueba el backend y actualiza la lista antes de repetirla.'
  );
}
