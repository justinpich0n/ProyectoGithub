# Backlog de requisitos del PPI

Revision: 28 de octubre de 2026. Fuente: PPI_INGENIERIA_DE_SOFTWARE_ArchivoActualizado.docx, secciones 2.1 y 2.2. El backlog de producto se compone exactamente de 14 fichas funcionales y 5 no funcionales. No se agregan faltantes tecnicos como si fueran requisitos del PPI.

[Vista Requisitos PPI](https://github.com/users/justinpich0n/projects/1/views/1) filtrada y guardada con label:ppi. Las issues con etiqueta soporte conservan el trabajo tecnico y organizativo, y no se cuentan dentro de las 19 fichas. Los avances terminados siguen atribuidos a Justin. Los responsables que aparecen abajo asumen lo pendiente o su validacion; el reparto conserva los modulos y separa las fichas que antes estaban agrupadas.

## Estados de cumplimiento

- Pendiente: funcion o capacidad ausente.
- Parcial: existe evidencia de una parte, pero no cumple todos los criterios.
- Sin verificar: falta una prueba adecuada; no se afirma que falle ni que cumpla.
- Completo: todos los criterios acordados comprobados. Actualmente ninguna ficha del PPI esta en este estado.

La columna del tablero representa el flujo del trabajo (Por hacer, Haciendo, Hechas o Bloqueadas), mientras las etiquetas estado:pendiente, estado:parcial y estado:sin-verificar representan cumplimiento. Por hacer no elimina el avance parcial. No se marca Haciendo solo por asignar una tarjeta.

## Las 19 fichas del PPI

| Codigo original | Requisito por titulo | Cumplimiento | Responsable | Issue | Columna |
| --- | --- | --- | --- | --- | --- |
| REQ-01 | El sistema debe permitir el registro de apertura de caja con el ingreso del monto de base inicial. | Pendiente | Yulian | [#9](https://github.com/justinpich0n/ProyectoGithub/issues/9) | Bloqueadas |
| REQ-02 | El sistema debe integrar un módulo de inventario para la gestión y alta de productos. | Parcial | Diryan | [#7](https://github.com/justinpich0n/ProyectoGithub/issues/7) | Por hacer |
| REQ-03 | El sistema debe contar con una funcionalidad de búsqueda de productos por nombre | Pendiente | Diryan | [#19](https://github.com/justinpich0n/ProyectoGithub/issues/19) | Por hacer |
| REQ-04 | El sistema debe permitir el ingreso del monto con el que se realiza el pago en cada transacción. | Pendiente | Justin | [#20](https://github.com/justinpich0n/ProyectoGithub/issues/20) | Por hacer |
| REQ-05 | El sistema debe permitir seleccionar el método de pago, efectivo o medios electrónicos. | Pendiente | Justin | [#11](https://github.com/justinpich0n/ProyectoGithub/issues/11) | Por hacer |
| REQ-06 | El sistema debe proporcionar una funcionalidad para consultar el historial de ventas del día | Pendiente | Yulian | [#14](https://github.com/justinpich0n/ProyectoGithub/issues/14) | Bloqueadas |
| REQ-07 | El sistema debe generar factura al realizar una venta | Pendiente | Yulian | [#21](https://github.com/justinpich0n/ProyectoGithub/issues/21) | Bloqueadas |
| REQ-08 | El sistema debe incluir un módulo de creación de clientes con nombre, teléfono y dirección | Pendiente | Yulian | [#12](https://github.com/justinpich0n/ProyectoGithub/issues/12) | Por hacer |
| REQ-09 | El sistema debe permitir la modificación de datos en el módulo de clientes. | Pendiente | Yulian | [#22](https://github.com/justinpich0n/ProyectoGithub/issues/22) | Por hacer |
| REQ-10 | El sistema debe gestionar ventas a crédito, registrando y controlando saldos pendientes. | Pendiente | Yulian | [#13](https://github.com/justinpich0n/ProyectoGithub/issues/13) | Bloqueadas |
| REQ-11 | El sistema debe actualizar automáticamente el stock al vender un producto | Pendiente | Diryan | [#8](https://github.com/justinpich0n/ProyectoGithub/issues/8) | Por hacer |
| REQ-12 | El sistema debe permitir el ingreso del precio costo de los productos | Pendiente | Diryan | [#23](https://github.com/justinpich0n/ProyectoGithub/issues/23) | Por hacer |
| REQ-13 | El sistema debe permitir la definición y actualización del precio de venta de los productos. | Parcial | Justin | [#24](https://github.com/justinpich0n/ProyectoGithub/issues/24) | Por hacer |
| REQ-14 | El sistema debe generar una ventana emergente de 50px * 60px en la parte superior derecha cuando un producto esté bajo en stock | Pendiente | Diryan | [#25](https://github.com/justinpich0n/ProyectoGithub/issues/25) | Por hacer |
| RNF-01 | El sistema debe procesar y responder a cada operación en un tiempo máximo de 2 segundos. | Sin verificar | Justin | [#16](https://github.com/justinpich0n/ProyectoGithub/issues/16) | Por hacer |
| RNF-02 | La aplicación debe contar con una interfaz intuitiva. | Parcial | Justin | [#26](https://github.com/justinpich0n/ProyectoGithub/issues/26) | Por hacer |
| RNF-03 | El sistema debe permitir la gestión de hasta 3.000 productos en el inventario. | Sin verificar | Justin | [#27](https://github.com/justinpich0n/ProyectoGithub/issues/27) | Por hacer |
| RNF-04 | La aplicación debe ser capaz de integrarse con impresoras. | Pendiente | Yulian | [#28](https://github.com/justinpich0n/ProyectoGithub/issues/28) | Bloqueadas |
| RNF-05 | El sistema debe ofrecer una función para generar copias de seguridad. | Pendiente | Diryan | [#15](https://github.com/justinpich0n/ProyectoGithub/issues/15) | Bloqueadas |

Resultado: 14 pendientes, 3 parciales (REQ-02, REQ-13, RNF-02) y 2 sin verificar (RNF-01, RNF-03). No se declaran completas las fichas solo por existir el CRUD o una interfaz.

## Evidencias y dudas

Los modelos actuales son Usuario y Producto; Producto contiene nombre, precio, descripcion y usuarioId. Existen CRUD y formularios React con validaciones, pero no stock, costo, ventas, pagos, clientes, credito, impresora o respaldo/restauracion. La integracion CRUD real con MySQL, health automatizado y lint/build frontend pasaron en esta revision; no certifican rendimiento bajo carga ni usabilidad global. RNF-03 requiere comprobar 3000 registros y consultas optimizadas; RNF-04 requiere prueba con impresora termica USB/red y formato compatible. RNF-05 se conserva como no funcional porque asi lo clasifica el PPI.

Las descripciones desplazadas REQ-09 a REQ-14 y RNF-01 se conservan en cada tarjeta, separadas del titulo original. Las propuestas de interpretacion no son correcciones aprobadas. La [matriz de contraste](contraste-funcional-2026-10-28.md) explica evidencia y contradicciones.

## Soporte fuera del conteo del PPI

Se conservan como soporte #1, #2, #3, #4, #5 y #17 (entregas tecnicas y organizativas completadas por Justin), #6 (autenticacion/permisos presentes en alcance y precondiciones sin ficha independiente), y #10 (venta citada como REQ-15 en CU15 sin ficha). No se inventa una ficha REQ-15. El [historial del agrupamiento anterior](historial-backlog-agrupado.md) conserva las referencias originales; las issues reutilizadas guardan su texto previo en un apartado historico.

## Trabajo del equipo

Justin: justinpich0n; Diryan: DiryanS; Yulian: yuliandavid144-collab. Las 19 issues tienen responsables oficiales. Cada entrega de compañeros va en rama y PR, la revisa Justin y se integra solo con su decision. La regla activa de master y las excepciones estan en [ramas y trazabilidad](ramas-y-trazabilidad.md). La tarea cambia a Hechas cuando los criterios del requisito y su evidencia estan completos, no por terminar una tarea de soporte.
