# Contrato de API — ConstruyeWeb

Este documento es el acuerdo entre backend (Django + DRF) y frontend (Next.js).
Ninguno de los dos empieza a programar contra el otro sin que un endpoint
esté aquí primero. Si algo cambia sobre la marcha, se actualiza este
documento el mismo día — no se avisa "de palabra" en el chat del grupo.

Base URL local sugerida: `http://localhost:8000/api/`

Formato de respuesta de error, siempre igual en todos los endpoints:
```json
{ "error": "mensaje legible", "detalle": "opcional, para debug" }
```

---

## 1. Catálogo (público, sin autenticación)

### `GET /api/categorias/`
Árbol completo de categorías, ya anidado (el frontend no arma el árbol, el backend sí).
```json
[
  {
    "id": 1,
    "nombre": "Ferretería general",
    "slug": "ferreteria-general",
    "nivel": 0,
    "hijas": [
      {
        "id": 2,
        "nombre": "Tornillería",
        "slug": "tornilleria",
        "nivel": 1,
        "hijas": []
      }
    ]
  }
]
```

### `GET /api/marcas/`
```json
[{ "id": 4, "nombre": "Stanley", "slug": "stanley", "logo_url": "https://..." }]
```

### `GET /api/productos/`
Parámetros de query: `?categoria=tornilleria&marca=stanley&buscar=martillo&pagina=1&por_pagina=24`
```json
{
  "total": 340,
  "pagina": 1,
  "por_pagina": 24,
  "resultados": [
    {
      "id": 501,
      "codigo_producto": "FC-00501",
      "slug": "martillo-stanley-16oz",
      "nombre": "Martillo Stanley 16oz",
      "marca": "Stanley",
      "categoria": "Herramientas manuales",
      "precio_con_iva": 285.50,
      "imagen_principal": "https://...",
      "disponible": true
    }
  ]
}
```
Nota: `precio_con_iva` sale de la vista `v_precio_actual`; `disponible` sale de
sumar `inventario.disponible` en la(s) sucursal(es) marcadas como
`es_bodega_ecommerce = true`.

### `GET /api/productos/{slug}/`
Detalle completo de un producto.
```json
{
  "id": 501,
  "codigo_producto": "FC-00501",
  "nombre": "Martillo Stanley 16oz",
  "descripcion": "...",
  "marca": { "id": 4, "nombre": "Stanley" },
  "categoria": { "id": 8, "nombre": "Herramientas manuales", "slug": "herramientas-manuales" },
  "precio": { "precio_sin_iva": 246.12, "porcentaje_iva": 15, "precio_con_iva": 283.04 },
  "imagenes": ["https://...", "https://..."],
  "disponible": true,
  "stock_disponible": 12
}
```

---

## 2. Cuentas de cliente

### `POST /api/clientes/registro/`
```json
// request
{ "nombre": "Juan Pérez", "email": "juan@correo.com", "password": "..." }
// response 201
{ "id": 88, "nombre": "Juan Pérez", "email": "juan@correo.com", "token": "eyJ..." }
```

### `POST /api/clientes/login/`
```json
// request
{ "email": "juan@correo.com", "password": "..." }
// response 200
{ "token": "eyJ...", "cliente": { "id": 88, "nombre": "Juan Pérez" } }
```
El `token` se manda luego en cada request protegido: header `Authorization: Bearer eyJ...`

### `GET /api/clientes/me/` (requiere token)
```json
{ "id": 88, "nombre": "Juan Pérez", "email": "juan@correo.com" }
```

### `GET /api/clientes/me/direcciones/` (requiere token)
```json
[{ "id": 12, "alias": "Casa", "direccion": "...", "ciudad": "Managua", "predeterminada": true }]
```

### `POST /api/clientes/me/direcciones/` (requiere token)
```json
// request
{ "alias": "Casa", "direccion": "...", "ciudad": "Managua", "predeterminada": true }
// response 201: la dirección creada, mismo formato que arriba
```

---

## 3. Carrito

El carrito puede existir sin login (invitado, identificado por `session_id`
que genera el frontend y manda en cada request vía header `X-Session-Id`),
o ligado a un cliente si hay token.

### `GET /api/carrito/`
```json
{
  "id": 900,
  "items": [
    { "producto_id": 501, "nombre": "Martillo Stanley 16oz", "cantidad": 2, "precio_unitario": 283.04, "subtotal": 566.08 }
  ],
  "total": 566.08
}
```

### `POST /api/carrito/items/`
```json
// request
{ "producto_id": 501, "cantidad": 2 }
// response 201: el item creado o actualizado si ya existía
```

### `PATCH /api/carrito/items/{item_id}/`
```json
// request
{ "cantidad": 3 }
```

### `DELETE /api/carrito/items/{item_id}/`
Sin body. Response 204.

---

## 4. Pedidos y pagos

### `POST /api/pedidos/` (requiere token — no hay checkout de invitado)
Convierte el carrito actual del cliente en un pedido. El backend congela
precios aquí (`precio_unitario_snapshot`), valida stock disponible, y
crea el movimiento de inventario tipo `reserva`.
```json
// request
{ "direccion_envio_id": 12, "sucursal_id": 1 }
// response 201
{
  "numero_pedido": "CW-000123",
  "estado": "pendiente",
  "subtotal": 566.08,
  "iva_total": 84.91,
  "total": 650.99
}
```

### `GET /api/pedidos/{numero_pedido}/` (requiere token, solo el dueño del pedido)
```json
{
  "numero_pedido": "CW-000123",
  "estado": "en_preparacion",
  "items": [{ "producto": "Martillo Stanley 16oz", "cantidad": 2, "subtotal": 566.08 }],
  "total": 650.99,
  "creado": "2026-09-10T14:20:00Z"
}
```

### `GET /api/clientes/me/pedidos/` (requiere token)
Lista de pedidos del cliente logueado, mismo formato resumido que arriba.

### `POST /api/pedidos/{numero_pedido}/pagos/` (requiere token)
```json
// request
{ "metodo_pago": "tarjeta", "referencia_transaccion": "..." }
// response 201
{ "id": 55, "estado": "aprobado", "monto": 650.99 }
```

---

## 5. Lo que NO va en esta API

- **Panel de administración (subir productos, ver inventario, gestionar precios):**
  se maneja directo en el admin de Django (`/admin/`), server-rendered.
  No necesita endpoints REST separados — es trabajo exclusivo del backend,
  el frontend Next.js nunca lo toca.
- **Autenticación de administradores:** es el login de Django, no el de
  `clientes` (son dos sistemas de usuarios distintos, no se mezclan).

---

## Convenciones generales

- Todas las fechas en ISO 8601 UTC (`2026-09-10T14:20:00Z`).
- Todos los precios como número con 2 decimales, nunca string.
- Paginación: siempre `pagina` (empieza en 1) y `por_pagina`, nunca offset/limit.
- Slugs, no IDs, en las URLs públicas de producto/categoría (mejor para SEO
  y para que el frontend no exponga IDs internos autoincrementales).
- Todo endpoint que requiere login responde `401` si falta el token, `403`
  si el token es válido pero no es el dueño del recurso (ej. ver el pedido
  de otro cliente).
