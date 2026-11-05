# BizzStock: guion para la feria

Actualizado: 5 de noviembre de 2026. Duración aproximada: 2 a 2½ minutos, sin la demostración. Tono conversado: hacer una pausa breve en las preguntas, sin forzar las bromas. Las notas posteriores no se leen en voz alta.

Buenos días, tardes o noches. Soy Justin Enrique Mena Córdoba y les presento BizzStock: una aplicación web para una papelería y tienda de variedades. La idea es tener productos, clientes y ventas organizados, para que al cobrar no toque hacer cuentas en una servilleta.

La desarrollamos con JavaScript, HTML, CSS y SQL. La interfaz usa React y Vite; el servidor, Node.js y Express. Los datos se guardan en una base relacional compatible con MySQL y usamos Sequelize como ORM para trabajar con sus tablas. Está desplegada en Render: se abre desde el computador o el celular, sin depender de mi terminal.

Trabajamos con Scrum y organizamos los requisitos del PPI en un backlog de GitHub Projects. Las ramas separan los cambios y los pull requests permiten revisarlos antes de integrarlos: así queda registro de qué cambió y quién lo hizo.

La aplicación incluye CRUD: crear, consultar, actualizar y eliminar registros. El catálogo muestra fotos, precios y disponibilidad registrada. En caja elegimos productos, asociamos al cliente y registramos el pago; el sistema calcula el cambio y genera el comprobante. Además, el administrador puede consultar las ventas de todos los cajeros.

¿Y la seguridad? Un comprador puede registrarse para ver el catálogo, pero trabajar como cajero o administrador requiere autorización del propietario. El QR abre la página; no entrega las llaves de la caja.

Las contraseñas se guardan como una huella con scrypt y una sal aleatoria. Los documentos de las cuentas están cifrados, usamos HTTPS, validamos permisos y datos, limitamos intentos fallidos y evitamos cuentas duplicadas. Las credenciales de conexión quedan fuera de GitHub.

¿Inexpugnable? Ojalá. Tenemos protecciones para reducir riesgos, pero todavía es un prototipo que necesita mejoras y revisión. Los cobros son simulados: aquí podemos practicar sin poner a sufrir la tarjeta.

Ahora sí, vamos a hacer una venta.

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
