# Contraste entre el PPI actualizado y el código

Revisión del 28 de octubre de 2026. Base de código funcional: da8cd57; rama de trabajo consultada: justin/docs-trazabilidad-requisitos.

## Fuente original comprobada y conclusión

Se recibió y leyó PPI_INGENIERIA_DE_SOFTWARE_ArchivoActualizado.docx el 28 de octubre. Su contexto identifica BizzStock y Arte y Belleza. Se revisó el texto de 14 fichas funcionales (REQ-01 a REQ-14) y 20 casos de uso (CU1 a CU20). No se certifica aquí el contenido gráfico de diagramas incrustados. Las instrucciones de plantilla no se toman como tareas de implementación.

El CRUD técnico de usuarios y productos está implementado y probado, pero no completa ningún caso de uso funcional de negocio de extremo a extremo. Según el título y propósito de las 14 fichas: REQ-02 y REQ-13 tienen avances parciales; los otros 12 siguen pendientes. Este conteo se refiere a las fichas originales, no a las diez agrupaciones RF del backlog. Las contradicciones internas se conservan como dudas y no se corrige el PPI sin acuerdo.

## Cotejo de las 14 fichas originales

| Ficha | Propósito del título | Estado | Evidencia y criterio pendiente |
| --- | --- | --- | --- |
| REQ-01 | Apertura de caja | Pendiente | No existe AperturaCaja ni monto/fecha/hora/usuario o saldo final diario. CU5 permite base cero y prohíbe segunda apertura diaria; falta definir la unidad de apertura. #9. |
| REQ-02 | Inventario y alta de productos | Parcial | CRUD real y formularios disponibles, pero faltan cantidad y precio de compra. CU17 exige administrador y nombre/cantidad/costo/venta; no hay autorización. CU12 menciona duplicados y no hay criterio de unicidad de producto. #7, avance técnico #17. |
| REQ-03 | Búsqueda de productos por nombre | Pendiente | GET lista todos o busca por ID; no hay búsqueda parcial por nombre, índice explícito de nombre ni autocompletado dinámico. CU4/CU19 requieren coincidencias y manejo de resultados vacíos/error. #7. |
| REQ-04 | Monto recibido y cambio | Pendiente | No hay pagos ni total de venta. Debe calcular recibido menos total y rechazar insuficiencia; CU3 contempla pago exacto. #11. |
| REQ-05 | Método de pago | Pendiente | No hay Venta ni Pago. La ficha exige atributo obligatorio en Venta, CU16 registra una tabla Pago y CU2 describe un alta de producto: decisión de modelo y corrección del flujo pendientes. #11. |
| REQ-06 | Historial de ventas | Pendiente | No hay ventas ni filtros parametrizados por fechas/producto. Título dice del día; descripción permite rango. CU11 repite precondición como poscondición. #14. |
| REQ-07 | Factura/comprobante | Pendiente | Sin visualización/impresión de identificador, fecha/hora, productos/cantidades/precio/subtotal, total y método. CU1 abarca venta, pago y stock; solapa CU15. #14. |
| REQ-08 | Crear clientes | Pendiente | No existe Cliente con nombre completo, teléfono y dirección, consulta y edición. Usuario con correo no cumple esto. CU10 trata campos faltantes, duplicados y validación telefónica. #12. |
| REQ-09 | Modificar clientes | Pendiente y contradictorio | CU9 confirma edición; la descripción de la ficha corresponde a crédito con cliente, saldo y estado de deuda. #12 y duda de #13. |
| REQ-10 | Ventas a crédito y saldos | Pendiente y contradictorio | CU8 trata deuda, autorización ante vencimiento y abono inicial. La descripción de la ficha corresponde a descuento de stock en transacción atómica. #13 y duda de #8/#10. |
| REQ-11 | Actualizar stock al vender | Pendiente y contradictorio | CU14 trata existencias; descripción exige precio de compra al crear. No hay stock ni costo. #8 y duda de #7. |
| REQ-12 | Precio costo | Pendiente y contradictorio | Sin costo. CU7 contempla confirmación de costo cero y carga masiva; descripción de la ficha exige precio de venta obligatorio y editable. Precio por API puede omitirse y queda cero, por lo que tampoco se acredita literalmente ese campo requerido. #7. |
| REQ-13 | Definir y actualizar precio de venta | Parcial y contradictorio | Precio DECIMAL con edición y validación numérica comprobados. Falta advertencia de venta menor al costo de CU6. La descripción de la ficha corresponde a stock mínimo y alerta; esa parte no existe. CU18 también mezcla edición general. #7/#8. |
| REQ-14 | Ventana de bajo stock | Pendiente y contradictorio | No hay mínimos ni alertas. Título 50×60 px, descripción desplazada en REQ-13 20×50 o ajustable. CU13 exige retirar alertas al reponer y listar varios productos. Descripción de REQ-14 exige máximo dos segundos hasta 3000 productos/un usuario; no medido. #8 y #16. |

