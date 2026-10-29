# Implementación de cinco requisitos del PPI

29 de octubre de 2026. Rama justin/ppi-busqueda-clientes-costos-precios. Implementación atribuida a Justin. Estado: implementado y probado en rama, pendiente de revisión e integración en master mediante [PR #29](https://github.com/justinpich0n/ProyectoGithub/pull/29). Commit principal: 868d4ed. Esta entrega no fusiona la PR de documentación #18 ni reescribe el historial.

## Alcance y evidencia

| Requisito | Resultado implementado | Evidencia |
| --- | --- | --- |
| REQ-03 | Búsqueda por inicio del nombre, índice MySQL y sugerencias dinámicas con espera de 250 ms, consulta de resultados y reintento ante error. Hasta 100 resultados; comodines se tratan como texto literal. | producto.controller.js, índice productos_nombre_busqueda, Gestion.jsx y prueba HTTP/React. |
| REQ-08 | Alta y consulta de Cliente con nombre completo, teléfono y dirección obligatorios, teléfono validado y control de duplicados. Requiere administrador. | Modelo Cliente, controlador/rutas, Clientes.jsx y prueba HTTP/React. |
| REQ-09 | Búsqueda, consulta y edición de cliente existente, validaciones, errores 400/404/409 y persistencia. Requiere administrador. | PUT /api/clientes/:id, Clientes.jsx y recarga en navegador. |
| REQ-12 | Costo requerido en altas/ediciones, confirmación explícita si es cero, importación CSV de hasta 500 costos con transacción de todas o ninguna fila. | datosProducto, POST /api/productos/costos/importar, ImportarCostos.jsx y prueba de reversión. |
| REQ-13 | Precio de venta requerido, edición con precisión monetaria y advertencia si queda por debajo del costo; API e interfaz. Requiere administrador. | datosProducto, advertencias de API, Gestion.jsx y prueba de edición en navegador. |

## Decisiones de implementación que revisa la PR

Se conserva el PPI original y se añade un anexo de implementación en su copia local. Las descripciones desplazadas de REQ-09, REQ-12 y REQ-13 no se cambian silenciosamente: esta entrega implementa sus títulos junto con CU9, CU7 y CU6. Crédito y alertas permanecen pendientes.

La búsqueda es por prefijo del nombre para utilizar el índice. No se declara búsqueda por cualquier fragmento interior ni full-text. El teléfono normalizado se usa para identificar duplicados de clientes (se eliminan espacios, guiones y paréntesis; no se interpreta el país automáticamente). Esta regla se declara expresamente para revisión funcional. El CSV requiere cabecera id,costo o id;costo y punto decimal; una fila por ID, sin repetidos. Un producto inexistente invalida todo el lote. No añade nuevas funciones comerciales.

## Acceso mínimo y datos anteriores

Como soporte de los casos de uso, se añade Cuenta con contraseña derivada mediante scrypt, rol administrador/cajero y sesiones opacas de ocho horas. El token permanece en sessionStorage, se invalida al salir y las sesiones del servidor caducan al reiniciar. Hay límite de intentos de acceso. El backend continúa ligado a 127.0.0.1; CORS admite el frontend local. No se agregaron dependencias nuevas: se usan Node, Express, Sequelize, MySQL y React existentes.

Se requiere sesión para consultar productos y administrador para modificar productos, importar costos, gestionar clientes y usuarios. Esto no completa la matriz de permisos de ventas, caja o crédito, todavía pendientes. Los usuarios existentes no reciben contraseñas ni permisos automáticamente. Se conserva la relación de práctica que elimina productos al borrar su usuario, con confirmación visible; su política de negocio sigue pendiente.

La migración agrega costo y cantidad como columnas anulables de productos anteriores, sin inventar datos. En un registro nuevo o editado se exigen valores explícitos. Añade tablas cuentas/clientes e índice de nombre. No usa sync force/alter ni borra información previa. Antes de cambiar la cuenta de MySQL o migrar otro equipo, respaldar su base y revisar permisos conforme a sus datos; las pruebas solo limpian sus propios registros ficticios.

## Cómo ejecutarlo y demostrarlo

1. En backend ejecutar npm run crear:cuenta una vez, desde una terminal interactiva. Introducir nombre, correo, rol y contraseña de 12 a 128 caracteres; la contraseña no se muestra ni se guarda en Git. El asistente no sobrescribe cuentas existentes.
2. Iniciar backend con npm run dev y frontend con npm run dev -- --host 127.0.0.1 --strictPort, en terminales distintas. Evitar arrancar otra copia si los puertos ya están ocupados.
3. Abrir http://127.0.0.1:5173 e iniciar sesión. En Productos registrar nombre, costo, precio, cantidad y usuario. Probar costo cero y la advertencia precio menor al costo.
4. Escribir el inicio del nombre en Buscar productos; elegir una sugerencia o revisar la tabla. Con un nombre inexistente se muestra el resultado vacío.
5. En Clientes registrar datos ficticios, editar dirección y recargar. Intentar un teléfono duplicado para ver el rechazo.
6. En Actualizar costos desde un archivo cargar un CSV de IDs existentes. Comprobar que una fila inválida no deja cambios parciales.

## Comprobaciones

El 29 de octubre pasaron npm test y npm run test:ppi del backend: 54 respuestas HTTP, permisos 401/403, búsqueda, validación monetaria, confirmación de costo cero, duplicados, cliente inexistente, importación atómica, persistencia, logout e índice. También se verificó conservación de nombre y precio de los productos previos. npm run test:integration utiliza la misma prueba actualizada, porque las rutas antiguas ya exigen sesión y los campos del PPI.

React pasó lint y build. En navegador se registró y editó un cliente ficticio, se comprobó la dirección tras recarga, se registró producto con aviso de pérdida, se filtró por nombre, se importó un CSV y se modificó precio. Se comprobó el resultado en MySQL; sin errores de consola observados. Evidencias locales fuera de Git en evidencias-bizzstock.

## Aportes de compañeros

Al revisar GitHub no había ramas ni PR de Yulian o Diryan. No se atribuyen aportes inexistentes. Para que sus adelantos queden registrados, cada uno debe clonar con su cuenta, configurar su nombre y correo de Git, crear su rama (yulian/... o diryan/...), aportar commits y abrir PR con su tarea y pruebas. Una rama con su nombre creada por otra cuenta no cambia el autor de los commits ni el autor de la PR.
