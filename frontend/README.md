# Frontend de BizzStock

Interfaz React con Vite, JavaScript, ESLint y React Router.

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
- `src/pages/`: contenido informativo de cada ruta.
- `src/index.css` y `src/App.css`: estilos generales y barra de navegación.

Los enlaces permiten cambiar el contenido sin solicitar un documento HTML nuevo por cada clic. Las páginas no consumen el backend todavía y no registran usuarios ni productos.

## Diseño de las páginas

La interfaz utiliza verde y crema, navegación lateral en escritorio y navegación superior en móvil. Inicio ofrece accesos a Productos y Usuarios; las otras vistas explican el alcance previsto y distinguen las funciones pendientes. Las ilustraciones de portada se dibujan con CSS y no requieren servicios externos ni dependencias adicionales.

El diseño incluye foco visible para teclado, etiquetas de navegación y reducción de animaciones según la preferencia del dispositivo. Para sustentarlo: React organiza los componentes, NavLink identifica la página activa y las media queries adaptan la distribución al ancho disponible. No se añadieron operaciones CRUD ni autenticación.

## Verificar

```sh
npm run lint
npm run build
```

En el navegador, recorrer Inicio → Usuarios → Productos → Inicio y recargar una ruta directa. Comprobar título, contenido y barra. La compilación se guarda en `dist/`, ignorado por Git. Si en el futuro se publica en un servidor distinto de Vite, ese servidor deberá devolver `index.html` para las rutas de la SPA.

Se conservaron los recursos de ejemplo de Vite en `src/assets/` y `public/`, aunque la interfaz actual ya no los usa.
