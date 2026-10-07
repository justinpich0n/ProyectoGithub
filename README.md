# BizzStock

Sistema web en desarrollo para la papelería y variedades Arte y Belleza.

## Estado comprobado

- Backend Node.js y Express con `mysql2`, dotenv y CORS.
- MySQL local: base `bizzstock`, `utf8mb4`, sin tablas de negocio; cuenta con permisos sobre esa base.
- `GET /api/health` consulta MySQL con `SELECT 1`: devuelve 200 si funciona o 503 si falla o está deshabilitado.
- Frontend React con Vite y React Router: Inicio (`/`), Usuarios (`/usuarios`) y Productos (`/productos`). Las páginas son informativas.
- No hay autenticación, CRUD ni conexión de estas páginas a endpoints de negocio.

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

Desde `backend/`: `npm run lint` y `npm test`.
Desde `frontend/`: `npm run lint` y `npm run build`.

Verificación del 6 de octubre de 2026: Node.js 24.21.0, npm 11.19.0 y MySQL 8.4.11; comandos anteriores correctos y endpoint real HTTP 200. Se comprobó en navegador la navegación y la recarga directa de Productos, sin errores ni advertencias de consola.

## Documentación y alcance

- [Seguimiento de la guía y diagnóstico inicial](docs/seguimiento-guia.md).
- [Requisitos funcionales y dudas pendientes](docs/requisitos-bizzstock.md).
- [Preparación del backend](backend/README.md).
- [Frontend](frontend/README.md).
- [Guion para la sustentación](EXPOSICION.md).
- [Guía técnica de referencia](https://github.com/borissalleg/practica-node).

Las funciones de usuarios y permisos, productos, inventario, caja, ventas, pagos, clientes, crédito, comprobantes y respaldos se conservan como alcance futuro. La guía sitúa Sequelize, migraciones y CRUD en sus próximos pasos; no se implementaron en esta etapa.

`.env`, dependencias instaladas, compilaciones y respaldos locales quedan fuera de Git. `.env.example` contiene solo ejemplos. Los datos de MySQL se preparan en cada equipo y no se publican.
