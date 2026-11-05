# Seguridad de BizzStock: explicación para la feria

Revisión del 5 de noviembre de 2026 sobre el código basado en `d8d931e` y la aplicación pública en Render. Es una revisión de alcance limitado, no una auditoría profesional ni una prueba de penetración. No garantiza ausencia de vulnerabilidades.

## Qué está implementado

| Medida | Cómo funciona y qué protege | Evidencia en el proyecto |
| --- | --- | --- |
| Hash de contraseñas | `scrypt`, sal aleatoria de 16 bytes y comparación con `timingSafeEqual`. Se guarda la sal y el hash, no la contraseña original. Un hash robado aún puede atacarse probando contraseñas. | `backend/src/auth/seguridad.js` |
| Autenticación | Token aleatorio de 32 bytes. El servidor conserva su hash y comprueba cuenta activa en cada petición privada. Expira a las ocho horas y el cierre de sesión lo invalida. | `seguridad.js`, `routes/auth.routes.js` |
| Autorización en el backend | Comprador: catálogo; personal: productos y cobro; administrador: clientes, usuarios e historial global; propietario: aprobación y creación de cuentas del equipo. Ocultar un botón no reemplaza estos controles. | `src/app.js`, `auth/propietario.js` |
| Alta controlada | El comprador obtiene solo ese rol. Las solicitudes del personal requieren aprobación del propietario. Las solicitudes expiran a las 24 horas; al resolverse o expirar se eliminan de ellas el hash de contraseña y los datos documentales. | `routes/solicitud.routes.js` |
| Protección del documento de las cuentas | AES-256-GCM con vector aleatorio y clave privada del entorno. Una huella HMAC-SHA-256 permite detectar números duplicados sin buscar el número en texto claro. El número completo solo lo devuelve el listado de usuarios al propietario. No es una validación oficial de identidad. | `auth/documento.js`, `controllers/usuario.controller.js` |
| Control de intentos | Cinco fallos de inicio de sesión por IP bloquean nuevos intentos durante el resto de la ventana de 15 minutos. Hay límites adicionales en solicitudes de alta y seguimiento. | `routes/auth.routes.js`, `auth/limitar.js` |
| Validación de entradas y consultas | Se revisan tipos, formatos, longitudes, precios, cantidades, documentos e imágenes. Sequelize y las consultas manuales con `replacements` separan los datos de las instrucciones SQL. Esto reduce riesgos de inyección; no garantiza inmunidad. | `controllers/validacion.js`, controladores, `config/esquema.js` |
| Duplicados y operaciones simultáneas | Restricciones únicas, normalización y transacciones con bloqueo en las altas. Las ventas usan un identificador de operación para evitar registrar dos veces el mismo cobro. No equivalen a un control automático de inventario. | `auth/documento.js`, modelos y `routes/venta.routes.js` |
| Respuestas limitadas | El catálogo del comprador excluye costos, cuentas y datos personales del responsable. Las respuestas de login no incluyen el hash de contraseña. Varias rutas sensibles usan `Cache-Control: no-store`. | `routes/catalogo.routes.js`, `routes/auth.routes.js`, controladores |
| HTTPS | La dirección pública carga por HTTPS con la verificación normal del certificado. Protege el tránsito navegador-servidor; no cifra automáticamente todos los campos almacenados. | `https://bizzstock.onrender.com` |
| Soporte TLS hacia la base de datos | Con `DB_SSL=true`, mysql2/Sequelize validan certificado e identidad del servidor. En esta revisión no se volvieron a abrir las variables privadas de Render: no se afirma su configuración actual a partir del endpoint de salud. | `config/ssl.js`, `config/database.js`, `src/db.js` |
| Secretos fuera de Git | `.env` y sus variantes privadas están ignorados; solo se rastrean los archivos `.env.example`. Se sirven los archivos compilados del frontend, no el repositorio completo. No publicar claves en el guion, capturas o demostración. | `.gitignore`, `src/app.js` |

## Qué no se debe prometer

- No estamos «libres de hackeo». Las medidas reducen riesgos y requieren mantenimiento, contraseñas fuertes, revisión de permisos y actualizaciones.
- Nombres, correos, teléfonos y direcciones de clientes se almacenan en campos normales; no tienen el cifrado específico que sí tiene el documento de las cuentas. La aplicación depende del control de acceso a esos datos y a la base de datos.
- El mínimo actual de contraseña es seis caracteres, una decisión de la maqueta. Para uso real hay que endurecer la política y revisar el costo de `scrypt` frente a las recomendaciones actuales. No hay doble factor de autenticación.
- El token vive en `sessionStorage`, accesible al JavaScript de ese origen. Una vulnerabilidad XSS podría robarlo. No usamos cookies HttpOnly para la sesión. React escapa el texto mostrado, pero eso no constituye por sí solo una protección completa contra XSS.
- En las respuestas públicas revisadas de la página principal no aparecieron CSP, HSTS, X-Content-Type-Options ni X-Frame-Options. Deben evaluarse y configurarse antes de presentarlas como implementadas.
- Sesiones y límites de intentos están en memoria; se reinician con el servidor y no se comparten entre réplicas. Varias personas tras una misma IP comparten el límite.
- La restricción CORS de orígenes no sustituye autenticación y autorización. No bloquea por sí sola a una persona que use herramientas HTTP.
- No se verificó una política de copias de seguridad, rotación de secretos, monitoreo continuo o retención de datos del proveedor. No afirmar que existen sin comprobarlo.
- No hay verificación de identidad contra una autoridad externa ni autorización por WhatsApp. El QR abre una dirección web y no concede privilegios.

## Comprobación realizada sin modificar datos públicos

- `/api/health`: HTTP 200, base de datos conectada en ese momento.
- `/api/usuarios`, `/api/clientes`, `/api/productos` y `/api/registro-ventas` sin token: HTTP 401.
- Dirección HTTPS verificada y cabeceras de la página principal revisadas.
- Comprobado que `.env` no está rastreado en Git y que `backend/.env` está ignorado. Esto no demuestra que nunca haya existido una filtración histórica ni revisa todas las configuraciones del proveedor.
- Se revisó el código de hash, sesiones, permisos, altas, cifrado de documentos y consultas. Las 109 pruebas de acceso/catálogo y cobro de la entrega anterior son pruebas funcionales, no un certificado de seguridad.

## Cómo responder si preguntan «¿pueden ver mi contraseña?»

«La aplicación no tiene una función para consultar la contraseña original: almacena un hash con sal y compara el resultado al iniciar sesión. Eso reduce el impacto de una filtración, pero una contraseña débil todavía podría adivinarse y debemos proteger también la aplicación, las claves y el servidor».

## Referencias para estudiar

- [OWASP: almacenamiento de contraseñas](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html).
- [OWASP: gestión de sesiones y almacenamiento en el navegador](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html).
- [OWASP: almacenamiento criptográfico](https://cheatsheetseries.owasp.org/cheatsheets/Cryptographic_Storage_Cheat_Sheet.html).
