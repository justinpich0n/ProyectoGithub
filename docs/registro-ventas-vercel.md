# Registro global de ventas — Vercel

La pestaña **Registro de ventas** (`/ventas`) es exclusiva del rol `administrador`, incluido un administrador que no sea propietario. Cajeros y compradores no ven el enlace y la API `/api/registro-ventas` responde 403 si intentan consultar directamente. Sin sesión devuelve 401.

El registro consulta las ventas guardadas de todas las cuentas de la tienda: comprobante, fecha en Colombia, vendedor, cliente, medio de pago, total y detalle imprimible. Permite filtrar por fechas y medio de pago, muestra resúmenes de todo el resultado y páginas de 25 ventas. Las fechas incluyen el día completo en UTC-5. El resumen y la lista comparten una instantánea de lectura para evitar discrepancias mientras se registran nuevos cobros.

Las cuentas de vendedor eliminadas se muestran como **Cuenta histórica** y sus ventas se conservan. No se crean, modifican ni eliminan ventas al consultar el registro. El acceso anterior a los últimos comprobantes propios en Caja se conserva.

Se trasladó la vista de registro existente de BizzStock a la rama usada por Vercel, manteniendo las funciones propias de su caja. No requiere migración de tablas.

Validación: 19 pruebas HTTP con tablas aisladas (401/403, administradores propietarios y no propietarios, ventas de dos cajeros, filtros, fechas límite, paginación, resumen global y vendedor histórico); lint de ambos proyectos y compilación React. Verificación visual con cuenta administradora y ventas ficticias de dos cuentas, incluida la apertura de comprobantes de otra cuenta.
