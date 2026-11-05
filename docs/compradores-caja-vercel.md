# Cuentas de comprador vinculadas a clientes de caja

## Error corregido

El registro público creaba Usuario y Cuenta, pero la búsqueda de Caja consultaba únicamente Clientes. El comprador no aparecía y no era posible atribuirle la venta. Ahora el registro crea también una ficha Cliente vinculada por `usuarioId`, en la misma transacción.

## Cuentas ya creadas y conservación

Al preparar la API de Vercel se añade `clientes.usuarioId` nullable con un índice único y vínculo a Usuarios. Se permite teléfono y dirección pendientes (NULL); no se inventan datos. Después se crean las fichas que falten para los compradores existentes. La sincronización es repetible y el índice único impide duplicar fichas por concurrencia.

Se conservan clientes manuales, sus teléfonos, direcciones, ventas y puntos. No se fusionan personas por nombre, aunque coincida. Una cuenta y un cliente manual con el mismo nombre permanecen separados hasta que el negocio verifique su identidad. Al eliminar un Usuario se conserva su ficha Cliente con usuarioId NULL y sus ventas históricas.

## Recorrido

1. El comprador crea su cuenta y obtiene una ficha de Cliente automáticamente.
2. Cajero o administrador busca por nombre, correo o teléfono en Caja. El correo distingue compradores con nombres iguales.
3. Selecciona el cliente y confirma el pago. La venta conserva su identificador de Cliente y la fotografía del nombre, correo y teléfono conocidos.
4. La clasificación suma 1 punto por cada $1.000 completos de cada compra. $12.500 suma 12 puntos. Reintentar la misma operación no duplica ventas ni puntos.

No se atribuyen compras anónimas por suposición ni se cambian ventas anteriores. Solo personal puede consultar el buscador de clientes; los compradores no acceden a esa API.

## Validación

- 14 respuestas HTTP con tablas aisladas: alta, búsqueda por nombre/correo/teléfono, cobro, comprobante guardado, registro global, puntos, operación repetida y permisos. También se prueba migrar el esquema antiguo, conservar un cliente manual, recuperar un comprador previo, repetir la sincronización en paralelo y conservar fichas al eliminar usuarios de prueba.
- 58 pruebas de acceso y 19 de registro global repetidas: 91 respuestas HTTP en total.
- Lint de ambos proyectos y compilación React.
- Prueba de navegador con datos ficticios: registrar comprador → iniciar como cajero → encontrar por correo → seleccionar → cobrar → comprobar los puntos.
