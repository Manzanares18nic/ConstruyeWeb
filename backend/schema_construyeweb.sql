-- =====================================================================
-- ConstruyeWeb — Esquema PostgreSQL para Ferretería Construye  (v2.0)
-- Backend: Django (admin/POS)  |  Frontend: Next.js (e-commerce)
-- =====================================================================
-- Script COMPLETO: catálogo, inventario, e-commerce, compras, personal,
-- cajas y facturación unificada (venta física + e-commerce). 27 tablas.
--
-- Diseño basado en el export de inventario real (INVENTARIO_FERRETERIA_
-- CONSTRUYE.xlsx, 6,952 productos), pero NORMALIZADO: el Excel es un
-- reporte plano, no un modelo de datos.
--
-- Orden de secciones (respeta dependencias entre llaves foráneas):
--   1. Catálogo / maestros          6. Compras
--   2. Productos                    7. Cajas y turnos
--   3. Precios                      8. Facturación, pagos y caja
--   4. Parámetros y personal        9. Inventario y Kardex
--   5. Clientes y e-commerce       10. Vistas y triggers
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- búsqueda difusa (buscador Next.js y POS)
CREATE EXTENSION IF NOT EXISTS citext;    -- emails/códigos case-insensitive

-- =====================================================================
-- 1. CATÁLOGO / MAESTROS
-- =====================================================================

-- Categorías jerárquicas (Categoría > Subcategoría > Clase del Excel,
-- pero como árbol auto-referenciado, no 3 columnas fijas: así soporta
-- N niveles y no obliga a llenar los 3 si el producto no aplica).
CREATE TABLE categorias (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre          VARCHAR(150) NOT NULL,
    slug            VARCHAR(160) NOT NULL UNIQUE,          -- para URLs en Next.js
    categoria_padre_id BIGINT REFERENCES categorias(id) ON DELETE RESTRICT,
    nivel           SMALLINT NOT NULL DEFAULT 0,           -- 0=categoría,1=subcat,2=clase
    activo          BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (nombre, categoria_padre_id)
);
CREATE INDEX idx_categorias_padre ON categorias(categoria_padre_id);

CREATE TABLE marcas (
    id      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre  VARCHAR(120) NOT NULL UNIQUE,
    slug    VARCHAR(130) NOT NULL UNIQUE,
    logo_url TEXT
);

CREATE TABLE unidades_medida (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre       VARCHAR(60) NOT NULL UNIQUE,     -- UNIDAD, GALON, PAR, METRO...
    abreviatura  VARCHAR(15) NOT NULL,
    es_fraccionable BOOLEAN NOT NULL DEFAULT FALSE -- true para GALON/LITRO/METRO
);

