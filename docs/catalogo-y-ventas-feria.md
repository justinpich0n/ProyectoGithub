# Catálogo y registro de ventas

- Registro de ventas: los administradores consultan todas las ventas, con cajero, fecha, cliente, método, resumen y detalle. Los cajeros conservan sus últimos comprobantes. Las ventas nuevas guardan una copia del nombre y rol del vendedor.
- Comprador: registro inmediato con documento y correo únicos; solo consulta el catálogo. No puede cobrar, administrar ni ser responsable de productos. El personal sigue requiriendo aprobación.
- Tienda de demostración: Tecnológico de Antioquia, Campus Robledo, Calle 78B No. 72A–220, Medellín. La ubicación es ilustrativa, no implica una tienda oficial de la institución.
- Imágenes: pegar un enlace directo público HTTPS en Productos, revisar vista previa y guardar. No pegar la dirección de una página de búsqueda. El alojamiento externo debe permitir mostrar la imagen; si deja de funcionar se muestra una ilustración genérica. También se admiten PNG/JPG de hasta 5 MB, optimizados y guardados en la base de datos. Las imágenes iniciales son fotografías JPG de referencia. Solo se reemplazan las ilustraciones predeterminadas; se conservan las imágenes personalizadas. Galería descargable y créditos: `/productos/fotos.html`.
- La disponibilidad refleja la cantidad registrada. El cobro es una simulación; no procesa pagos bancarios reales.

Validación: 60 pruebas de acceso y catálogo, 49 pruebas de cobro e historial global, lint de ambos componentes y compilación de React.

Comprobantes: mismo componente en Caja e Historial, confirmación verde animada, detalle por unidad, fecha colombiana, vendedor, recibido/cambio y opción de imprimir o guardar PDF. Se respeta la preferencia de movimiento reducido.
