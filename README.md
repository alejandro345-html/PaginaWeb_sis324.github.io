# TechStore

Tienda web demostrativa construida con HTML, CSS y JavaScript puro. No necesita instalar dependencias ni configurar un servidor.

## Cómo ejecutar
1. Descomprime `TechStore.zip`.
2. Abre la carpeta `TechStore`.
3. Abre `index.html` con tu navegador. También puedes usar la extensión Live Server de VS Code.

## Acceso de demostración
- Administrador: `admin@techstore.com`
- Contraseña: `Admin123!`

Puedes registrar clientes desde el botón **Ingresar**.

## Funciones incluidas
- Catálogo con búsqueda, filtro por categoría y ordenamiento.
- Registro e inicio de sesión con roles de administrador y cliente.
- Carrito y creación de pedidos con descuento de inventario.
- Historial de pedidos para clientes.
- Panel administrativo con indicadores.
- Alta, edición y eliminación de productos mediante formularios modales.
- Reposición de stock y registro de movimientos.
- Gestión del estado de pedidos con formulario.
- Registro de ventas de pedidos entregados.
- Listado de clientes y reportes básicos.
- Formularios de edición de cuenta.
- Notificaciones Toast y confirmaciones personalizadas.
- Fotografías temáticas de tecnología en portada y tarjetas de productos (requieren conexión a internet).
- Campo para asignar URL de imagen al crear o editar productos.
- Diseño adaptable a computadoras, tabletas y móviles.
- Persistencia local mediante `localStorage`.

## Imágenes
Las fotografías de demostración se cargan desde Unsplash mediante conexión a internet. Puedes reemplazarlas por URLs de imágenes propias desde el formulario de agregar/editar producto.

## Importante
Este proyecto es un prototipo académico/local. Las contraseñas y roles se almacenan en el navegador y no existe validación de seguridad del lado del servidor. No lo uses para procesar pagos reales ni para publicar una tienda en producción. Para producción se necesita backend, base de datos, autenticación segura y control de permisos en servidor.

## Reiniciar los datos
En el navegador abre las herramientas de desarrollador (F12), entra a Console y ejecuta:
`localStorage.clear(); location.reload();`
Esto elimina los datos guardados localmente y vuelve a cargar los productos de demostración.
