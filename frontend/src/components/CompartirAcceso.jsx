import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
export default function CompartirAcceso({ abierto = false }) {
  const [qr, setQr] = useState(''); const [mensaje, setMensaje] = useState('');
  const enlace = new URL('/?solicitar=1', window.location.origin).href;
  const esLocal = (/^127\./.test(window.location.hostname) || ['localhost', '[::1]'].includes(window.location.hostname));
  useEffect(() => {
    if (esLocal) return;
    let vigente = true;
    QRCode.toDataURL(enlace, { width: 280, margin: 2, errorCorrectionLevel: 'M', color: { dark: '#203f36', light: '#ffffff' } }).then(url => { if (vigente) setQr(url); }).catch(() => { if (vigente) setMensaje('No se pudo crear el QR. Puedes compartir el enlace.'); });
    return () => { vigente = false; };
  }, [enlace, esLocal]);
  async function copiar() { try { await navigator.clipboard.writeText(enlace); setMensaje('Enlace copiado.'); } catch { setMensaje('Selecciona y copia el enlace que aparece abajo.'); } }
  return <details className="share-access" open={abierto || undefined}><summary>Compartir acceso con visitantes</summary><p>Este enlace abre el formulario público. No incluye tu teléfono ni da permiso para entrar.</p>{esLocal ? <p>Estás en una dirección local. El QR se habilitará al abrir BizzStock desde su dirección desplegada; un celular no puede abrir el localhost de tu Mac.</p> : qr && <img src={qr} width="280" height="280" alt="QR para solicitar una cuenta de BizzStock" />}<a className="approval-email" href={enlace} target="_blank" rel="noreferrer">{enlace}</a><button className="welcome-link" onClick={copiar}>Copiar enlace público</button>{mensaje && <p role="status">{mensaje}</p>}</details>;
}
