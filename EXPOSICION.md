# Sustentación de la entrega actual

Para la entrega del 29 de octubre, consulta [cinco requisitos implementados](docs/entrega-cinco-requisitos.md): REQ-03 búsqueda, REQ-08/09 clientes, REQ-12 costo y REQ-13 precio. El acceso de administrador protege las operaciones; no hay credenciales predeterminadas. La rama está probada y se presenta mediante PR, todavía sin integrar a master. Las instrucciones anteriores de CRUD sin sesión son históricas.

Explicación: el frontend React envía solicitudes con la sesión al backend Express. El backend valida permisos y datos; Sequelize consulta MySQL. La búsqueda usa un índice por nombre; la importación de costos usa una transacción que confirma todas las filas o ninguna. La interfaz muestra resultados y errores, y avisa si el precio de venta es menor al costo. Las pruebas usan datos ficticios y conservan los registros anteriores.

## Material anterior

# BizzStock: guion de sustentación

## Qué se construyó

BizzStock es un sistema en desarrollo para la papelería y variedades Arte y Belleza. Se completaron las partes 1 a 4 de la guía técnica: Node.js, Express, MySQL, Sequelize, React, React Router y axios. La metodología del equipo es Scrum y el tablero elegido es GitHub Projects. El tablero organiza el trabajo; Git guarda las versiones del código.

## Demostración de la primera prueba

1. Iniciar MySQL. En backend ejecutar `npm ci` si cambiaron dependencias y `npm run dev`; en otra terminal, desde frontend, `npm ci` y `npm run dev -- --host 127.0.0.1 --strictPort`. Para detener cada proceso usar Ctrl+C en su terminal. Si un puerto está ocupado, revisar la instancia existente antes de iniciar otra.
2. Abrir http://127.0.0.1:3000/api/health. El 200 con base conectada demuestra que Express puede consultar MySQL en ese momento.
3. Abrir http://127.0.0.1:5173/usuarios. Crear «Equipo de demostración» con un correo ficticio único terminado en @example.com.
4. En Productos crear «Cuaderno de demostración», precio 4500.50 y seleccionar ese usuario. La tabla muestra el usuario gracias a la relación entre las tablas.
5. Editar el precio a 5000.25, guardar y recargar. El cambio permanece porque está almacenado en MySQL.
6. Mostrar la opción de cancelar una edición. Para demostrar borrado, usar exclusivamente los registros ficticios creados para la prueba. Eliminar un usuario borra también sus productos; la confirmación lo advierte.
7. Mostrar `.env.example`, nunca `.env`. Las credenciales, node_modules, dist y datos de MySQL no se publican.

## Cómo viaja una operación

React muestra el formulario y guarda sus valores con useState. Axios envía una petición HTTP. Express encuentra la ruta y llama al controlador. El controlador valida los datos y usa el modelo de Sequelize. Sequelize genera la consulta que MySQL ejecuta. La respuesta JSON vuelve a React y se actualiza la tabla.

GET consulta, POST crea, PUT actualiza y DELETE elimina. Un ID es la llave primaria del registro; usuarioId es la llave foránea que relaciona cada producto con un usuario. Un usuario puede tener varios productos. El correo es único y el precio usa DECIMAL(10,2).

`authenticate()` comprueba el acceso y `sync()` crea las tablas faltantes. No se usa force ni alter, por lo que no se borran ni reconstruyen tablas al arrancar. El pool mysql2 existente se conserva para health y Sequelize administra las operaciones CRUD.

## Qué se comprobó

- `npm run lint` en ambas carpetas: revisión estática aprobada.
- `npm test` en backend: salud simulada, incluyendo fallo y recuperación.
- `npm run test:integration` en backend con el servidor local iniciado: CRUD real, validaciones, correo único, relación, 404 y cascada. Limpia únicamente sus registros ficticios.
- `npm run build` en frontend: compilación aprobada.
- Navegador: creación de usuario y producto, edición del precio y persistencia al recargar.

La guía actual corresponde al commit d2ad193 del profesor, del 13 de octubre de 2026. Las pruebas no constituyen una medición de rendimiento ni una validación de todos los requisitos del PPI.

## Límites actuales

Un registro de usuario todavía no es una cuenta con contraseña: login y permisos están pendientes. También siguen pendientes stock, caja, ventas, clientes, crédito, comprobantes y respaldos. La cascada responde al ejercicio; debe acordarse cómo conservar el inventario cuando se retire un empleado antes del uso real. Hay avisos de dependencias documentados en el README del backend.
