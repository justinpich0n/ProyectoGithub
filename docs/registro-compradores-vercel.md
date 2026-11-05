# Registro de compradores en Vercel

Actualización: 5 de noviembre de 2026.

## Despliegue correcto

La URL usada por los visitantes es https://project-isy4c.vercel.app. Su producción parte de `justin/demo-vercel-hobby`; no se actualiza al publicar cambios en Render o en una rama de vista previa. Confirmar dominio y commit de producción al terminar cada actualización.

## Comportamiento

- En el ingreso hay dos accesos: **Registrarme como cliente** y **Solicitar acceso como cajero o administrador**.
- El cliente elige **Cliente / comprador · registro directo**, completa nombre, correo y contraseña y entra directamente al catálogo.
- Cajero y administrador conservan solicitud pendiente y autorización exclusiva del propietario.
- Correos existentes y solicitudes pendientes no se pueden volver a registrar como comprador. El alta de Usuario y Cuenta usa una transacción; la contraseña se conserva únicamente como hash con sal.
- Las sesiones se guardan en la base de datos, como en el resto de esta versión serverless.
- El comprador puede consultar nombre, descripción, precio y disponibilidad de productos. No recibe costos, advertencias económicas ni correo o datos del responsable.
- Las rutas de ventas y búsqueda de clientes exigen personal; las operaciones administrativas conservan sus controles. No basta con ocultar botones.
- Un producto no se puede asignar a un comprador; también se excluye de las opciones de responsables del formulario.

## Conservación y alcance

Se amplía únicamente el enum de `cuentas.rol` para aceptar `comprador`, sin eliminar datos ni cambiar roles anteriores. La preparación comprueba el esquema y se puede repetir. No se importan otras funcionalidades de la rama de Render ni se reemplazan los clientes o puntos existentes de la caja.

El nuevo acceso de comprador permite consultar el catálogo. Esta corrección no añade un perfil de puntos vinculado a la cuenta: el sistema de clientes y puntos que ya tiene esta rama sigue en caja.

## Comprobaciones

Suite de acceso con tablas aisladas: registro directo, sesión persistente, rechazo de duplicados, catálogo sin información privada, denegación de APIs del personal, asignación de productos y migración repetida sin pérdida de cuentas. Además se revisan lint, compilación y la interfaz del dominio público correcto.
