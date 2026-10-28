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

## Flujo para las próximas entregas

1. Con la copia de trabajo limpia, actualizar master con git pull --ff-only.
2. Crear una rama desde master antes de editar; por ejemplo justin/rf-05-ventas, diryan/rf-03-inventario o yulian/rf-07-clientes.
3. Implementar solo la tarea acordada, comprobar el resultado y hacer commits descriptivos con la identidad correcta del integrante.
4. Publicar la rama y abrir una pull request hacia master con enlace a la issue, alcance y pruebas.
5. Otro integrante revisa los archivos y verifica el comportamiento. Si el profesor debe evaluar la PR abierta, conservarla abierta hasta su indicación.
6. Integrar cuando corresponda y actualizar el estado de la tarea según criterios y evidencia.

## Sustentación

El trabajo inicial se subió directamente a master. Ahora cada etapa terminada tiene una referencia con el nombre de Justin y el commit que permite consultarla. Se conserva el historial real. Las siguientes entregas se harán primero en una rama por responsable y requisito, y se integrarán mediante pull request y revisión.