Inicio de sesión y roles aparecen en alcance y precondiciones, sin una ficha funcional independiente entre estas 14. Se mantienen pendientes en #6. CU15 referencia REQ-15, ausente en las fichas: no se contabiliza como una ficha funcional existente; la venta se conserva pendiente en #10. Respaldo/restauración figura como RNF-05, con CU20 de respaldo, y sigue pendiente en #15.

Las etiquetas RF-01 a RF-10 del tablero agrupan requisitos; no sustituyen REQ-01 a REQ-14. Las propuestas de interpretación no son correcciones aprobadas del PPI.

## Matriz de evidencia y pendientes

| Área funcional del contraste conservado | Referencias conservadas | Resultado en código | Evidencia o brecha | Backlog |
| --- | --- | --- | --- | --- |
| Inicio de sesión y permisos | Alcance y precondiciones CU5/CU15/CU17/CU20; matriz pendiente | Pendiente | Usuario solo tiene id, nombre, email y fechas. No hay credencial, sesión, rol ni autorización de rutas. | #6, Diryan, abierta |
| Registrar, consultar y editar productos | REQ-02, CU17, CU18 | Parcial | Rutas GET/POST/PUT/DELETE y formularios React existentes. Campos: nombre, precio, descripción y usuarioId. Faltan búsqueda específica y costo para el alcance documentado. Autenticación previa del CU tampoco se cumple. | #7, Diryan, abierta; parte técnica #17, Justin, cerrada |
| Costo de producto | REQ-12, CU7 | Pendiente | No existe campo costo, formulario ni operación de costos. La carga masiva mencionada debe aclararse antes de añadirla. | #7, Diryan, abierta |
| Precio de venta | REQ-13, CU6 | Parcial | Campo precio DECIMAL y creación/edición comprobadas. Se aceptan valores desde cero y precio omitido por API queda en cero: no puede certificarse aceptación de esa regla sin el PPI vigente. Faltan permisos y revisión del alcance específico del CU. | #7, Diryan, abierta; avance de Justin en #17 |
| Existencias y descuento al confirmar venta | REQ-11, CU14 | Pendiente | Producto no tiene stock; no hay venta ni transacción venta/pago/inventario. | #8, Diryan; coordinación #10, Justin |
| Mínimos y alertas | REQ-14, CU13 | Pendiente | Sin stock mínimo ni alertas. Regla de menor o igual y tamaño de iconos siguen como propuesta pendiente de validación. | #8, Diryan, abierta |
| Apertura de caja | CU5 | Pendiente | No hay modelo, rutas o interfaz de caja. Resolver unidad de apertura, cierre y turnos. Referencia confirmada: REQ-01. | #9, Yulian, abierta |
| Registrar y confirmar ventas | CU15, REQ-15 citado sin ficha recuperada | Pendiente y especificación incompleta | No existen venta, detalle ni confirmación. Resolver ficha faltante y solapamiento con factura. | #10, Justin, abierta |
| Medios de pago y cambio | REQ-05, CU2 | Pendiente | Sin pagos ni cálculo de cambio. El flujo conservado de CU2 describe productos y requiere corrección acordada. | #11, Justin, abierta |
| Registrar, consultar y editar clientes | REQ-08/CU10 para crear, consultar y editar; REQ-09/CU9 para edición | Pendiente | No existe Cliente. Registrar un Usuario con nombre/correo no cumple gestión de clientes. Corregir descripción mezclada con crédito. | #12, Yulian, abierta |
| Crédito, saldos y abonos | REQ-10, CU8 | Pendiente | Sin crédito, saldo o abonos. Resolver vencimiento, límites, permisos y aplicación de pagos. | #13, Yulian, abierta |
| Historial | REQ-06, CU11 | Pendiente | Sin ventas o filtros de historial. Resolver día frente a rango/consulta por producto. | #14, Yulian, abierta |
| Factura o comprobante imprimible | REQ-07, CU1; solapamiento CU15 | Pendiente | Sin generación o impresión. Confirmar formato, alcance y denominación; no asumir facturación electrónica. | #14, Yulian, abierta |
| Respaldo y restauración | NEC-19, RNF-05, CU20 | Pendiente; clasificación original no funcional | Sin operaciones de respaldo/restauración. CU20 conservado desarrolla solo respaldo; faltan reglas de restauración. | #15, Diryan, abierta |