CREATE TABLE proveedores (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(200) NOT NULL,
    codigo_fiscal VARCHAR(30),
    telefono      VARCHAR(30),
    email         CITEXT,
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE sucursales (
    id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre    VARCHAR(120) NOT NULL,        -- reemplaza el "PDV" del Excel
    direccion TEXT,
    telefono  VARCHAR(30),
    es_bodega_ecommerce BOOLEAN NOT NULL DEFAULT FALSE, -- desde cuál sucursal despacha Next.js
    activo    BOOLEAN NOT NULL DEFAULT TRUE
);

-- =====================================================================
-- 2. PRODUCTOS
-- =====================================================================

CREATE TYPE estado_producto AS ENUM ('activo', 'inactivo', 'descontinuado');

CREATE TABLE productos (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo_producto   VARCHAR(30) NOT NULL UNIQUE,   -- "Código Producto" del Excel
    codigo_fabricante VARCHAR(60),
    codigo_fiscal     VARCHAR(30),
    nombre            VARCHAR(250) NOT NULL,
    slug              VARCHAR(260) NOT NULL UNIQUE,
    descripcion       TEXT,
    marca_id          BIGINT NOT NULL REFERENCES marcas(id),
    categoria_id      BIGINT REFERENCES categorias(id),   -- nullable: aún hay 6945 "sin categoría"
    unidad_medida_id  BIGINT NOT NULL REFERENCES unidades_medida(id),
    proveedor_id      BIGINT REFERENCES proveedores(id),
    estado            estado_producto NOT NULL DEFAULT 'activo',
    stock_min         NUMERIC(12,2) DEFAULT 0,           -- punto de reorden; alimenta v_alerta_stock_bajo
    stock_max         NUMERIC(12,2),
    publicado_ecommerce BOOLEAN NOT NULL DEFAULT FALSE,  -- admin decide qué sube a Next.js
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_productos_marca ON productos(marca_id);
CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_estado ON productos(estado);
CREATE INDEX idx_productos_nombre_trgm ON productos USING GIN (nombre gin_trgm_ops);

-- Un producto puede tener varios códigos de barra (unidad, caja, pallet).
-- El Excel trae uno solo por fila; modelarlo 1:N es lo correcto.
CREATE TABLE producto_codigos_barra (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id  BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    codigo_barras VARCHAR(60) NOT NULL UNIQUE,
    presentacion  VARCHAR(40) DEFAULT 'unidad'   -- unidad/caja/pallet
);

CREATE TABLE producto_imagenes (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    url         TEXT NOT NULL,
    orden       SMALLINT NOT NULL DEFAULT 0,
    alt_text    VARCHAR(200)
);

-- =====================================================================
-- 3. PRECIOS (con historial — nunca sobrescribir precio en la misma fila)
-- =====================================================================

CREATE TABLE producto_precios (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id     BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    costo_promedio  NUMERIC(14,4) NOT NULL CHECK (costo_promedio >= 0),  -- se recalcula al recibir una compra
    precio_sin_iva  NUMERIC(14,4) NOT NULL CHECK (precio_sin_iva >= 0),
    porcentaje_iva  NUMERIC(5,2) NOT NULL DEFAULT 0,
    precio_con_iva  NUMERIC(14,4) GENERATED ALWAYS AS
                        (precio_sin_iva * (1 + porcentaje_iva / 100.0)) STORED,
    vigente_desde   TIMESTAMPTZ NOT NULL DEFAULT now(),
    vigente_hasta   TIMESTAMPTZ,               -- NULL = precio actual
    creado_por      VARCHAR(120)
);
-- Solo un precio vigente por producto a la vez
CREATE UNIQUE INDEX idx_precio_vigente_unico ON producto_precios(producto_id)
    WHERE vigente_hasta IS NULL;

-- Vista de conveniencia: precio actual por producto (Next.js y POS consultan esto)
CREATE VIEW v_precio_actual AS
    SELECT producto_id, costo_promedio, precio_sin_iva, porcentaje_iva, precio_con_iva
    FROM producto_precios
    WHERE vigente_hasta IS NULL;

-- =====================================================================
-- 4. PARÁMETROS Y PERSONAL
-- =====================================================================

-- Configuración global del negocio. Tabla de UNA sola fila (id = 1).
CREATE TABLE parametros (
    id                        SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    nombre_negocio            VARCHAR(150) NOT NULL DEFAULT 'Ferretería Construye',
    codigo_fiscal             VARCHAR(30),                 -- RUC del negocio
    direccion                 TEXT,
    telefono                  VARCHAR(30),
    moneda_base               CHAR(3) NOT NULL DEFAULT 'NIO',
    iva_porcentaje_default    NUMERIC(5,2) NOT NULL DEFAULT 15.00, -- solo sugerencia al crear precios; el IVA real sale de producto_precios
    monto_max_caja            NUMERIC(14,2) CHECK (monto_max_caja >= 0), -- NULL = sin límite; al superarlo, pedir retiro parcial
    stock_bajo_alerta_default NUMERIC(12,2) NOT NULL DEFAULT 5,          -- se usa si el producto no define stock_min
    updated_at                TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO parametros (id) VALUES (1);

-- Perfil de RR.HH. del personal. El login/contraseña/permisos los maneja
-- Django (auth_user + grupos); esta tabla se liga 1:1 al usuario de Django.
-- Restringir en Django Admin quién puede ver salario_base y bonos, y no
-- exponer esta tabla en la API que consume Next.js.
CREATE TABLE empleados (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    auth_user_id  BIGINT UNIQUE,                 -- FK a auth_user (se agrega más abajo)
    nombres       VARCHAR(100) NOT NULL,
    apellidos     VARCHAR(100) NOT NULL,
    cedula        VARCHAR(30)  NOT NULL UNIQUE,
    telefono      VARCHAR(30),
    email         CITEXT,
    direccion     TEXT,
    cargo         VARCHAR(80),                   -- informativo (Cajero, Bodeguero...); el acceso real = grupo Django
    sucursal_id   BIGINT REFERENCES sucursales(id),
    supervisor_id BIGINT REFERENCES empleados(id) ON DELETE SET NULL, -- jefe directo
    salario_base  NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (salario_base >= 0),
    bonos         NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (bonos >= 0),
    fecha_ingreso DATE NOT NULL DEFAULT CURRENT_DATE,
    activo        BOOLEAN NOT NULL DEFAULT TRUE, -- baja lógica: nunca borrar (facturas y movimientos lo referencian)
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_empleados_sucursal ON empleados(sucursal_id);

-- La FK a auth_user solo se crea si las migraciones de Django ya corrieron.
-- Si este script se ejecuta ANTES de las migraciones, agregar la FK después.
-- (Si usan un modelo de usuario personalizado, ajustar el nombre de tabla.)
DO $$
BEGIN
    IF to_regclass('public.auth_user') IS NOT NULL THEN
        ALTER TABLE empleados
            ADD CONSTRAINT fk_empleados_auth_user
            FOREIGN KEY (auth_user_id) REFERENCES auth_user(id) ON DELETE SET NULL;
    END IF;
END $$;

-- =====================================================================
-- 5. CLIENTES Y E-COMMERCE (consumido por Next.js y por el POS)
-- =====================================================================
-- Nota: Django ya trae auth_user para staff/admin. Estas tablas son para
-- clientes (web y mostrador), independientes del login de administración.

CREATE TYPE tipo_cliente AS ENUM ('persona', 'empresa');

CREATE TABLE clientes (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(150) NOT NULL,
    email         CITEXT UNIQUE,                 -- opcional: cliente de mostrador puede no tener correo
    telefono      VARCHAR(30),
    codigo_fiscal VARCHAR(30),                   -- RUC o Cédula para facturas y retenciones comerciales
    password_hash TEXT,                          -- NULL = cliente sin cuenta web (bcrypt/argon2 si la tiene)
    activo        BOOLEAN NOT NULL DEFAULT TRUE,
    tipo_cliente  tipo_cliente NOT NULL DEFAULT 'persona',
    origen        VARCHAR(20) NOT NULL DEFAULT 'ecommerce'
                      CHECK (origen IN ('ecommerce', 'pos')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- Si tiene contraseña (cuenta web), el email es obligatorio para el login
    CONSTRAINT chk_cliente_login_requiere_email
        CHECK (password_hash IS NULL OR email IS NOT NULL)
);
CREATE INDEX idx_clientes_codigo_fiscal ON clientes(codigo_fiscal);
CREATE INDEX idx_clientes_nombre_trgm ON clientes USING GIN (nombre gin_trgm_ops);

CREATE TABLE direcciones_cliente (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id   BIGINT NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
    alias        VARCHAR(60),
    direccion    TEXT NOT NULL,
    ciudad       VARCHAR(80),
    referencia   TEXT,
    predeterminada BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TYPE estado_pedido AS ENUM
    ('pendiente', 'pagado', 'en_preparacion', 'enviado', 'entregado', 'cancelado');

CREATE TABLE pedidos (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_pedido     VARCHAR(20) NOT NULL UNIQUE,   -- ej. CW-000123, legible para el cliente
    cliente_id        BIGINT NOT NULL REFERENCES clientes(id),
    sucursal_id       BIGINT NOT NULL REFERENCES sucursales(id),
    direccion_envio_id BIGINT REFERENCES direcciones_cliente(id),
    estado            estado_pedido NOT NULL DEFAULT 'pendiente',
    subtotal          NUMERIC(14,2) NOT NULL,
    iva_total         NUMERIC(14,2) NOT NULL,
    total             NUMERIC(14,2) NOT NULL,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_pedidos_cliente ON pedidos(cliente_id);
CREATE INDEX idx_pedidos_estado ON pedidos(estado);

-- Precio congelado al momento de compra: NUNCA hacer join a
-- producto_precios para mostrar el total de un pedido pasado.
CREATE TABLE pedido_items (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id       BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id     BIGINT NOT NULL REFERENCES productos(id),
    cantidad        NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
    precio_unitario_snapshot NUMERIC(14,4) NOT NULL,
    iva_unitario_snapshot    NUMERIC(14,4) NOT NULL,
    subtotal        NUMERIC(14,2) GENERATED ALWAYS AS
                        (cantidad * precio_unitario_snapshot) STORED
);

-- Carrito persistente (opcional pero profesional: sobrevive cierre de sesión)
CREATE TABLE carritos (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id  BIGINT REFERENCES clientes(id) ON DELETE CASCADE,  -- NULL = invitado
    session_id  VARCHAR(100),                                     -- para invitados
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE carrito_items (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    carrito_id  BIGINT NOT NULL REFERENCES carritos(id) ON DELETE CASCADE,
    producto_id BIGINT NOT NULL REFERENCES productos(id),
    cantidad    NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
    UNIQUE (carrito_id, producto_id)
);

-- =====================================================================
-- 6. COMPRAS A PROVEEDORES
-- =====================================================================
CREATE TYPE estado_compra AS ENUM ('pendiente', 'recibida', 'anulada');

CREATE TABLE compras (
    id                         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_compra              VARCHAR(20) NOT NULL UNIQUE,      -- ej. OC-000045
    proveedor_id               BIGINT NOT NULL REFERENCES proveedores(id),
    sucursal_id                BIGINT NOT NULL REFERENCES sucursales(id),  -- dónde ingresa la mercadería
    empleado_id                BIGINT NOT NULL REFERENCES empleados(id),   -- quién registró la compra
    numero_documento_proveedor VARCHAR(60),                      -- nº de factura del proveedor
    fecha                      DATE NOT NULL DEFAULT CURRENT_DATE,
    estado                     estado_compra NOT NULL DEFAULT 'pendiente',
    subtotal                   NUMERIC(14,2) NOT NULL DEFAULT 0,
    iva_total                  NUMERIC(14,2) NOT NULL DEFAULT 0,
    total                      NUMERIC(14,2) NOT NULL DEFAULT 0,
    observaciones              TEXT,
    created_at                 TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at                 TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_compras_proveedor ON compras(proveedor_id);
CREATE INDEX idx_compras_fecha ON compras(fecha);

CREATE TABLE compra_items (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    compra_id       BIGINT NOT NULL REFERENCES compras(id) ON DELETE CASCADE,
    producto_id     BIGINT NOT NULL REFERENCES productos(id),
    cantidad        NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
    costo_unitario  NUMERIC(14,4) NOT NULL CHECK (costo_unitario >= 0),  -- sin IVA
    porcentaje_iva  NUMERIC(5,2) NOT NULL DEFAULT 0,
    subtotal        NUMERIC(14,2) GENERATED ALWAYS AS (cantidad * costo_unitario) STORED,
    UNIQUE (compra_id, producto_id)
);
CREATE INDEX idx_compra_items_producto ON compra_items(producto_id);

-- Al marcar una compra como 'recibida' (en UNA transacción desde Django):
--   1) sumar inventario.stock de la sucursal
--   2) insertar movimientos_inventario tipo 'entrada' con compra_id
--   3) recalcular costo_promedio y crear nueva fila en producto_precios

-- =====================================================================
-- 7. CAJAS Y TURNOS
-- =====================================================================
-- cajas = terminal física de una sucursal.
-- sesiones_caja = turno de un cajero, de la apertura al arqueo de cierre.
CREATE TABLE cajas (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sucursal_id BIGINT NOT NULL REFERENCES sucursales(id),
    nombre      VARCHAR(60) NOT NULL,          -- "Caja 1", "Caja Mostrador"
    activa      BOOLEAN NOT NULL DEFAULT TRUE,
    UNIQUE (sucursal_id, nombre)
);

CREATE TYPE estado_sesion_caja AS ENUM ('abierta', 'cerrada');

CREATE TABLE sesiones_caja (
    id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    caja_id           BIGINT NOT NULL REFERENCES cajas(id),
    empleado_id       BIGINT NOT NULL REFERENCES empleados(id),
    monto_inicial     NUMERIC(14,2) NOT NULL CHECK (monto_inicial >= 0),
    fecha_apertura    TIMESTAMPTZ NOT NULL DEFAULT now(),
    fecha_cierre      TIMESTAMPTZ,
    -- Se llenan al cerrar (arqueo):
    efectivo_esperado NUMERIC(14,2),            -- monto_inicial + SUM(movimientos_caja.monto)
    monto_contado     NUMERIC(14,2),            -- lo que el cajero contó físicamente
    diferencia        NUMERIC(14,2) GENERATED ALWAYS AS (monto_contado - efectivo_esperado) STORED,
    estado            estado_sesion_caja NOT NULL DEFAULT 'abierta',
    observaciones     TEXT,
    CONSTRAINT chk_sesion_cierre CHECK (
        (estado = 'abierta' AND fecha_cierre IS NULL)
        OR (estado = 'cerrada' AND fecha_cierre IS NOT NULL AND monto_contado IS NOT NULL)
    )
);
-- Una caja solo puede tener un turno abierto, y un empleado solo uno a la vez
CREATE UNIQUE INDEX idx_sesion_abierta_por_caja
    ON sesiones_caja(caja_id) WHERE estado = 'abierta';
CREATE UNIQUE INDEX idx_sesion_abierta_por_empleado
    ON sesiones_caja(empleado_id) WHERE estado = 'abierta';

-- =====================================================================
-- 8. FACTURACIÓN UNIFICADA, PAGOS Y MOVIMIENTOS DE CAJA
-- =====================================================================
-- UNA sola tabla de facturas para las dos fuentes de ingreso:
--   canal 'pos'       -> venta física, requiere sesión de caja y cajero
--   canal 'ecommerce' -> nace de un pedido web (pedido_id)
-- Así reportes, IVA y utilidad salen de un único lugar.
CREATE TYPE canal_venta AS ENUM ('pos', 'ecommerce');
CREATE TYPE estado_factura AS ENUM ('emitida', 'anulada');

CREATE TABLE facturas (
    id                      BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    numero_factura          VARCHAR(30) NOT NULL UNIQUE,  -- consecutivo legal (confirmar formato/serie con contabilidad)
    canal                   canal_venta NOT NULL,
    fecha                   TIMESTAMPTZ NOT NULL DEFAULT now(),
    sucursal_id             BIGINT NOT NULL REFERENCES sucursales(id),
    empleado_id             BIGINT REFERENCES empleados(id),      -- cajero (POS)
    sesion_caja_id          BIGINT REFERENCES sesiones_caja(id),  -- solo POS
    pedido_id               BIGINT UNIQUE REFERENCES pedidos(id), -- solo e-commerce (1 pedido = 1 factura)
    cliente_id              BIGINT REFERENCES clientes(id),       -- NULL = consumidor final (solo POS)
    -- Datos fiscales congelados al emitir (si el cliente edita su perfil, la factura no cambia)
    cliente_nombre          VARCHAR(150),
    cliente_codigo_fiscal   VARCHAR(30),
    subtotal                NUMERIC(14,2) NOT NULL,               -- sin IVA, ya con descuentos
    descuento_total         NUMERIC(14,2) NOT NULL DEFAULT 0,     -- informativo
    iva_total               NUMERIC(14,2) NOT NULL,               -- suma de factura_items.impuesto
    total                   NUMERIC(14,2) NOT NULL,
    estado                  estado_factura NOT NULL DEFAULT 'emitida',
    anulada_at              TIMESTAMPTZ,
    anulada_por             BIGINT REFERENCES empleados(id),
    motivo_anulacion        TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_factura_canal CHECK (
        (canal = 'pos' AND sesion_caja_id IS NOT NULL AND empleado_id IS NOT NULL AND pedido_id IS NULL)
        OR
        (canal = 'ecommerce' AND pedido_id IS NOT NULL AND sesion_caja_id IS NULL AND cliente_id IS NOT NULL)
    ),
    CONSTRAINT chk_factura_anulacion CHECK (
        estado = 'emitida' OR (anulada_at IS NOT NULL AND motivo_anulacion IS NOT NULL)
    )
);
CREATE INDEX idx_facturas_fecha ON facturas(fecha);
CREATE INDEX idx_facturas_cliente ON facturas(cliente_id);
CREATE INDEX idx_facturas_sesion ON facturas(sesion_caja_id);
CREATE INDEX idx_facturas_sucursal_canal ON facturas(sucursal_id, canal);

CREATE TABLE factura_items (
    id                        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    factura_id                BIGINT NOT NULL REFERENCES facturas(id) ON DELETE CASCADE,
    producto_id               BIGINT NOT NULL REFERENCES productos(id),
    cantidad                  NUMERIC(12,2) NOT NULL CHECK (cantidad > 0),
    precio_unitario_snapshot  NUMERIC(14,4) NOT NULL CHECK (precio_unitario_snapshot >= 0), -- sin IVA
    costo_unitario_snapshot   NUMERIC(14,4) NOT NULL DEFAULT 0,   -- costo al vender: permite calcular utilidad real
    descuento                 NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (descuento >= 0),      -- monto por línea
    porcentaje_iva_snapshot   NUMERIC(5,2) NOT NULL DEFAULT 0,
    subtotal                  NUMERIC(14,2) GENERATED ALWAYS AS
                                  (cantidad * precio_unitario_snapshot - descuento) STORED,
    impuesto                  NUMERIC(14,2) GENERATED ALWAYS AS
                                  (ROUND((cantidad * precio_unitario_snapshot - descuento)
                                         * porcentaje_iva_snapshot / 100.0, 2)) STORED,
    CONSTRAINT chk_descuento_no_excede CHECK (descuento <= cantidad * precio_unitario_snapshot)
);
CREATE INDEX idx_factura_items_factura ON factura_items(factura_id);
CREATE INDEX idx_factura_items_producto ON factura_items(producto_id);

-- Pagos: sirven a pedidos web Y a facturas de mostrador. Una venta física
-- puede pagarse con varios métodos (mixto) => varias filas por factura.
-- "monto" es lo APLICADO a la deuda (no el billete entregado); el vuelto no se modela.
CREATE TABLE pagos (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id      BIGINT REFERENCES pedidos(id) ON DELETE CASCADE,  -- NULL en ventas de mostrador
    factura_id     BIGINT REFERENCES facturas(id),
    sesion_caja_id BIGINT REFERENCES sesiones_caja(id),              -- turno donde se recibió (POS)
    metodo_pago    VARCHAR(40) NOT NULL,   -- efectivo, tarjeta, transferencia, efectivo_contraentrega
    monto          NUMERIC(14,2) NOT NULL,
    estado         VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    referencia_transaccion VARCHAR(120),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT chk_pago_destino CHECK (num_nonnulls(pedido_id, factura_id) >= 1),
    CONSTRAINT chk_pago_monto   CHECK (monto > 0),
    CONSTRAINT chk_pago_metodo  CHECK (
        metodo_pago IN ('efectivo', 'tarjeta', 'transferencia', 'efectivo_contraentrega')
    )
);
CREATE INDEX idx_pagos_pedido ON pagos(pedido_id);
CREATE INDEX idx_pagos_factura ON pagos(factura_id);

-- Todo lo que entra o sale de la gaveta durante un turno. El arqueo al
-- cierre compara: monto_inicial + SUM(monto) vs. lo contado.
CREATE TYPE tipo_movimiento_caja AS ENUM
    ('venta_efectivo', 'devolucion_efectivo', 'ingreso_manual', 'egreso_manual', 'retiro_parcial');

CREATE TABLE movimientos_caja (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    sesion_caja_id BIGINT NOT NULL REFERENCES sesiones_caja(id),
    tipo           tipo_movimiento_caja NOT NULL,
    monto          NUMERIC(14,2) NOT NULL CHECK (monto <> 0),   -- positivo = entra a caja, negativo = sale
    factura_id     BIGINT REFERENCES facturas(id),
    pago_id        BIGINT REFERENCES pagos(id),
    descripcion    VARCHAR(250),
    empleado_id    BIGINT REFERENCES empleados(id),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_mov_caja_sesion ON movimientos_caja(sesion_caja_id, created_at);

-- =====================================================================
-- 9. INVENTARIO (por sucursal, con bitácora de movimientos)
-- =====================================================================

CREATE TABLE inventario (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id  BIGINT NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
    sucursal_id  BIGINT NOT NULL REFERENCES sucursales(id),
    stock        NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (stock >= 0),
    comprometido NUMERIC(14,2) NOT NULL DEFAULT 0 CHECK (comprometido >= 0),
    disponible   NUMERIC(14,2) GENERATED ALWAYS AS (stock - comprometido) STORED,
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (producto_id, sucursal_id),
    CHECK (comprometido <= stock)
);
CREATE INDEX idx_inventario_producto ON inventario(producto_id);

-- Bitácora: cada cambio de stock queda registrado (entrada, venta, ajuste,
-- reserva de carrito, liberación). "inventario" es el saldo cacheado;
-- esta tabla es la fuente de verdad auditable.
CREATE TYPE tipo_movimiento AS ENUM
    ('entrada', 'venta', 'ajuste', 'reserva', 'liberacion_reserva', 'devolucion');

CREATE TABLE movimientos_inventario (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id   BIGINT NOT NULL REFERENCES productos(id),
    sucursal_id   BIGINT NOT NULL REFERENCES sucursales(id),
    tipo          tipo_movimiento NOT NULL,
    cantidad      NUMERIC(14,2) NOT NULL,   -- positivo o negativo según tipo
    referencia    VARCHAR(80),              -- etiqueta legible, ej. numero_pedido
    usuario       VARCHAR(120),             -- operador textual o servicio automático (ej. webhook-stripe)
    -- Documento que originó el movimiento (integridad referencial real):
    compra_id     BIGINT REFERENCES compras(id),
    factura_id    BIGINT REFERENCES facturas(id),
    pedido_id     BIGINT REFERENCES pedidos(id),
    empleado_id   BIGINT REFERENCES empleados(id),  -- NULL si lo generó un servicio automático
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id, created_at);
CREATE INDEX idx_mov_inv_factura ON movimientos_inventario(factura_id);
CREATE INDEX idx_mov_inv_compra ON movimientos_inventario(compra_id);

-- =====================================================================
-- 10. VISTAS DE REPORTE
-- =====================================================================
-- Productos por debajo de su punto de reorden, por sucursal.
-- stock_min = 0 se interpreta como "no configurado" y usa el umbral global.
CREATE VIEW v_alerta_stock_bajo AS
SELECT p.id AS producto_id, p.codigo_producto, p.nombre,
       i.sucursal_id, i.stock, i.disponible,
       COALESCE(NULLIF(p.stock_min, 0),
                (SELECT stock_bajo_alerta_default FROM parametros WHERE id = 1)) AS umbral
FROM productos p
JOIN inventario i ON i.producto_id = p.id
WHERE p.estado = 'activo'
  AND i.stock <= COALESCE(NULLIF(p.stock_min, 0),
                          (SELECT stock_bajo_alerta_default FROM parametros WHERE id = 1));

-- Ventas por día, sucursal y canal (físico vs. web) en una sola consulta.
-- Se convierte a hora de Managua antes de truncar la fecha (UTC-6).
CREATE VIEW v_ventas_diarias AS
SELECT (fecha AT TIME ZONE 'America/Managua')::date AS dia,
       sucursal_id, canal,
       COUNT(*)   AS num_facturas,
       SUM(total) AS total_vendido
FROM facturas
WHERE estado = 'emitida'
GROUP BY 1, 2, 3;

-- =====================================================================
-- 11. TRIGGER genérico para updated_at
-- =====================================================================
CREATE OR REPLACE FUNCTION fn_set_updated_at() RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_productos_updated_at BEFORE UPDATE ON productos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_pedidos_updated_at BEFORE UPDATE ON pedidos
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_clientes_updated_at BEFORE UPDATE ON clientes
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_empleados_updated_at BEFORE UPDATE ON empleados
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_compras_updated_at BEFORE UPDATE ON compras
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
CREATE TRIGGER trg_parametros_updated_at BEFORE UPDATE ON parametros
    FOR EACH ROW EXECUTE FUNCTION fn_set_updated_at();
