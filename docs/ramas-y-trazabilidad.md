# Ramas y trazabilidad del trabajo de Justin

Revisión: 28 de octubre de 2026.

## Qué se regulariza

A petición de Justin, se identifican sus entregas terminadas mediante ramas por etapa, enlaces a las issues y commits verificables. Estas ramas se crearon retrospectivamente: el desarrollo anterior se integró directamente en master. No se cambian fechas ni autores de commits y no se reescribe el historial compartido.

Una rama es un nombre que apunta a un commit y contiene su historial anterior. No es una copia que contenga únicamente un requisito. El nombre justin identifica al responsable según el reparto del equipo; no constituye una firma criptográfica. Los commits recientes ya registran a Justin Woker como autor.

## Mapa de entregas

| Rama | Commit de referencia | Tarea | Entrega atribuida a Justin |
| --- | --- | --- | --- |
| [justin/tec-01-backend-mysql](https://github.com/justinpich0n/ProyectoGithub/tree/justin/tec-01-backend-mysql) | `d6f48dc` | [#1](https://github.com/justinpich0n/ProyectoGithub/issues/1) | Preparación de backend y conexión local MySQL |
| [justin/tec-02-navegacion-react](https://github.com/justinpich0n/ProyectoGithub/tree/justin/tec-02-navegacion-react) | `5703411` | [#2](https://github.com/justinpich0n/ProyectoGithub/issues/2) | Navegación React y verificación inicial |
| [justin/diseno-frontend](https://github.com/justinpich0n/ProyectoGithub/tree/justin/diseno-frontend) | `37eefdb` | [#2](https://github.com/justinpich0n/ProyectoGithub/issues/2) | Diseño y estilos de la interfaz |
| [justin/tec-03-crud-sequelize-react](https://github.com/justinpich0n/ProyectoGithub/tree/justin/tec-03-crud-sequelize-react) | `da8cd57` | [#17](https://github.com/justinpich0n/ProyectoGithub/issues/17) | CRUD de usuarios/productos y formularios React |
| [justin/doc-01-ejecucion-sustentacion](https://github.com/justinpich0n/ProyectoGithub/tree/justin/doc-01-ejecucion-sustentacion) | `da8cd57` | [#3](https://github.com/justinpich0n/ProyectoGithub/issues/3) | Documentación de ejecución y sustentación actualizada con CRUD |
| [justin/org-01-backlog-equipo](https://github.com/justinpich0n/ProyectoGithub/tree/justin/org-01-backlog-equipo) | `2332769` | [#4](https://github.com/justinpich0n/ProyectoGithub/issues/4) | Backlog, responsables y confirmación de acceso del equipo |

El commit da8cd57 agrupa backend, frontend y documentación: las ramas TEC-03 y DOC-01 apuntan al mismo commit. No se inventan entregas independientes. El requisito completo de productos sigue parcial en #7; solo se atribuye como terminado el CRUD básico de la guía. Las ramas históricas sirven para consulta: pueden contener versiones anteriores de la aplicación; para ejecutar la versión integrada se utiliza master.

## Pull request de esta regularización

La rama justin/docs-trazabilidad-requisitos parte del master vigente y añade este mapa y su enlace al backlog. Su pull request permite revisar la documentación de la regularización. No presenta el CRUD como código nuevo: el CRUD ya forma parte de master. Crear ramas retrospectivas no genera diferencias nuevas contra master, por lo que no permite abrir una PR de esos cambios históricos hacia esa misma rama.

Si el profesor exige evaluar una PR que contenga el código de los requisitos ya integrados, debe acordarse con él una comparación histórica entre commits o una rama base de revisión. No se debe retroceder master ni presentar la documentación como si fuera esa entrega de código.

## Acuerdo del profesor para las próximas entregas

Confirmado por Justin el 28 de octubre de 2026. Justin (justinpich0n) coordina el repositorio y revisa las entregas de Yulian (yuliandavid144-collab) y Diryan (DiryanS).

### Entregas de Yulian y Diryan

1. Cada integrante clona el repositorio una sola vez en su computadora. Después actualiza su copia de master con git pull --ff-only antes de comenzar, con su trabajo previo guardado.
2. Crea una rama antes de editar, con su nombre y requisito: yulian/rf-07-clientes o diryan/rf-03-inventario.
3. Implementa y prueba el requisito; guarda commits con su propia identidad de Git. Publica su rama y abre una pull request hacia master, enlazando la issue y describiendo cambios y pruebas. No sube directamente a master.
4. Solicita revisión a Justin. Justin comprueba archivos, requisito y funcionamiento. Puede aprobar, pedir cambios o cerrar la propuesta sin integrarla; una solicitud de cambios permite corregir la misma PR.
5. Approve registra la aprobación; Merge integra el código. Justin integra cuando corresponde. Si el profesor necesita evaluar la PR abierta, se deja abierta hasta su indicación.
6. La tarjeta pasa a Haciendo al iniciar el trabajo; mientras se revisa conserva ese estado y enlaza la PR. Solo pasa a Hechas al cumplir criterios, pruebas e integración. Si hay un impedimento real, se documenta en Bloqueadas.

### Entregas propias de Justin

Por el acuerdo comunicado, sus cambios propios no requieren pull request. Para conservar la identificación por requisito, Justin trabaja en una rama con prefijo justin/, prueba y guarda commits descriptivos con su identidad, registra la rama, commits y evidencia en la issue y puede integrar su trabajo a master sin PR. El tablero se actualiza según el resultado verificado. No debe presentarse un cambio de otra persona como propio para evitar la revisión.

### Estado de la aplicación del acuerdo

Las cuentas y las ocho asignaciones de Yulian y Diryan están comprobadas. Justin es el revisor acordado. La tarjeta ORG-02 registra este acuerdo. La PR #18 es un borrador de documentación opcional de Justin y permanece abierto para revisión.

El flujo está documentado como norma del equipo. En la consulta del 28 de octubre, la protección clásica de master devolvió 404; no se ha configurado aquí una restricción automática que impida a colaboradores subir directamente. Documentar el acuerdo y asignar tareas no equivale a proteger la rama.

## Sustentación

El trabajo inicial lo realizó Justin y se integró directamente en master. Sus etapas terminadas tienen ramas retrospectivas y commits verificables. En adelante, Yulian y Diryan trabajan en ramas y entregan mediante pull request; Justin revisa y decide su integración. Los cambios propios de Justin pueden integrarse sin PR, pero deben tener autoría, pruebas y vínculo a su tarea. El tablero refleja el estado real y no solo la existencia de una rama.
