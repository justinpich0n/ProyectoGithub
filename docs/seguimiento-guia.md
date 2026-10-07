# Seguimiento técnico de BizzStock

Referencia: https://github.com/borissalleg/practica-node (consultada el 6 de octubre de 2026).

## Diagnóstico antes de modificar archivos

Se revisaron el repositorio conectado, README, documentación funcional, exposición, configuración, código y paquetes. Rama `master`, HEAD `d6f48dc`, remoto `origin` correspondiente a `justinpich0n/ProyectoGithub`; GitHub tenía el mismo commit.

Existían cambios preparados de editor, formato, lint y petición HTTP, además de exposición y frontend Vite sin seguimiento. Se conservaron esas configuraciones y se completó la plantilla inicial. No había instrucciones AGENTS.md en el recorrido revisado.

Se confirmó Node.js 24.21.0, npm 11.19.0 y MySQL 8.4.11. Había `.env` privado y dependencias instaladas. Las consultas de lectura confirmaron `bizzstock`, `utf8mb4`, `utf8mb4_unicode_ci`, cero tablas y una cuenta distinta de root con permisos sobre esa base. El backend no estaba escuchando al iniciar el diagnóstico.

## Orden y resultado

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
- Sequelize, modelos, migraciones y CRUD figuran como próximos pasos en la guía. No se adelantan. No se crean tablas, formularios, roles ni endpoints adicionales.

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
