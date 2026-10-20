# Backlog y reparto del equipo

Revisión: 15 de octubre de 2026. Base de implementación: commit `da8cd57`.

[Tablero GitHub](https://github.com/users/justinpich0n/projects/1) · [Requisitos y dudas](requisitos-bizzstock.md) · [Evidencias técnicas](seguimiento-guia.md).

## Criterio de reparto

Por indicación de Justin, todo lo terminado se atribuye a Justin y el trabajo pendiente se distribuye entre Justin, Diryan y Yulian: cuatro tarjetas abiertas para cada integrante. El número de tarjetas no representa igual esfuerzo; ventas e integración requieren colaboración. Cuentas confirmadas el 20 de octubre: Yulian = [yuliandavid144-collab](https://github.com/yuliandavid144-collab), Diryan = [DiryanS](https://github.com/DiryanS). Se registraron en las descripciones de sus ocho tareas. GitHub todavía no permite asignarlas en Assignees: no son colaboradores ni tienen invitaciones pendientes; falta gestionar acceso y aceptación. No se inventan fechas ni se asigna un sprint sin acordarlo.

Las etiquetas RF de las tarjetas agrupan requisitos del PPI: no reemplazan los identificadores REQ/CU originales. Los requisitos contradictorios conservan sus dudas. La planificación no amplía la implementación autorizada por la guía.

## Estado comprobado y responsabilidades

| Tarjeta | Responsable | Estado | Análisis y siguiente paso |
| --- | --- | --- | --- |
| [#1 TEC-01 · Preparar y verificar backend con MySQL](https://github.com/justinpich0n/ProyectoGithub/issues/1) | Justin | Hechas | Backend Express/MySQL y health comprobados. La referencia a cero tablas describe el diagnóstico histórico; actualmente existen usuarios y productos (da8cd57). |
| [#2 TEC-02 · Navegación React de Inicio, Usuarios y Productos](https://github.com/justinpich0n/ProyectoGithub/issues/2) | Justin | Hechas | Navegación React y diseño existentes completos para esta etapa. Formularios CRUD registrados en tarjeta técnica separada; no equivalen a autenticación. |
| [#3 DOC-01 · Documentar ejecución y sustentación en Mac](https://github.com/justinpich0n/ProyectoGithub/issues/3) | Justin | Hechas | README, instrucciones de Mac, exposición y seguimiento actualizados con partes 3 y 4 en da8cd57. |
| [#4 ORG-01 · Organizar el backlog de BizzStock](https://github.com/justinpich0n/ProyectoGithub/issues/4) | Justin | Hechas | Tablero existente con 16 tarjetas originales y cuatro estados. Reparto del 15 de octubre documentado; coordinación pendiente en #5. |
| [#5 ORG-02 · Acordar responsables y revisión de pull requests](https://github.com/justinpich0n/ProyectoGithub/issues/5) | Justin | Por hacer | Parcial: responsables por nombre ya definidos. Cuentas confirmadas; falta gestionar acceso, asociarlas al campo Assignees y acordar revisores de pull requests. No inventar cuentas ni fechas. |
| [#6 RF-01 · Inicio de sesión y permisos](https://github.com/justinpich0n/ProyectoGithub/issues/6) | Diryan | Bloqueadas | Sin implementar. El CRUD de usuarios solo contiene nombre/correo: no hay autenticación ni roles. Primero acordar matriz de permisos. |
| [#7 RF-02 · Gestionar productos, costos y precios](https://github.com/justinpich0n/ProyectoGithub/issues/7) | Diryan | Por hacer | Parcial: Justin completó alta, consulta, edición y precio básico mediante CRUD (da8cd57). Diryan asume lo restante: búsqueda, costo y validaciones funcionales acordadas. Resolver borrado/cascada y relación producto-usuario para uso definitivo. No cerrar el requisito completo. |
| [#8 RF-03 · Controlar existencias y alertas de inventario](https://github.com/justinpich0n/ProyectoGithub/issues/8) | Diryan | Por hacer | Sin implementar: el modelo Producto no incluye existencias ni mínimo. Acordar alerta y coordinar descuento atómico con ventas #10; depende de #7. |
| [#9 RF-04 · Apertura y reglas de caja](https://github.com/justinpich0n/ProyectoGithub/issues/9) | Yulian | Bloqueadas | Sin implementar. Resolver apertura por negocio/caja/usuario, cierre y turnos; coordinar permisos con #6. |
| [#10 RF-05 · Registrar y confirmar ventas](https://github.com/justinpich0n/ProyectoGithub/issues/10) | Justin | Bloqueadas | Sin implementar. Formalizar REQ-15 y separar confirmación de comprobante; depende de inventario #8, caja #9 y pagos #11. Justin coordina contrato de integración con ambos compañeros. |
| [#11 RF-06 · Registrar pagos y calcular cambio](https://github.com/justinpich0n/ProyectoGithub/issues/11) | Justin | Por hacer | Sin implementar. Corregir flujo CU2 y acordar medios; coordinar confirmación y cambio con #10. Crédito #13 no es un medio de pago. |
| [#12 RF-07 · Registrar, consultar y editar clientes](https://github.com/justinpich0n/ProyectoGithub/issues/12) | Yulian | Por hacer | Sin implementar. Usuarios no equivale a clientes. Corregir REQ-09 y acordar permisos con #6; base para crédito #13. |
| [#13 RF-08 · Gestionar crédito, saldos y abonos](https://github.com/justinpich0n/ProyectoGithub/issues/13) | Yulian | Bloqueadas | Sin implementar. Depende de clientes #12, ventas #10 y reglas de abonos/límites/vencimiento pendientes de acordar. |
| [#14 RF-09 · Consultar historial y emitir comprobantes](https://github.com/justinpich0n/ProyectoGithub/issues/14) | Yulian | Bloqueadas | Sin implementar. Depende de ventas #10; acordar filtros, formato y diferencia comprobante/factura. No asumir facturación electrónica. |
| [#15 RF-10 · Copias de seguridad y restauración](https://github.com/justinpich0n/ProyectoGithub/issues/15) | Diryan | Bloqueadas | Sin implementar. Acordar destino, retención, permisos y restauración. Prueba futura en entorno aislado; no sobrescribir datos existentes. |
| [#16 RNF-01 · Precisar rendimiento y usabilidad](https://github.com/justinpich0n/ProyectoGithub/issues/16) | Justin | Por hacer | Parcial en interfaz: Justin realizó navegación, diseño y formularios React. No hay evidencia de cumplimiento global de usabilidad ni medición de rendimiento bajo carga. Acordar criterios RNF-01/RNF-02 antes de medir; lint/build no demuestran esos requisitos. |
| [#17 TEC-03 · CRUD Sequelize y formularios React](https://github.com/justinpich0n/ProyectoGithub/issues/17) | Justin | Hechas | Partes 3 y 4 completas. Prueba real de CRUD repetida y aprobada el 15 de octubre; commit da8cd57. |

## Orden de coordinación

1. Justin coordina acceso de las cuentas confirmadas y acuerda revisión de ramas y pull requests (#5); cada integrante concreta con el equipo las dudas de sus tarjetas antes de implementar.
2. Diryan define acceso y completa productos/inventario; Yulian define caja y clientes. Justin concreta ventas, pagos y los criterios de pruebas en coordinación con ambos.
3. Integrar ventas con caja, stock y pagos; después crédito e historial/comprobantes con Yulian. Respaldos/restauración con Diryan y validación de rendimiento/usabilidad con Justin requieren criterios y entorno acordados.
4. Pasar a Haciendo solo cuando exista trabajo activo; pasar a Hechas cuando se cumplan todos los criterios y se adjunte evidencia. Los avances parciales de productos e interfaz no cierran el requisito completo.

## Verificación de esta revisión

Se inspeccionaron modelos, rutas, controladores y formularios React. Se repitió satisfactoriamente la integración CRUD contra MySQL local con datos ficticios y limpieza de los registros de la prueba. La evidencia visual y los resultados de lint/build previos están en el seguimiento técnico. No se modificó el código funcional ni se implementaron módulos pendientes durante este reparto.

Resultado esperado del tablero: 17 tarjetas, cinco Hechas atribuidas a Justin, seis Por hacer y seis Bloqueadas. Ninguna Haciendo porque la asignación no implica inicio del desarrollo. Las cuentas están confirmadas. El acceso, la asignación efectiva en Assignees y los revisores continúan pendientes en #5.
