# Propuesta de Proyecto: Sistema de Gestión de Inventario, POS y E-Commerce Ferretero
## ConstruyeWeb — Ferretería Construye

## 1. Descripción General y Arquitectura del Sistema

El proyecto consiste en una plataforma desacoplada diseñada para resolver la gestión operativa, comercial y financiera de una ferretería. El sistema separa estrictamente la capa administrativa y el punto de venta presencial (POS) del portal público de comercio electrónico.

### 1.1. Enfoque Arquitectónico: Desacoplamiento API-First

El sistema se compone de dos aplicaciones independientes ejecutadas en entorno local (localhost), comunicadas exclusivamente mediante un contrato de API REST definido de antemano:

```
+------------------------------------+        +-----------------------------------+
|     Frontend E-Commerce público    |        |     Panel POS / Administración    |
|         (Next.js App Router)       |        |        (Django Admin + DRF)       |
+------------------------------------+        +-----------------------------------+
                  |                                             |
                  +---------------------+-----------------------+
                                        | HTTP / REST API (JSON)
                                        v
                      +-----------------------------------+
                      |          Backend Core API         |
                      |    (Django REST Framework - DRF)  |
                      +-----------------------------------+
                                        |
                                        v
                      +-----------------------------------+
                      |      Base de Datos Relacional     |
                      |           (PostgreSQL)            |
                      +-----------------------------------+
```

- **Resiliencia operativa**: una eventual falla o mantenimiento en la tienda web e-commerce jamás paraliza el punto de venta (POS) en la tienda física, garantizando la continuidad del negocio presencial.
- **Seguridad por diseño**: exposición restringida de la lógica interna de inventario y contabilidad mediante endpoints REST protegidos por autenticación basada en tokens (ver Sección 4 del contrato de API — endpoints de cliente vs. panel administrativo).
- **Sincronización atómica**: actualización centralizada de existencias para prevenir condiciones de carrera y sobreventas entre canales presenciales y digitales, mediante la tabla `inventario` (saldo por sucursal) y la bitácora `movimientos_inventario`.

### 1.2. División de responsabilidades del equipo

El desarrollo se divide en dos frentes independientes que avanzan en paralelo, coordinados por un contrato de API acordado antes de escribir código en cualquiera de los dos lados:

| Integrante | Responsabilidad |
|---|---|
| Jonathan | Modelado de la base de datos PostgreSQL; frontend público en Next.js (catálogo, carrito, checkout) |
| Elizabeth | Backend Django + Django REST Framework; panel administrativo/POS; lógica de negocio e integración con Stripe |

El desacoplamiento arquitectónico (1.1) es lo que permite que ambos frentes avancen simultáneamente: el frontend se construye contra datos de prueba que respetan el contrato de API mientras el backend implementa los endpoints reales, y se reemplazan progresivamente sin bloquear a ninguna de las dos partes.

El esquema de base de datos y el contrato de API que sustentan esta propuesta están documentados por separado (`schema_construyeweb.sql` y `api_contract_construyeweb.md`) y son la fuente de verdad técnica sobre la que trabajan ambos integrantes.

---

## 2. Lógica de Negocio y Dominio Ferretero

La operación ferretera exige reglas de negocio que difieren sustancialmente del comercio minorista tradicional.

### 2.1. Gestión de Inventario y Unidades Fraccionadas

- **Venta a granel y conversión de unidades**: soporte nativo para ítems enteros (unidades, herramientas) y fraccionados (kilogramos de clavos, metros de cable, litros de pintura). La tabla `unidades_medida` marca explícitamente cuáles unidades son fraccionables (`es_fraccionable`), y todos los campos de cantidad y costo en el esquema usan `NUMERIC` de precisión fija — nunca tipos de punto flotante — para erradicar errores de redondeo acumulativo.
- **Trazabilidad (Kardex) y costo promedio ponderado (CPP)**: la tabla `movimientos_inventario` funciona como bitácora inmutable y auditable de cada entrada, venta, ajuste, reserva y liberación de stock por producto y sucursal. El costo promedio ponderado se mantiene en `producto_precios.costo_promedio`, y se recalcula desde el backend (Django) cada vez que se registra un movimiento de tipo `entrada` con un costo de compra distinto al vigente — la base de datos garantiza la integridad del historial, pero el cálculo de la ponderación es lógica de aplicación, no un trigger de base de datos.

### 2.2. Prevención de Condiciones de Carrera (Race Conditions)

