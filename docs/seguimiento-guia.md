# Seguimiento técnico de BizzStock

Referencia: https://github.com/borissalleg/practica-node (consultada el 6 de octubre de 2026).

## Diagnóstico inicial del 6 de octubre (histórico)

Se revisaron el repositorio conectado, README, documentación funcional, exposición, configuración, código y paquetes. Rama `master`, HEAD `d6f48dc`, remoto `origin` correspondiente a `justinpich0n/ProyectoGithub`; GitHub tenía el mismo commit.

Existían cambios preparados de editor, formato, lint y petición HTTP, además de exposición y frontend Vite sin seguimiento. Se conservaron esas configuraciones y se completó la plantilla inicial. No había instrucciones AGENTS.md en el recorrido revisado.

Se confirmó Node.js 24.21.0, npm 11.19.0 y MySQL 8.4.11. Había `.env` privado y dependencias instaladas. Las consultas de lectura confirmaron `bizzstock`, `utf8mb4`, `utf8mb4_unicode_ci`, cero tablas y una cuenta distinta de root con permisos sobre esa base. El backend no estaba escuchando al iniciar el diagnóstico.

## Orden y resultado de las partes 1 y 2

| Etapa | Estado inicial | Resultado |
| --- | --- | --- |
| Backend 1–3: estructura, paquetes y configuración | Existentes | Comprobados |
| Backend 4: base y permisos | Existentes | Comprobados mediante consultas de lectura |
| Backend 5–8: Express, arranque, scripts y exclusiones | Existentes | Conservados y comprobados |
| Backend 9–10: ejecución y petición HTTP | Por verificar | Arranque correcto; HTTP 200 con MySQL real |
| Frontend 1–2: Vite y dependencias | Existentes | Conservados y comprobados |
| Frontend 3: biblioteca de navegación | Pendiente | Instalada, registrada en paquete y lockfile |
| Frontend 4–6: barra, páginas y rutas | Pendientes | Implementadas para BizzStock |
| Frontend 7: entrada React | Existente | Conservada |
| Frontend 8–9: ejecución y navegación | Pendientes | Verificadas en navegador |

## Diferencias y dudas

- La guía alterna `tienda_db` y `tiendanode`. BizzStock ya usa `bizzstock`; se mantiene ese nombre coherente con su configuración y documentación.
- El backend existente usa un pool, frente a la conexión breve del ejemplo. Se conserva para no reemplazar trabajo previo.
- La ruta existente consulta la base en cada petición y responde 503 ante fallo. El ejemplo responde un mensaje fijo. También se conserva el arranque HTTP ante indisponibilidad de MySQL para informar del fallo. Estas adaptaciones están verificadas y documentadas; si se exige una copia literal de la respuesta del ejemplo, habrá que aclararlo.
- La documentación de Windows se identifica ahora como histórica. Las instrucciones vigentes de Mac están al comienzo del README del backend.
- Las contradicciones funcionales siguen en requisitos-bizzstock.md; la guía no las resuelve y no se toman decisiones nuevas sobre ellas.
- En la versión consultada el 6 de octubre, Sequelize, modelos, migraciones y CRUD eran próximos pasos. Ese estado histórico queda actualizado por la revisión siguiente.

## Archivos de esta etapa

Se completaron `frontend/src/App.jsx`, estilos, HTML y paquetes; se añadieron Navbar y páginas. `main.jsx` y los recursos anteriores se conservaron. Se actualizaron los README, requisitos y exposición, y se añadió este seguimiento. El código de ejecución del backend no cambió.

## Evidencia de comprobación

El 6 de octubre de 2026:

- Backend: lint y prueba automatizada existentes aprobados.
- Inicio con `npm start`: MySQL confirmó `SELECT 1`.
- `GET /api/health`: HTTP 200, `sistema: "BizzStock"`, `baseDeDatos: "conectada"`.
- Frontend: lint y build aprobados.
- Navegador: Inicio, Usuarios, Productos y recarga directa de Productos correctos; sin errores ni advertencias de consola.
- `.env` y node_modules ignorados; `.env` fuera del seguimiento de Git. `dist/` ignorado.

La prueba automatizada usa una base simulada; la consulta real se verificó por separado. Ninguna comprobación creó tablas ni datos de clientes.

## Revisión del 15 de octubre de 2026: partes 3 y 4

Fuente comprobada mediante la API de GitHub y lectura del archivo en el commit [d2ad193](https://github.com/borissalleg/practica-node/commit/d2ad193a9ad4b2a5325a83d53e10a019efd5fb4c), publicado el 13 de octubre de 2026: «Agregar CRUD con Sequelize en backend y conectar frontend con axios». La versión anterior era `82a1668` del 10 de septiembre. El índice web mostró una copia anterior, por eso se contrastó con el commit y su contenido directo.

Diagnóstico sin cambios: BizzStock estaba limpio en `master`, HEAD `37eefdb`, coincidente con origin/master. Base local sin tablas. Health y navegación comprobados antes de implementar.

| Orden de la guía | Resultado |
| --- | --- |
| Parte 3, 1–2: instalar Sequelize y configurar conexión | Completo; usa .env privado y respeta DB_PORT |
| Parte 3, 3–5: modelos Usuario/Producto y relación 1:N | Completo; correo único, usuarioId y CASCADE |
| Parte 3, 6: autenticar y sincronizar al arrancar | Completo; sync sin force ni alter |
| Parte 3, 7–8: controladores | Completo; cinco operaciones por recurso |
| Parte 3, 9–11: rutas y montaje | Completo; /api/usuarios y /api/productos |
| Parte 3, 12: ejecución y pruebas HTTP | Completo; prueba de integración contra MySQL local |
| Parte 4, 1–2: axios y servicio API | Completo; URL local 127.0.0.1:3000/api |
| Parte 4, 3–5: formularios y navegación React | Completo; crear/editar/cancelar/eliminar, listas y selector de usuario |
| Parte 4, 6: prueba navegador | Alta de usuario y producto, edición del precio y persistencia tras recarga comprobadas; borrado y cascada comprobados por API |

Adaptaciones: se mantiene el health dinámico y su pool mysql2; Sequelize administra el pool CRUD. Los modelos se inicializan desde server.js y se entregan a Express para conservar la prueba de health sin credenciales. Express 5 propaga los errores async a un manejador central con mensajes seguros. Se validan tipos, IDs, correo y rango/precisión del precio. React comparte formulario y tabla en Gestion.jsx para conservar el diseño sin duplicar la lógica. No se añadió ninguna tecnología fuera de la guía.

Comprobaciones: lint backend/frontend, prueba simulada de health y compilación frontend aprobados. La integración real cubre las diez rutas, correo duplicado, correo inválido, campos vacíos, IDs inválidos, FK inexistente, precios inválidos, precio por defecto, 404 y cascada. Solo borra los registros creados por esa prueba. La primera ejecución coincidió con un reinicio de nodemon; al concluir el reinicio pasó completa.

En navegador se conservó como ejemplo ficticio «Equipo de prueba», con correo example.com, y «Cuaderno de prueba», cuyo precio se cambió de 4500.50 a 5000.25. No se usaron datos reales. Los datos viven en MySQL local y no se incluyen en Git.

Pendientes fuera de esta etapa: autenticación, permisos, stock, ventas, clientes, crédito, respaldos y migraciones. Las dudas del PPI se mantienen. El borrado en cascada sigue la práctica, pero su uso en el inventario definitivo requiere decisión funcional. Avisos de dependencias detallados en backend/README.md.
