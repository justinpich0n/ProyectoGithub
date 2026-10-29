# BizzStock

Sistema web en desarrollo para la papelería y variedades Arte y Belleza.

## Estado comprobado

- Backend Node.js y Express con Sequelize, `mysql2`, dotenv y CORS.
- MySQL local: base `bizzstock`, `utf8mb4`, tablas `usuarios` y `productos` relacionadas; cuenta con permisos sobre esa base.
- `GET /api/health` consulta MySQL con `SELECT 1`: devuelve 200 si funciona o 503 si falla o está deshabilitado.
- Frontend React con Vite y React Router: Inicio (`/`), Usuarios (`/usuarios`) y Productos (`/productos`). Usuarios y Productos tienen formularios y tablas conectados mediante axios.
- CRUD de Usuarios y Productos: crear, listar, consultar por ID, editar y eliminar. Todavía no hay autenticación, permisos, ventas ni control de existencias.

## Ejecutar en la Mac

Desde la carpeta BizzStock, abrir dos terminales. MySQL debe estar iniciado y `backend/.env` configurado; ver [backend/README.md](backend/README.md).

Terminal 1:

```sh
cd backend
npm ci
npm run dev
```

Terminal 2:

```sh
cd frontend
npm ci
npm run dev -- --host 127.0.0.1 --strictPort
```

Abrir http://127.0.0.1:5173 y comprobar http://127.0.0.1:3000/api/health. `npm ci` se usa al preparar la copia o actualizar dependencias; no hace falta ejecutarlo en cada arranque. Para detener cada servidor, pulsar Ctrl+C en su terminal.

## Comprobaciones

Desde `backend/`: `npm run lint` y `npm test`. Con el backend local iniciado: `npm run test:integration` crea datos ficticios, verifica el CRUD y elimina solo sus propios registros.
Desde `frontend/`: `npm run lint` y `npm run build`.

Verificación del 6 de octubre de 2026: Node.js 24.21.0, npm 11.19.0 y MySQL 8.4.11; comandos anteriores correctos y endpoint real HTTP 200. Se comprobó en navegador la navegación y la recarga directa de Productos, sin errores ni advertencias de consola.

## Documentación y alcance

- [Seguimiento de la guía y diagnóstico inicial](docs/seguimiento-guia.md).
- [Requisitos funcionales y dudas pendientes](docs/requisitos-bizzstock.md).
- [Preparación del backend](backend/README.md).
- [Frontend](frontend/README.md).
- [Guion para la sustentación](EXPOSICION.md).
- [Guía técnica de referencia](https://github.com/borissalleg/practica-node).

Actualización del 15 de octubre de 2026: implementadas las partes 3 y 4 de la guía del profesor, commit `d2ad193` del 13 de octubre. Sequelize crea las tablas con `sync()` sin `force` ni `alter`. Al eliminar un usuario se eliminan sus productos asociados, como indica la práctica; la interfaz pide confirmación. Esta regla deberá validarse para el inventario definitivo.

Permisos, inventario, caja, ventas, pagos, clientes, crédito, comprobantes, respaldos y migraciones siguen pendientes. El sistema se ejecuta en la Mac como práctica local, con datos ficticios.

`.env`, dependencias instaladas, compilaciones y respaldos locales quedan fuera de Git. `.env.example` contiene solo ejemplos. Los datos de MySQL se preparan en cada equipo y no se publican.

## Entrega del 29 de octubre de 2026

En la rama justin/ppi-busqueda-clientes-costos-precios se implementan REQ-03, REQ-08, REQ-09, REQ-12 y REQ-13. Se exige iniciar sesión; los usuarios anteriores no son cuentas de acceso automáticamente. Para la primera cuenta: desde backend ejecutar `npm run crear:cuenta` en una terminal interactiva, elegir rol y contraseña privada. Después arrancar ambos servidores como se indica arriba.

La [entrega con alcance, pruebas y demostración](docs/entrega-cinco-requisitos.md) explica campos nuevos, importación CSV, permisos y límites. `npm run test:ppi` desde backend ejecuta la integración real con MySQL y registros ficticios propios. Las rutas CRUD ahora requieren autenticación; las instrucciones antiguas de acceso sin sesión son históricas.
