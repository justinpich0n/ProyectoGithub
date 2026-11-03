# Verificación de RNF 01

Justin verificó el 3 de noviembre de 2026 el límite de dos segundos para las operaciones HTTP actuales de la maqueta, con MySQL real en este Mac. Resultado: 240 mediciones, máximo 294.77 ms y percentil 95 de 28.17 ms. Todas las muestras quedaron bajo 2000 ms. El JSON adjunto registra cada método, ruta, estado, tiempo y entorno sin credenciales ni cuerpos de solicitudes.

## Repetir la prueba

Desde backend ejecutar npm run test:rendimiento con MySQL disponible y la configuración local .env existente. No publicar .env. El comando ejecuta tres rondas de los casos PPI y cobro, crea 3000 productos ficticios por ronda PPI y prueba una importación de 500 costos. Reutiliza las comprobaciones funcionales para comprobar que una respuesta rápida también sea correcta. Si cualquier respuesta supera dos segundos, el comando falla. El informe JSON se regenera con los valores del equipo actual.

Mide desde el envío HTTP hasta consumir el JSON, con conexión local y una petición activa por vez. Incluye login, sesión, logout, permisos, CRUD de usuarios/productos, búsqueda, clientes, creación de cuentas, importación, cobro y errores esperados. Los modelos y la carga inicial se preparan antes del cronómetro. Las pruebas de cobro se ejecutan después de limpiar la carga PPI: no se afirma que las 240 solicitudes se ejecuten con 3000 productos simultáneamente. No es una prueba de saturación.

## Alcance del cierre

Se acredita la muestra reproducible del backend actual bajo estas condiciones de maqueta. No es una garantía para todas las ejecuciones, tiempos completos de interfaz/navegación, varios usuarios, otros equipos o funciones aún ausentes. Si cambian operaciones, equipo, volumen o concurrencia debe repetirse y ampliar la prueba. La descripción original de RNF-01 trata usabilidad; esa contradicción sigue documentada y RNF-02 no se declara cumplido.

No se requirió modificar lógica de producción ni añadir dependencias. Las pruebas eliminan únicamente sus usuarios, productos, clientes y cobros ficticios; se comprueba conservación de productos anteriores. El borrado de carpetas temporales se limita al directorio aleatorio creado por el propio ejecutor.
