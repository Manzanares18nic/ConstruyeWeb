-- =====================================================================
-- ConstruyeWeb — Esquema PostgreSQL para Ferretería Construye
-- Backend: Django (admin/POS)  |  Frontend: Next.js (e-commerce)
-- =====================================================================
-- Diseño basado en el export de inventario real (INVENTARIO_FERRETERIA_
-- CONSTRUYE.xlsx, 6,952 productos), pero NORMALIZADO: el Excel es un
-- reporte plano, no un modelo de datos. Decisiones clave abajo del DDL.
-- =====================================================================

CREATE EXTENSION IF NOT EXISTS pg_trgm;   -- búsqueda difusa (Next.js buscador)
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
    stock_min         NUMERIC(12,2) DEFAULT 0,
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
    costo_promedio  NUMERIC(14,4) NOT NULL CHECK (costo_promedio >= 0),
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

-- Vista de conveniencia: precio actual por producto (Next.js consulta esto)
CREATE VIEW v_precio_actual AS
    SELECT producto_id, costo_promedio, precio_sin_iva, porcentaje_iva, precio_con_iva
    FROM producto_precios
    WHERE vigente_hasta IS NULL;

-- =====================================================================
-- 4. INVENTARIO (por sucursal, con bitácora de movimientos)
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
    referencia    VARCHAR(80),              -- ej. numero_pedido
    usuario       VARCHAR(120),             -- quién lo hizo (admin Django)
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_movimientos_producto ON movimientos_inventario(producto_id, created_at);

-- =====================================================================
-- 5. CLIENTES Y E-COMMERCE (consumido por Next.js)
-- =====================================================================
-- Nota: Django ya trae auth_user para staff/admin. Estas tablas son para
-- clientes del storefront, independientes del login de administración.

CREATE TABLE clientes (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR(150) NOT NULL,
    email       CITEXT NOT NULL UNIQUE,
    telefono    VARCHAR(30),
    password_hash TEXT NOT NULL,           -- o usar auth externo (NextAuth/JWT)
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

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

CREATE TABLE pagos (
    id             BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    pedido_id      BIGINT NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    metodo_pago    VARCHAR(40) NOT NULL,   -- tarjeta, transferencia, efectivo_contraentrega
    monto          NUMERIC(14,2) NOT NULL,
    estado         VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    referencia_transaccion VARCHAR(120),
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
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
-- 6. TRIGGER genérico para updated_at
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
