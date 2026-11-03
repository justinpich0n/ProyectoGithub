# Solicitudes de acceso para la feria

Entrega solicitada por Justin el 3 de noviembre de 2026, en justin/solicitudes-y-aprobacion. Es una mejora de acceso solicitada para la demostración; no añade fichas al conjunto de 19 requisitos del PPI.

## Recorrido de demostración

El visitante abre el enlace público o escanea el QR del proyecto desplegado, pulsa Solicita tu acceso y completa nombre, correo, rol solicitado y contraseña con confirmación. El sistema guarda una solicitud, no una cuenta habilitada. La pantalla informa pendiente, aprobada, rechazada o expirada y consulta el estado cada diez segundos mientras esté abierta. La contraseña se deriva con scrypt; el propietario no puede verla.

El propietario inicia sesión, abre Solicitudes y pulsa Revisar solicitud. Ve nombre, correo y rol; puede cambiar los permisos antes de Aprobar o Rechazar. Aprobar crea la cuenta en una transacción y permite el inicio de sesión. Rechazar no crea acceso. No se modifica una decisión ya tomada; queda registrado el ID de la cuenta propietaria y la fecha. Una solicitud vence a las 24 horas. Al aprobar, rechazar o procesar una expiración se borra el hash de contraseña de la solicitud. Solo un token aleatorio privado permite consultar su estado público; no revela datos personales.

## Cuenta propietaria inicial

Esta instalación local no tenía cuentas administradoras. Se prepara un enlace privado de un solo uso para el asistente visual del propietario. La clave viaja en el fragmento del enlace, no en el QR ni en la consulta URL; el frontend la retira de la barra y la envía en una cabecera al guardar. El backend compara su SHA-256 con BIZZSTOCK_SETUP_TOKEN_HASH, guardado solo en .env. Una clave incorrecta no habilita el asistente. El registro único de configuración impide instalar dos propietarios aunque haya intentos simultáneos. Después de configurarlo no se puede repetir, aunque se borren cuentas.

No se incluyen contraseñas o cuentas predeterminadas. La clave y el enlace privados no se publican en Git. En un despliegue nuevo se debe preparar una clave privada de configuración y su hash, o migrar de forma segura la base ya configurada. El asistente no reemplaza ni se apropia de cuentas anteriores: si una instalación ya tiene cuentas pero no propietario registrado, debe revisarse y asignarse explícitamente su propietario con acceso autorizado a la base.

## Permisos y privacidad

Solo la cuenta identificada en configuracion_acceso puede listar solicitudes, decidir y crear cuentas directamente. Ser administrador no permite autorizar nuevos accesos. Otros administradores no pueden modificar el usuario propietario; nadie puede borrarlo desde el CRUD. El solicitante no puede asignarse el permiso de propietario. El rol solicitado se convierte en efectivo únicamente tras la aprobación. El correo distingue duplicados normalizados a minúsculas.

Se limitan las solicitudes por IP y el volumen pendiente; los límites de intentos viven en esta instancia del servidor. Un despliegue con varias réplicas deberá compartir los límites. El seguimiento no es una verificación de propiedad del correo. Las sesiones siguen en memoria: reiniciar el servidor obliga a iniciar sesión otra vez.

## Celular y QR

Solicitudes está adaptado a 390 píxeles y tiene botones grandes. Compartir acceso genera el QR en el propio navegador mediante qrcode, sin enviar el teléfono ni el enlace a terceros. El QR solo contiene el enlace público con solicitar=1; no autoriza cuentas. En localhost se muestra un aviso en lugar de un QR inservible para otro dispositivo. El acceso desde un teléfono externo requiere el despliegue HTTPS; este cambio no publica el proyecto ni abre la Mac a la red.

FRONTEND_ORIGIN configura el origen CORS exacto del backend. VITE_API_BASE_URL configura la API del frontend al compilar. En local conservan 127.0.0.1:5173 y 127.0.0.1:3000/api. Nunca colocar contraseñas, tokens Twilio ni claves de configuración en variables VITE_.

No se usa WhatsApp ni se envían notificaciones o mensajes. Las credenciales de la exploración anterior, si siguen en .env local, no son utilizadas por este flujo. No se activó pago alguno en Twilio.

## Evidencia

35 pruebas HTTP nuevas con MySQL y tablas ficticias aisladas: clave privada, carrera inicial, permisos exclusivos, cuenta pendiente sin login, duplicados, aprobación, rechazo, expiración, privacidad del hash y protección del propietario. También pasaron las 54 pruebas PPI previas y las 24 de cobro, health, lint y build. La prueba de cobro usa su propia tabla de configuración para no cambiar al propietario real.

En navegador: solicitud ficticia, revisión del propietario a 390 por 844 píxeles, aprobación, actualización automática al visitante e ingreso como cajero sin acceso al panel de autorización. Las tablas de demostración se eliminan al finalizar. No se certifica aún una prueba desde un teléfono físico fuera del Mac, porque el proyecto sigue local.

La auditoría npm del frontend informó avisos en dependencias existentes (eslint y transitivas, follow-redirects y zod); no corresponden a qrcode. Deben revisarse antes de un despliegue público y no se ejecutó una actualización forzada fuera de este alcance.
