# Frontend de BizzStock

Interfaz React con Vite, JavaScript, ESLint, React Router y axios.

## Ejecutar

Desde esta carpeta, `npm ci` instala las versiones del lockfile. Iniciar con:

```sh
npm run dev -- --host 127.0.0.1 --strictPort
```

Abrir http://127.0.0.1:5173. Si el puerto está ocupado, revisar qué instancia lo usa antes de iniciar otra.

## Responsabilidades

- `src/main.jsx`: monta React en el elemento `root` del HTML; se conserva la entrada generada por Vite.
- `src/App.jsx`: declara BrowserRouter y las rutas.
- `src/components/Navbar.jsx`: enlaces NavLink a Inicio, Usuarios y Productos, con indicación de la ruta activa.
- `src/pages/`: Inicio y entradas a los formularios de Usuarios y Productos.
- `src/components/Gestion.jsx`: formulario, lista, edición, cancelación, eliminación confirmada y mensajes de carga/error compartidos por ambos recursos.
- `src/services/api.js`: instancia axios dirigida al backend local en `http://127.0.0.1:3000/api`.
- `src/index.css` y `src/App.css`: estilos generales y barra de navegación.

Los enlaces permiten cambiar el contenido sin solicitar un documento HTML nuevo por cada clic. Usuarios y Productos consumen las rutas CRUD del backend. Debe estar iniciado junto con MySQL. Se crea primero un usuario para asignarlo al producto.

## Diseño de las páginas

La interfaz utiliza verde y crema, navegación lateral en escritorio y navegación superior en móvil. Inicio ofrece accesos a Productos y Usuarios; las otras vistas ofrecen formularios y tablas conectados a MySQL. Las ilustraciones de portada se dibujan con CSS y no requieren servicios externos ni dependencias adicionales.

El diseño incluye foco visible para teclado, etiquetas de navegación y reducción de animaciones según la preferencia del dispositivo. Para sustentarlo: React organiza los componentes, NavLink identifica la página activa y las media queries adaptan la distribución al ancho disponible. Se implementó CRUD; la autenticación sigue pendiente.

## Verificar

```sh
npm run lint
npm run build
```

En el navegador, recorrer Inicio → Usuarios → Productos → Inicio y recargar una ruta directa. Comprobar título, contenido y barra. Crear un usuario ficticio con correo de example.com, crear un producto asociado, editar su precio y recargar para verificar persistencia. Eliminar un usuario también elimina sus productos: el diálogo lo advierte. La compilación se guarda en `dist/`, ignorado por Git. Si en el futuro se publica en un servidor distinto de Vite, ese servidor deberá devolver `index.html` para las rutas de la SPA.

Se conservaron los recursos de ejemplo de Vite en `src/assets/` y `public/`, aunque la interfaz actual ya no los usa.