## Entregas terminadas que pueden demostrarse

- Backend Express y comprobación real de MySQL mediante /api/health: #1.
- Navegación y formularios React, junto con diseño de la interfaz: #2 y #17.
- CRUD técnico de usuarios y productos: #17. No es autenticación, inventario completo ni ventas.
- Documentación y organización del equipo: #3, #4 y #5. Son entregables técnicos/organizativos y no requisitos funcionales del negocio.

## Diferencias que debe conocer el profesor

1. El modelo de práctica exige asociar cada producto a un usuario y borrar sus productos en cascada al eliminarlo. Se ve en backend/src/models/index.js y se comprueba en integración. No se acredita como una política aprobada de inventario del PPI; sigue pendiente acordar conservación al retirar empleados.
2. Borrar productos está implementado por la guía. Su autorización y su alcance definitivo de negocio siguen sin resolver en #7; no confundir esa operación técnica con una baja de inventario auditada.
3. Las tablas y rutas disponibles no satisfacen precondiciones de sesión o permisos de los casos de uso. Un caso de uso completo no debe marcarse terminado porque se ejecute una parte del flujo.
4. Las referencias REQ-09 a REQ-14 conservan descripciones desplazadas en el contraste anterior. Las interpretaciones documentadas no reemplazan la aprobación del PPI original.
5. El conteo de 14 fichas está comprobado. Sus contradicciones impiden declarar cumplimiento pleno solo por el título; los avances parciales no equivalen a casos de uso completos.

## Comprobaciones realizadas en esta revisión

Se leyeron los modelos Usuario/Producto, su relación, rutas, validaciones, controladores, formularios compartidos, páginas y navegación. Se consultaron las issues #6 a #17 y sus estados en GitHub.

- npm test del backend: aprobado; health con base simulada.
- npm run test:integration: aprobado contra MySQL local. Comprueba altas, consultas, edición, eliminación, persistencia, validaciones, correo único y cascada con registros ficticios propios.
- npm run lint y npm run build del frontend: aprobados.
- Se inició un backend temporal únicamente para la integración y se detuvo al concluir. No queda un servidor adicional ocupando el puerto 3000.

No se alteraron funcionalidades, estados de tareas de negocio ni el PPI fuente. Se completan las referencias y criterios de las tarjetas pendientes con el texto recibido. El diagnóstico inicial provisional queda reemplazado por esta revisión de la fuente original.
