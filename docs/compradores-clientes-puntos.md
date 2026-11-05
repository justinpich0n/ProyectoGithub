# Compradores, clientes e historial de puntos

Actualización del 5 de noviembre de 2026.

## Recorrido

**Registro de comprador → ficha automática en Clientes → venta asociada en Caja → historial y puntos en el perfil.**

La relación usa identificadores internos únicos: no se mezclan personas por compartir nombre. Los compradores existentes también reciben su ficha al actualizar la aplicación; el proceso se puede repetir sin duplicar registros.

No se inventan teléfonos ni direcciones al registrar una cuenta. Si no se han proporcionado, se muestran **Por completar**; el administrador puede completarlos en Clientes. En Caja se busca al comprador por nombre, correo o teléfono. El comprador recibe únicamente permisos de catálogo y perfil propio.

## Formas de crear la cuenta

En la pantalla de ingreso, **Registrarme como cliente** abre el registro con **Cliente / comprador · registro directo** seleccionado. El botón separado **Solicitar acceso como cajero o administrador** abre el flujo del personal, que conserva la aprobación del propietario.

El propietario también puede elegir **Cliente / comprador** en **Crear cuenta**. Tanto ese formulario como el registro público crean la cuenta y su ficha de Clientes en una sola transacción, conservando los controles de correo/documento duplicados. Un comprador no puede crear cuentas de otras personas.

Los mensajes de un intento de ingreso anterior se limpian al abrir el registro. La consulta periódica de solicitudes se ejecuta únicamente mientras se consulta su estado.

## Puntos y compras

- Cada venta asignada suma **1 punto por cada COP $1.000 completos de esa compra**. Una compra de $12.500 suma 12; dos compras de $500 suman cero, porque la regla se aplica por compra.
- Los puntos se calculan desde ventas guardadas, no desde cantidades que envíe el navegador. El mismo identificador de operación no registra dos cobros, aunque lleguen solicitudes simultáneas.
- No se suman puntos al registrarse, ver productos ni agregar un carrito. Una venta sin cliente conserva su comprobante, pero no se acredita a ninguna cuenta.
- El comprador abre **Mis compras y puntos** para ver puntos, cantidad de compras, total gastado, productos de cada compra y comprobantes. El historial es paginado; los resúmenes abarcan todas sus compras. Resumen e historial se consultan con una misma instantánea transaccional.
- El administrador ve puntos y cantidad de compras en **Clientes**, y puede abrir el historial de cada cliente. El cajero puede buscar clientes para asociar cobros, pero no consultar sus historiales.
- El comprador solo puede acceder a su perfil; enviar el identificador de otra persona no cambia ese alcance. Los datos de otros compradores, documentos, contraseñas y datos del cajero no se publican en ese perfil.
- El nombre de una cuenta vinculada se mantiene sincronizado al editarlo desde Usuarios o Clientes.

## Datos anteriores

Se conserva la fotografía histórica de cada venta (productos, precios, cliente y vendedor). Solo se completa la relación `ventas.clienteId` cuando el comprobante anterior ya incluía un identificador de cliente válido. Las ventas anónimas o con identificadores inexistentes no se atribuyen por suposición.

Los clientes manuales antiguos no se fusionan por nombre con una cuenta recién registrada: no contamos con una identidad verificada que permita hacerlo. Sus compras permanecen en su registro administrativo original. Se debe confirmar esa relación antes de plantear una vinculación o fusión manual futura.

Las migraciones añaden vínculos e índices sin borrar tablas ni registros. La ficha de cliente se conserva si se elimina su usuario de acceso y conserva las ventas que tenga asociadas.

## Premios

El perfil muestra una invitación general a acumular puntos para futuros premios y beneficios. No se anuncian televisores, neveras, valores de canje ni fechas. Las condiciones y disponibilidad quedan pendientes de definición por el negocio. No se implementa un canje real ni un catálogo de premios en esta entrega.

## Validación

- `npm run test:fidelidad`: 37 respuestas HTTP con tablas aisladas; alta automática, nombres iguales, vínculo por correo en caja, puntos por monto, idempotencia concurrente, privacidad, recuperación de vínculos antiguos, paginación y alta de comprador por el propietario con validación de permisos y duplicados.
- En esta actualización se repitieron las 73 pruebas de acceso y las 37 de fidelidad: **110 respuestas HTTP verificadas**. Las suites de cobro (49) y PPI (54) corresponden a la validación de la entrega anterior.
- Lint de backend y frontend, compilación de React y revisión visual con datos ficticios.
