# BizzStock: alcance y contraste de requisitos

Fuente funcional: texto de PPI_INGENIERIA_DE_SOFTWARE-2.docx, secciones de contexto, necesidades, requisitos y casos de uso. Se omiten datos personales y académicos. Esta revisión contrasta el texto de las tablas; no verifica el contenido gráfico de los diagramas incrustados.

Fuente técnica: https://github.com/borissalleg/practica-node

La petición actual establece implementar por etapas, aunque el alcance original del documento se limita al diseño. Las instrucciones de plantilla del documento no constituyen tareas adicionales para esta etapa.

## Alcance funcional para etapas posteriores

- Inicio de sesión y permisos de administrador y cajero.
- Productos: registro, consulta, edición, búsqueda, costo y precio de venta.
- Inventario: existencias, mínimo y alertas.
- Apertura de caja: monto inicial, fecha, hora y usuario.
- Ventas: detalles, validación de existencias y descuento de stock al confirmar.
- Pagos: efectivo, tarjeta y pago móvil; cambio para efectivo.
- Clientes: registro, consulta y edición.
- Crédito: cliente asociado, saldo pendiente y abonos.
- Historial con filtros y comprobantes imprimibles.
- Copias de seguridad y restauración.

Estas capacidades son alcance, no funcionalidades ya implementadas. La etapa actual incluye Express, un pool de conexiones con `mysql2` y la ruta `/api/health`, que comprueba la conexión mediante `SELECT 1`. La base local `bizzstock` utiliza `utf8mb4` y aún tiene cero tablas. Los módulos del negocio y el frontend quedan pendientes.

## Inconsistencias y criterio de interpretación

Se conservan los identificadores originales. Las correcciones siguientes son propuestas basadas en necesidad, título, caso de uso y petición actual; no modifican el documento fuente.

| Referencias | Diferencia encontrada | Interpretación para BizzStock |
| --- | --- | --- |
| NEC-05, REQ-05, CU2 | Título y requisito tratan métodos de pago; flujo y poscondición de CU2 registran un producto. | CU2 debe seleccionar y guardar el método de pago; el registro de productos pertenece a CU17/REQ-02. |
| NEC-06, REQ-06, CU11 | El título restringe el historial al día; la descripción admite rango de fechas y producto. La poscondición de CU11 repite una precondición. | Consultar historial con filtros; la poscondición es mostrar resultados sin cambiar ventas. |
| NEC-07, REQ-07, CU1, CU15 | CU1, titulado generar factura, abarca toda la venta y se solapa con CU15. CU1 acepta un carrito como precondición. | Separar preparación, confirmación y emisión; generar comprobante de una venta confirmada. |
| NEC-09, REQ-09, CU9 | Necesidad, título y CU9 son edición de clientes; descripción trata crédito y deuda. | Mantener edición de clientes; trasladar el significado de esa descripción a REQ-10. |
| NEC-10, REQ-10, CU8 | Título y CU8 son crédito; descripción trata descuento atómico de inventario. | Crédito registra cliente y saldo; el descuento corresponde a REQ-11. |
| NEC-11, REQ-11, CU14 | Título y CU14 son actualización de stock; descripción exige costo al crear productos. | Descontar inventario al confirmar, junto con venta y pagos en una transacción; costo corresponde a REQ-12. |
| NEC-12, REQ-12, CU7 | Título y CU7 son costo; descripción exige precio de venta. | Registrar costo; precio de venta corresponde a REQ-13. CU7 también contempla actualizar un producto existente. |
| NEC-13, REQ-13, CU6 | Título y CU6 son precio de venta; descripción trata mínimo de stock y alertas. | Mantener precio de venta; alertas corresponden a REQ-14. |
| NEC-14, REQ-14, CU13 | Título y CU13 son alertas; descripción exige respuesta en dos segundos. Además, el título dice 50×60 px y la descripción desplazada de REQ-13 dice 20×50 px. | Alertar cuando stock sea menor o igual al mínimo; tamaño legible pendiente de interfaz. Rendimiento corresponde a RNF-01. |
| NEC-15, RNF-01, RNF-02 | RNF-01 se titula rendimiento pero describe usabilidad, duplicando RNF-02. | Separar respuesta hasta dos segundos de facilidad de uso. Definir condiciones medibles antes de evaluar rendimiento. |
| CU15, REQ-15 | CU15 referencia REQ-15, pero no se encontró su ficha en el texto de requisitos. | Documentar formalmente registro y confirmación de venta antes de implementarlos. |
| CU18, REQ-13, REQ-02 | Actualizar producto referencia solo precio de venta aunque modifica datos generales. | Vincular edición general con REQ-02 y edición de precio con REQ-13. |
| Alcance y precondiciones de CU5/CU15/CU17/CU20 | Se menciona autenticación de administrador y se exigen sesión y permisos, sin especificación completa de acceso para ambos roles. | La petición actual incluye administrador y cajero; falta acordar matriz de permisos. |
| REQ-05, CU1, CU8 | Se mezclan medios de pago con crédito como si fueran la misma clasificación. CU8 permite abono inicial. | Distinguir condición de venta (contado/crédito) de medio de cada pago; confirmar reglas antes del modelo de datos. |
| NEC-19, RNF-05, CU20 | Respaldo/restauración se clasifica no funcional aunque describe operaciones; CU20 solo desarrolla generar respaldo. | Mantener ambas funciones; falta caso de restauración y manejo de errores. |

## Dudas que afectan decisiones futuras

No bloquean la ruta HTTP actual. Resolver al comenzar el módulo correspondiente:

1. **Permisos:** ¿el cajero puede crear/editar clientes, conceder crédito, registrar abonos y consultar ventas de otros cajeros? Determina autorización de rutas.
2. **Caja:** CU5 impide otra apertura el mismo día, pero no precisa si es por negocio, caja o usuario. ¿Cómo se cierra y cómo se manejan turnos? Determina unicidad y relación con ventas.
3. **Crédito:** faltan vencimiento, autorización ante deuda vencida, límites, asignación de abonos y posibilidad de pagos mixtos. Determina tablas, validaciones y saldo.
4. **Comprobantes:** el documento alterna factura y comprobante. La petición actual pide comprobantes imprimibles. Confirmar formato y modelo de impresora antes de integrar impresión; no asumir facturación electrónica.
5. **Inventario:** REQ-02 dice CRUD pero no desarrolla eliminación; CU7 menciona carga masiva de costos. Confirmar bajas, ajustes, devoluciones y si esas extensiones se requieren; no agregarlas automáticamente.
6. **Respaldo:** decidir destino, frecuencia, conservación y quién puede restaurar; definir qué ocurre con datos actuales antes de implementar restauración.
7. **Rendimiento:** se citan 3.000 productos, dos segundos y un usuario concurrente en una descripción desplazada. Acordar equipo, operaciones y concurrencia para poder medirlo.

## Cierre de la etapa técnica actual

Se completó la conexión local a MySQL y la preparación de la base vacía `bizzstock`. Las instrucciones para instalar dependencias, configurar el archivo privado `.env`, crear la base e iniciar y verificar el backend están en [backend/README.md](../backend/README.md).

El archivo `.env.example` contiene únicamente valores de ejemplo. Las credenciales locales y los respaldos privados no forman parte del repositorio. Esta etapa no implementa nuevas rutas, tablas ni funcionalidades del negocio; las dudas anteriores se resolverán cuando se retome cada módulo.
