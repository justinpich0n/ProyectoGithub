# BizzStock: guion para la feria

Actualizado: 5 de noviembre de 2026. Duración aproximada: 3 a 3½ minutos, sin la demostración. Las notas posteriores no se leen en voz alta.

Buenos días, tardes o noches. Mi nombre es Justin Enrique Mena Córdoba y hoy les presento BizzStock, una aplicación web para organizar una papelería y tienda de variedades. Su idea principal es sencilla: reunir los productos, los clientes y la caja en un mismo lugar, para registrar lo que se vende y quién lo vende.

Para desarrollarla utilizamos JavaScript, HTML, CSS y SQL. El frontend está hecho con React y se compila con Vite. El backend funciona con Node.js, que ejecuta JavaScript en el servidor, y Express, que recibe las solicitudes. La base de datos es relacional y compatible con MySQL. Usamos Sequelize como ORM para trabajar con sus tablas y relaciones. La aplicación está desplegada en Render, así que podemos abrirla desde un computador o celular sin iniciar el proyecto en nuestra terminal.

Organizamos el trabajo con la metodología Scrum y un backlog en GitHub Projects. Allí relacionamos las tareas con los requisitos funcionales y no funcionales del PPI. Git conserva el historial; las ramas permiten separar los cambios y los pull requests permiten revisarlos antes de integrarlos. No son lo mismo: Scrum organiza el trabajo y GitHub nos ayuda a seguirlo.

La aplicación permite crear, consultar, actualizar y eliminar registros: ese es el CRUD. El catálogo muestra fotografías, precios y disponibilidad registrada. La caja permite elegir productos, asociar un cliente, registrar el medio de pago y calcular el cambio. Después genera un comprobante con el detalle y una confirmación visual. El registro de ventas permite a los administradores consultar las ventas de todos los cajeros, con filtros de fecha y medio de pago.

También diferenciamos los permisos. Un comprador puede registrarse para consultar el catálogo; para trabajar como cajero o administrador se necesita la autorización del propietario. El QR abre la página de acceso: no concede permisos por sí solo.

En seguridad, no guardamos las contraseñas tal como se escriben. Usamos scrypt con una sal aleatoria para generar una huella que permite verificarlas. Los documentos de identidad de las cuentas se almacenan cifrados, y su número completo solo se muestra al propietario. La página utiliza HTTPS, el servidor valida los permisos y los datos, limita intentos fallidos de acceso y evita cuentas duplicadas por correo o documento. Las credenciales de conexión no se publican en GitHub.

Estas medidas reducen los riesgos, pero no hacen que la aplicación sea imposible de hackear. Todavía es un prototipo que requiere mejoras y revisión continua para un uso real. Los cobros son simulados: no cargamos dinero a tarjetas ni emitimos facturas electrónicas.

Ahora voy a mostrarles cómo se realiza una venta en BizzStock. Muchas gracias.

## Notas para sustentar

- JavaScript y SQL son lenguajes; HTML es marcado y CSS define estilos. Node.js es un entorno de ejecución, React una biblioteca, Express un framework, Vite una herramienta de desarrollo y compilación, y Sequelize el ORM.
- El proyecto sigue una arquitectura cliente-servidor, con rutas, controladores y modelos en el backend. React muestra la interfaz; Express valida; Sequelize consulta la base de datos.
- Se comprobó la aplicación pública en Render. El endpoint de salud confirma una conexión compatible con MySQL; no identifica por sí solo al proveedor de alojamiento de la base de datos. No afirmar Aiven o TiDB sin comprobar la configuración privada actual.
- «Disponibilidad registrada» no significa que se haya implementado el descuento automático de existencias en cada cobro.
- No afirmar que todas las tareas o todos los requisitos del PPI están terminados.
- Si preguntan por seguridad, explicar la diferencia entre el hash de una contraseña y el cifrado reversible de un documento. No mostrar credenciales ni documentos reales durante la demostración.
- Las sesiones duran como máximo ocho horas y se invalidan al cerrar sesión. Actualmente se guardan en memoria del servidor: un reinicio obliga a entrar nuevamente.
- Las fotos iniciales son referencias; su marca o presentación puede variar. Los créditos están en `/productos/fotos.html`.
- Consulta el [detalle verificado de seguridad y sus límites](docs/seguridad-feria.md). El [guion anterior](docs/exposicion-historica.md) se conserva como archivo histórico.