Para evitar la sobreventa simultánea entre la caja física y la tienda web cuando el stock disponible es crítico, el backend ejecuta transacciones SQL con bloqueo pesimista a nivel de fila (`SELECT FOR UPDATE` vía Django ORM) directamente sobre la tabla `inventario`, no sobre el producto en sí — esto es necesario porque el stock vive por sucursal, no de forma global:

```python
from django.db import transaction

@transaction.atomic
def reservar_stock(producto_id, sucursal_id, cantidad_solicitada):
    inv = Inventario.objects.select_for_update().get(
        producto_id=producto_id, sucursal_id=sucursal_id
    )
    if inv.disponible < cantidad_solicitada:
        raise StockInsuficienteException(
            "Stock insuficiente para completar la transacción."
        )
    inv.comprometido += cantidad_solicitada
    inv.save()
    MovimientoInventario.objects.create(
        producto_id=producto_id,
        sucursal_id=sucursal_id,
        tipo="reserva",
        cantidad=cantidad_solicitada,
    )
```

La columna `disponible` de `inventario` es una columna generada (`stock - comprometido`) — no se puede desincronizar por un update manual incompleto, lo cual refuerza la garantía transaccional de arriba.

---

## 3. Stack Tecnológico

El stack elegido responde a criterios estrictos de seguridad por defecto, velocidad de desarrollo y separación clara de responsabilidades:

| Capa | Tecnología | Justificación Técnica |
|---|---|---|
| Frontend | Next.js | Enrutamiento moderno basado en el sistema de archivos (App Router) y renderizado híbrido. Permite ocultar llaves privadas de API / secretos de pasarela en la capa del servidor (Server Components / Server Actions), impidiendo la exposición de credenciales sensibles en el cliente web. |
| Backend | Django & Django REST Framework (DRF) | Proporciona un panel de administración profesional autogenerado out-of-the-box para la gestión operativa interna (subida de productos, ajustes de inventario) sin necesidad de construir una interfaz administrativa separada. Incorpora protección nativa contra inyección SQL, XSS y CSRF, respaldado por un ORM maduro para las transacciones atómicas descritas en 2.2. |
| Base de Datos | PostgreSQL | Motor relacional innegociable. Garantiza cumplimiento estricto de propiedades ACID, integridad referencial mediante claves foráneas (ver relaciones `REFERENCES` en el esquema), y cálculo exacto de impuestos/totales mediante tipos `NUMERIC` de punto fijo. |
| Entorno | Localhost | Desarrollo, pruebas de integración y demostración en vivo se realizan íntegramente en entorno local, excluyendo deliberadamente infraestructura en la nube u orquestación de contenedores. |

El backend expone su API siguiendo el contrato documentado en `api_contract_construyeweb.md`: el panel administrativo (Django Admin) opera server-rendered y **no** pasa por la API REST, mientras que todo lo que consume el frontend público sí lo hace — separación explícita entre los dos frentes de trabajo descritos en 1.2.

Modelado Visual de Base de Datos

---

## 4. Pasarela de Pagos: Stripe (Test Mode) & Stripe CLI

El flujo de pago del e-commerce se integra formalmente con Stripe operando en modo de prueba (Test Mode).

### 4.1. Flujo de Transacción y Procesamiento de Webhooks

1. **Creación del Payment Intent**: el frontend en Next.js llama a `POST /api/pedidos/{numero_pedido}/pagos/` (ver contrato de API), que internamente solicita a Stripe la creación de un `PaymentIntent` por el monto exacto ya calculado y congelado en el servidor al crear el pedido — el frontend nunca envía ni recalcula montos.
2. **Procesamiento de pago**: el cliente final ingresa tarjetas de prueba estandarizadas de Stripe.
3. **Confirmación asíncrona (webhooks)**: Stripe notifica el evento `payment_intent.succeeded` hacia la API del backend, que actualiza `pagos.estado` a `aprobado` y transiciona `pedidos.estado` de `pendiente` a `pagado`, autorizando la liberación del movimiento de inventario reservado (de `reserva` a descuento definitivo de `stock`).

### 4.2. Tunelización Local con Stripe CLI

Dado que la aplicación se ejecuta localmente en `localhost`, los servidores de Stripe no pueden alcanzar endpoints locales directos (`http://127.0.0.1:8000/`). Durante la evaluación en vivo, se utiliza Stripe CLI para tunelizar los eventos webhook en tiempo real, garantizando la validación asíncrona de transacciones sin requerir despliegue en un servidor público o dominio de producción.


