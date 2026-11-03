# Cuentas y cobro

Entrega de Justin del 3 de noviembre de 2026. Rama justin/cuentas-y-cobro.

## Crear cuentas desde la interfaz

Iniciar sesión como administrador, abrir Crear cuenta, completar nombre, correo, contraseña y confirmación, elegir cajero o administrador y guardar. Contraseña entre 6 y 128 caracteres; se guarda con scrypt. Se puede mostrar u ocultar al escribir. Rechaza correos con cuenta existente; permite habilitar un Usuario anterior sin sobrescribir sus datos. Un cajero no puede crear cuentas. El primer administrador de una instalación vacía sigue usando npm run crear:cuenta; no se habilita registro público de administradores.

## REQ-04

Cobro permite seleccionar productos y cantidades, ingresar monto recibido y ver cambio. El servidor obtiene precios de MySQL, calcula en centavos, rechaza datos inválidos, montos insuficientes y totales fuera de rango. Guarda total, recibido, cambio y detalle en ventas con transacción. Pago exacto muestra cero. Identificador único de operación impide duplicar el registro por repetición de solicitud.

## REQ-05

Método obligatorio: efectivo, tarjeta o pago móvil; persistido en Venta según la ficha original. Para medios electrónicos se registra el monto exacto, sin procesar cargos externos. La mención de Pago en CU16 y el flujo de producto de CU2 siguen como diferencias documentales para revisión del profesor; no se inventa una segunda entidad ni pagos mixtos. Este cierre acredita la ficha funcional; no declara corregidos los casos de uso contradictorios.

El registro de cobro no descuenta stock, no emite factura ni incluye crédito o apertura de caja. Esas fichas siguen pendientes. El detalle conserva nombre y precio al momento de cobro. No se declara completado el flujo comercial integral de venta.

## Validación

24 comprobaciones HTTP nuevas con MySQL: cuentas, permisos, acceso con contraseña de seis caracteres, duplicados, monto insuficiente, negativos, decimales inválidos, cantidades inválidas, método ausente, producto inexistente, manipulación de total, cambio, efectivo exacto, tarjeta, móvil y persistencia. Los datos ficticios propios se limpian. También pasaron las 54 comprobaciones PPI previas, health, lint backend y frontend y build de React. En navegador se verificaron las pantallas y cambio de 20 menos 10.25 igual a 9.75.

Archivos principales: cuenta.routes.js, venta.routes.js, Venta.js, Cuentas.jsx, Cobro.jsx y test/cobro.integration.js. Sin dependencias nuevas.
