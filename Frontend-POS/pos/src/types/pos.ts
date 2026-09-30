export type UserRole = 'admin' | 'cajero' | 'bodeguero';

export interface StaffUser {
  id: string;
  nombre: string;
  cedula: string;
  cargo: string;
  sucursal: string;
  jefeDirecto: string;
  grupo: 'Administrador' | 'Cajero' | 'Bodeguero' | 'Sin grupo';
  estado: 'Activo' | 'Inactivo';
  role: UserRole;
  avatar: string;
  telefono: string;
  correo: string;
  fechaIngreso: string;
  usuario: string;
  salarioBase: number;
  bonosVigentes: number;
}

export interface BranchStock {
  sucursal: string;
  stock: number;
  comprometido: number;
  disponible: number;
}

export interface PriceHistory {
  vigenteDesde: string;
  hasta?: string;
  costoProm: number;
  precioSinIva: number;
  precioConIva: number;
}

export interface KardexMovement {
  fecha: string;
  tipo: 'Venta' | 'Reserva' | 'Entrada' | 'Ajuste';
  cantidad: number;
  documento: string;
  empleado: string;
  referencia: string;
}

export interface ProductItem {
  id: number;
  codigo: string;
  nombre: string;
  marca: string;
  categoria: string;
  categoriaSlug: string;
  unidad: string;
  esFraccionable?: boolean;
  precioSinIva: number;
  ivaPorcentaje: number;
  precioConIva: number;
  costoUnitario: number;
  stock: number;
  disponible: number;
  comprometido: number;
  estado: 'Activo' | 'Descontinuado';
  descripcion?: string;
  proveedorHabitual?: string;
  puntoReorden?: number;
  publicadoWeb?: boolean;
  codigoFiscal?: string;
  imagen?: string;
  sucursalesStock?: BranchStock[];
  historialPrecios?: PriceHistory[];
  kardex?: KardexMovement[];
}

export interface CartItem {
  producto: ProductItem;
  cantidad: number;
  subtotal: number;
}

export type PaymentMethodType = 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Cheque';

export interface PaymentEntry {
  id: string;
  metodo: PaymentMethodType;
  monto: number;
  referencia?: string;
}

export interface InvoiceLine {
  producto: string;
  codigo: string;
  cantidad: number;
  precioUnit: number;
  desc: number;
  ivaPorc: number;
  subtotal: number;
  costoUnit: number;
}

export interface Invoice {
  numero: string;
  fecha: string;
  hora: string;
  canal: 'POS' | 'E-commerce';
  cliente: string;
  clienteRuc?: string;
  sucursal: string;
  cajero: string;
  caja: string;
  total: number;
  subtotal: number;
  iva: number;
  descuento: number;
  estado: 'Emitida' | 'Anulada';
  lineas: InvoiceLine[];
  pagos: PaymentEntry[];
  sesionCaja?: string;
  utilidadEstimada?: number;
}

export interface ShiftMovement {
  id: string;
  hora: string;
  tipo: 'Venta' | 'Devolución' | 'Ingreso manual' | 'Egreso manual';
  referencia: string;
  monto: number;
}

export interface CashShift {
  id: string;
  turnoNumero: string;
  caja: string;
  sucursal: string;
  cajero: string;
  cajeroAvatar: string;
  fecha: string;
  horaApertura: string;
  horaCierre?: string;
  estado: 'Abierta' | 'Cerca del tope' | 'Faltante' | 'Cerrada';
  fondoInicial: number;
  ventasEfectivo: number;
  devoluciones: number;
  ingresosManuales: number;
  egresosManuales: number;
  efectivoEsperado: number;
  efectivoContado?: number;
  diferencia?: number;
  observaciones?: string;
  topeMaximo?: number;
  movimientos: ShiftMovement[];
}

export interface StockAlert {
  id: string;
  producto: string;
  codigo: string;
  sucursal: string;
  stock: number;
  disponible: number;
  umbral: number;
  faltante: number;
  proveedorSugerido: string;
  nivel: 'Crítico' | 'Bajo';
  accion: 'Agregar a OC' | 'Sin acción';
}

export interface POLine {
  producto: string;
  codigo: string;
  cantidad: number;
  costoUnitario: number;
  ivaPorc: number;
  subtotal: number;
}

export interface PurchaseOrder {
  folio: string;
  proveedor: string;
  sucursalDestino: string;
  fecha: string;
  registradaPor: string;
  total: number;
  subtotal: number;
  iva: number;
  unidades: number;
  estado: 'Pendiente' | 'Recibida' | 'Anulada';
  documentoProveedor?: string;
  lineas: POLine[];
}
