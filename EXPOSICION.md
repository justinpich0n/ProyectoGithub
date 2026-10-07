# BizzStock: guion de sustentación

## Qué se construyó

BizzStock es un sistema en desarrollo para la papelería y variedades Arte y Belleza. Esta etapa prepara el backend conectado a MySQL y una interfaz con navegación. Las funciones del negocio siguen pendientes.

## Demostración sugerida

1. Mostrar `README.md` y las carpetas `backend/` y `frontend/`.
2. Explicar `backend/server.js`: dotenv carga la configuración privada, se comprueba MySQL y se inicia Express en el puerto 3000.
3. Explicar `backend/src/db.js`: mysql2 administra un pool; `SELECT 1` comprueba acceso sin modificar datos. La base vacía es un contenedor para futuras tablas.
4. Abrir http://127.0.0.1:3000/api/health: HTTP 200 y `baseDeDatos: "conectada"` confirman acceso en ese momento. Un 503 significa que no está disponible o está deshabilitado.
5. Abrir http://127.0.0.1:5173 y recorrer Inicio, Usuarios y Productos. Navbar se mantiene y cambia el contenido.
6. Mostrar `frontend/src/App.jsx`: BrowserRouter gestiona navegación y Routes relaciona cada dirección con su componente. `Link` permite navegación dentro de la SPA.
7. Mostrar `.env.example`, nunca `.env`. Explicar que Git ignora secretos, node_modules y dist; el lockfile permite reproducir dependencias.
8. Explicar las comprobaciones y distinguir una prueba simulada de una conexión real.

## Comandos

Con MySQL iniciado y `.env` configurado, abrir una terminal en `backend/` y ejecutar `npm run dev`; abrir otra en `frontend/` y ejecutar `npm run dev -- --host 127.0.0.1 --strictPort`. Detener cada una con Ctrl+C al terminar.

Desde `backend/`:

```sh
npm run lint
npm test
curl -i http://127.0.0.1:3000/api/health
```

Desde `frontend/`:

```sh
npm run lint
npm run build
```

## Qué demuestran las comprobaciones

- Lint busca problemas estáticos en el código.
- La prueba del backend simula éxito, fallo, recuperación y conexión deshabilitada, sin detener MySQL.
- La petición HTTP real comprueba Express y la consulta real a MySQL.
- Build comprueba que Vite puede compilar el frontend.
- La prueba manual del navegador comprueba enlaces, contenido y recarga directa.

Todos estos controles se completaron el 6 de octubre de 2026. MySQL 8.4.11, base `bizzstock`, `utf8mb4`, cero tablas. No se usaron datos de clientes.

## Explicación breve para estudiar

“React muestra las páginas y React Router permite navegar entre ellas. Express atiende la ruta de comprobación y usa mysql2 para consultar MySQL. La configuración privada está en .env y no se publica. Tener conexión y navegación no significa que ya existan productos, usuarios o ventas: esos módulos todavía están pendientes.”

El frontend actual no solicita datos al backend. CORS está preparado para permitir peticiones entre puertos cuando corresponda. Las dudas sobre permisos, caja y crédito siguen documentadas, sin inventar reglas.
