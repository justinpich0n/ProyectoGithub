# Perfil de compras, puntos y documentos en Vercel

Actualización: 5 de noviembre de 2026.

## Problema y corrección

La versión de producción de Vercel vinculaba al comprador con Cliente y guardaba la venta, pero todavía no incluía el perfil personal de puntos ni el formulario de documento. Estas funciones estaban en otra copia del proyecto. Esta entrega las incorpora a la rama de producción `justin/demo-vercel-hobby` sin sustituir usuarios, productos o ventas.

- **Comprador:** pestaña **Mis compras y puntos**. Muestra exclusivamente sus compras, total gastado, puntos y comprobantes. El botón Actualizar consulta nuevamente el servidor.
- **Administración:** desde Clientes puede abrir el historial de compras y puntos de un cliente. El registro global de ventas conserva su acceso exclusivo de administrador.
- **Caja:** el personal selecciona al cliente por nombre, correo o teléfono antes de confirmar. Una venta sin cliente no se atribuye después por coincidencia de nombres.
- **Puntos:** un punto por cada COP $1.000 completos en cada venta. Una compra de $12.500 suma 12 puntos. Se calculan a partir de las ventas guardadas, sin un saldo separado que pueda desincronizarse. Reintentar una operación con el mismo UUID conserva el rechazo 409 y no duplica puntos.
- **Identidad:** CC, TI, CE, PA o PPT en el registro y en el panel del propietario para crear cuentas. Las cuentas anteriores deben completar el dato al entrar; se persiste en Cuenta y deja de solicitarse en sesiones posteriores.
- **Duplicados:** se rechazan correo o documento ya utilizados por una cuenta o solicitud vigente, incluso si el registro es simultáneo. El documento se normaliza; el tipo distinto o ceros iniciales no permiten reutilizar el mismo número numérico.
- El número se cifra con AES-256-GCM; una huella HMAC permite comprobar unicidad. Solo el propietario recibe el número completo en el listado de usuarios. No se devuelve el cifrado, su huella ni contraseñas. Se mantienen los permisos existentes de cajeros y compradores.

## Configuración y conservación

`BIZZSTOCK_DOCUMENTO_KEY` es una variable privada estable de al menos 32 caracteres. Se configura en el entorno que sirve la API; en Vercel, en Production antes del despliegue. Conservar una copia privada. No guardarla en Git ni regenerarla en cada despliegue: cambiarla impediría leer documentos anteriores y detectar sus duplicados correctamente.

La preparación añade columnas nulas e índice único sin `force` ni `alter`. No borra cuentas ni adjudica ventas por nombre. Comprueba que un documento existente pueda descifrarse con la clave configurada y falla si la clave es incorrecta. Las cuentas anteriores comienzan sin documento hasta que su titular lo complete.

## Verificación

- 243 comprobaciones HTTP en tablas aisladas: acceso (58), vínculo comprador/caja (14), registro global (19), perfil y documentos (50), cobro (48), requisitos de productos/clientes/costos (54).
- Dos pruebas automáticas adicionales de health/CORS; lint de frontend/backend y compilación React.
- Prueba visual local con datos ficticios: cuenta anterior sin documento, guardado, venta de $12.500 desde un cajero, perfil del comprador con 12 puntos, cierre e inicio de sesión sin pedir nuevamente documento, recarga conservando historial y apertura del comprobante.
- Privacidad: intento de consultar otro cliente mediante parámetros no cambia el perfil propio; cajeros no acceden al historial administrativo; documentos completos solo para el propietario. Se prueban duplicados simultáneos, migración repetida y cifrado persistente.

Ejecutar `npm run test:regresion` desde backend con una base de pruebas MySQL configurada y accesible. Las suites usan tablas con prefijo aleatorio y retiran únicamente las suyas al terminar. No ejecutar pruebas que repliquen datos reales de clientes.

La verificación local no reemplaza la del despliegue: confirmar el commit de Production, el bundle público y `/api/health` después de publicar. El perfil se consulta desde `/mi-perfil` con una cuenta de comprador; el acceso sin sesión debe responder 401.
