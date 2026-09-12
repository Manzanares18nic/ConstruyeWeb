/**
 * Tipos de datos de la API de ConstruyeWeb
 * Basados estrictamente en api_contract_construyeweb.md
 */

// ==========================================
// Formato de Error Estándar
// ==========================================
export interface ApiError {
  error: string;
  detalle?: string;
}

// ==========================================
// 1. Catálogo
// ==========================================

export interface Categoria {
  id: number;
  nombre: string;
  slug: string;
  nivel: number;
  hijas: Categoria[];
}

export interface Marca {
  id: number;
  nombre: string;
  slug: string;
  logo_url: string;
}

export interface ProductoResumen {
  id: number;
  codigo_producto: string;
  slug: string;
  nombre: string;
  marca: string;
  categoria: string;
  precio_con_iva: number;
  imagen_principal: string;
  disponible: boolean;
}

export interface ProductosPaginados {
  total: number;
  pagina: number;
  por_pagina: number;
  resultados: ProductoResumen[];
}

export interface PrecioDetalle {
  precio_sin_iva: number;
  porcentaje_iva: number;
  precio_con_iva: number;
}

export interface ProductoDetalle {
  id: number;
  codigo_producto: string;
  nombre: string;
  descripcion: string;
  marca: {
    id: number;
    nombre: string;
  };
  categoria: {
    id: number;
    nombre: string;
    slug: string;
  };
  precio: PrecioDetalle;
  imagenes: string[];
  disponible: boolean;
  stock_disponible: number;
}

export interface FiltrosProductos {
  categoria?: string;
  marca?: string;
  buscar?: string;
  pagina?: number;
  por_pagina?: number;
}

// ==========================================
// 2. Cuentas de Cliente y Autenticación
// ==========================================

export interface Cliente {
  id: number;
  nombre: string;
  email: string;
  telefono?: string;
  codigo_fiscal?: string;
}

export interface AuthResponse {
  token: string;
  cliente: Cliente;
}

export interface RegistroRequest {
  nombre: string;
  email: string;
  password: string;
  telefono?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface Direccion {
  id: number;
  alias: string;
  direccion: string;
  ciudad: string;
  referencia?: string;
  predeterminada: boolean;
}

export interface CrearDireccionRequest {
  alias: string;
  direccion: string;
  ciudad: string;
  referencia?: string;
  predeterminada?: boolean;
}

// ==========================================
// 3. Carrito
// ==========================================

export interface CarritoItem {
  id?: number;
  producto_id: number;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  imagen_principal?: string;
  slug?: string;
}

export interface Carrito {
  id: number;
  items: CarritoItem[];
  total: number;
}

export interface AgregarItemRequest {
  producto_id: number;
  cantidad: number;
}

export interface ActualizarItemRequest {
  cantidad: number;
}

// ==========================================
// 4. Pedidos y Pagos
// ==========================================

export type EstadoPedido =
  | 'pendiente'
  | 'en_preparacion'
  | 'pagado'
  | 'enviado'
  | 'entregado'
  | 'cancelado';

export interface CrearPedidoRequest {
  direccion_envio_id: number;
  sucursal_id: number;
}

export interface PedidoResumen {
  numero_pedido: string;
  estado: EstadoPedido;
  subtotal: number;
  iva_total: number;
  total: number;
}

export interface ItemPedidoDetalle {
  producto: string;
  cantidad: number;
  subtotal: number;
}

export interface PedidoDetalle {
  numero_pedido: string;
  estado: EstadoPedido;
  items: ItemPedidoDetalle[];
  total: number;
  creado: string;
}

export interface CrearPagoRequest {
  metodo_pago: 'tarjeta';
  referencia_transaccion: string;
}

export interface PagoResponse {
  id: number;
  estado: 'aprobado' | 'rechazado' | 'pendiente';
  monto: number;
}
