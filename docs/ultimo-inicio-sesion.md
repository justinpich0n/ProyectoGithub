# Último inicio de sesión del equipo

Actualización del 5 de noviembre de 2026.

## Uso

En **Usuarios**, las cuentas de administrador pueden ver el rol y el **Último inicio de sesión** de administradores y cajeros. La hora se muestra en la zona `America/Bogota`. El botón **Actualizar lista** consulta los datos más recientes.

Un login correcto en `/api/auth/login` guarda la fecha en `cuentas.ultimoInicioSesion`, usando la hora de la base de datos. Fallar la contraseña, consultar la sesión o recargar la página no la actualizan. El campo indica cuándo se inició sesión; no indica si la persona sigue conectada.

Las cuentas anteriores conservan el valor nulo hasta su próximo login correcto: se muestra **Sin registro desde esta actualización**. Crear una cuenta o recibir la sesión inicial del asistente de configuración no inventa un login histórico.

## Privacidad

- `/api/usuarios` y `/api/usuarios/:id` requieren administrador; los cajeros y compradores reciben HTTP 403 y las peticiones sin sesión, HTTP 401.
- Solo se añade la fecha al listado administrativo para cuentas de administrador o cajero. Los compradores y registros sin cuenta muestran **No aplica**.
- El catálogo, el resultado del login y la consulta de sesión no publican esta fecha. Las contraseñas y sus hashes no se incluyen en el listado.
- La fecha no es editable desde el formulario de usuarios ni mediante campos adicionales enviados al actualizar nombre/correo.

## Implementación y comprobaciones

Migración aditiva con columna `DATE(3)` nullable, sin borrar ni reconstruir tablas. Modelo `Cuenta`, login en Express y listado administrativo en React.

Comprobado: 73 pruebas de acceso/catálogo, incluidas persistencia del último acceso, ausencia de cambios ante errores/consulta de sesión, visibilidad para otro administrador, bloqueo de cajeros/compradores y rechazo de edición indirecta; además 49 pruebas de cobro. Lint de backend/frontend y compilación de React correctos.
