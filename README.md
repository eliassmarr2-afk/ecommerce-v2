# The Camping — Ecommerce V1

Front mínimo de **The Camping**, orientado a camping, verano y escapadas.

## Alcance actual

Esta V1 implementa:

- Inicio mobile-first.
- Ubicación, búsqueda y filtros.
- Categorías: Combos, Inflables, Carpas, Pesca, Anafes, Parrillas y Sillas.
- Tarjetas de producto con precio, rating 4.5, prueba social y estimación de entrega.
- Navegación inferior con Inicio, Novedades, Carrito, Combos e Ingresar.
- Página reutilizable de detalle de producto.
- Carrito local mínimo mediante `localStorage` para validar interacción de front.

Novedades, Carrito e Ingresar todavía no son módulos funcionales completos.

## Arquitectura

La UI no consume datos directamente desde el HTML.

`js/data/catalog.js` funciona como adaptador local de catálogo y expone:

- `getCategories()`
- `getProducts()`
- `getProductById(id)`

Este límite permite reemplazar la fuente local por Protocol Data V2 o por otro backend sin reescribir la composición principal de las páginas.

## Estructura

```text
ecommerce-v2/
├── index.html
├── producto.html
├── css/
│   ├── base.css
│   ├── home.css
│   └── product.css
└── js/
    ├── data/
    │   └── catalog.js
    ├── home.js
    └── product.js
```

## Ejecución

No requiere build ni dependencias.

Abrir `index.html` en un servidor estático. También es apto para GitHub Pages o cualquier hosting de archivos estáticos.

## Estado de integración

**Protocol Data V2 no está conectado en esta fase.**

La intención de la V1 es cerrar primero la estructura visual y de interacción del storefront y conservar un punto de sustitución limpio para la futura capa de datos/CRM.
