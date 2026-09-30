# BizzStock

Sistema web en desarrollo para la papelería y variedades Arte y Belleza.

## Estado actual

- Backend con Node.js y Express, conectado a MySQL mediante un pool de `mysql2`.
- Base local `bizzstock` preparada con `utf8mb4`, todavía sin tablas.
- `GET /api/health` ejecuta `SELECT 1`: responde HTTP 200 si la consulta funciona y HTTP 503 si falla o la conexión está deshabilitada.
- Prueba aislada de la ruta para comprobar éxito, fallo y recuperación sin modificar MySQL.

Las funciones de usuarios y permisos, productos, inventario, caja, ventas, pagos, clientes, crédito, comprobantes y respaldos están pendientes. Todavía no hay frontend.

## Ejecutar el proyecto

Consulta [las instrucciones del backend](backend/README.md) para instalar dependencias, iniciar MySQL, configurar `.env`, crear la base vacía e iniciar Express.

Se verificó localmente con Node.js 24.14.1, npm 11.11.0 y MySQL 9.1.0 de Wamp. El repositorio incluye `package-lock.json`; `npm ci` permite instalar las versiones registradas desde `backend/`.

La configuración privada, las dependencias instaladas y los respaldos locales no forman parte del repositorio. `.env.example` es una plantilla con valores de ejemplo. La base se prepara en cada entorno siguiendo las instrucciones; no se suben datos de MySQL a GitHub.

## Documentación

- [Preparación y comprobación del backend](backend/README.md).
- [Alcance funcional e inconsistencias de requisitos](docs/requisitos-bizzstock.md).
- [Guía técnica de referencia](https://github.com/borissalleg/practica-node).

La página HTML genérica inicial se retiró porque no formaba parte del backend ni del futuro frontend de BizzStock.
