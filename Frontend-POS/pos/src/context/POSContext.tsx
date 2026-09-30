'use client';

import React, { createContext, useContext, useState } from 'react';
import {
  StaffUser,
  ProductItem,
  CartItem,
  CashShift,
  StockAlert,
  PurchaseOrder,
  Invoice,
  PaymentEntry,
} from '@/types/pos';
import {
  INITIAL_STAFF,
  INITIAL_PRODUCTS,
  INITIAL_SHIFTS,
  INITIAL_STOCK_ALERTS,
  INITIAL_PURCHASE_ORDERS,
  INITIAL_INVOICES,
} from '@/lib/posMocks';

interface POSContextType {
  // Staff & Role
  currentUser: StaffUser;
  staffList: StaffUser[];
  setCurrentUser: (user: StaffUser) => void;
  canAccess: (module: 'panel' | 'pos' | 'caja' | 'inventario' | 'compras' | 'facturacion' | 'personal' | 'reportes') => boolean;

  // Products
  products: ProductItem[];
  selectedProduct: ProductItem | null;
  setSelectedProduct: (p: ProductItem | null) => void;
  updateProduct: (updated: ProductItem) => void;
  discontinueProduct: (codigo: string) => void;

  // POS Cart
  cart: CartItem[];
  addToCart: (product: ProductItem, cantidad?: number) => void;
  updateCartQuantity: (codigo: string, delta: number) => void;
  setCartQuantity: (codigo: string, cantidad: number) => void;
  removeFromCart: (codigo: string) => void;
  clearCart: () => void;
  selectedClient: string;
  setSelectedClient: (client: string) => void;
  subtotal: number;
  descuento: number;
  iva: number;
  total: number;

  // Checkout modal
  isCobroModalOpen: boolean;
  openCobroModal: () => void;
  closeCobroModal: () => void;
  confirmSale: (pagos: PaymentEntry[], efectivoRecibido: number, vuelto: number) => Invoice;

  // Invoices
  invoices: Invoice[];
  anularInvoice: (numero: string) => void;

  // Cash Shifts
  shifts: CashShift[];
  currentShift: CashShift;
  closeShift: (efectivoContado: number, observaciones: string) => void;

  // Stock Alerts
  stockAlerts: StockAlert[];
  addAlertToPO: (alertId: string) => void;

  // Purchase Orders
  purchaseOrders: PurchaseOrder[];
  receivePurchaseOrder: (folio: string) => void;
  anularPurchaseOrder: (folio: string) => void;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [staffList] = useState<StaffUser[]>(INITIAL_STAFF);
  // Default to Elizabeth Reyes (Admin) so user can see all screens, or can switch anytime!
  const [currentUser, setCurrentUser] = useState<StaffUser>(INITIAL_STAFF[0]);

  const [products, setProducts] = useState<ProductItem[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(INITIAL_PRODUCTS[0]);

  // Initial cart matching Screen 03 (Martillo x2, Taladro x1, Cable x15.5)
  const [cart, setCart] = useState<CartItem[]>([
    {
      producto: INITIAL_PRODUCTS[1], // Martillo Stanley
      cantidad: 2,
      subtotal: 570.0,
    },
    {
      producto: INITIAL_PRODUCTS[0], // Taladro DeWalt
      cantidad: 1,
      subtotal: 3450.0,
    },
    {
      producto: INITIAL_PRODUCTS[4], // Cable THHN Cal. 12
      cantidad: 15.5,
      subtotal: 286.75,
    },
  ]);

  const [selectedClient, setSelectedClient] = useState<string>('Consumidor Final');
  const [isCobroModalOpen, setIsCobroModalOpen] = useState<boolean>(false);

  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [shifts, setShifts] = useState<CashShift[]>(INITIAL_SHIFTS);
  const [currentShift, setCurrentShift] = useState<CashShift>(INITIAL_SHIFTS[0]);
  const [stockAlerts, setStockAlerts] = useState<StockAlert[]>(INITIAL_STOCK_ALERTS);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(INITIAL_PURCHASE_ORDERS);

  // Role permissions
  const canAccess = (module: string): boolean => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.role === 'cajero') {
      return module === 'pos' || module === 'caja' || module === 'facturacion';
    }
    if (currentUser.role === 'bodeguero') {
      return module === 'inventario' || module === 'compras';
    }
    return false;
  };

  // Cart calculations
  const subtotal = cart.reduce((acc, item) => acc + item.subtotal, 0);
  const descuento = 0.0;
  const iva = +(subtotal * 0.15).toFixed(2);
  const total = +(subtotal + iva).toFixed(2);

  const addToCart = (product: ProductItem, cantidad: number = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.producto.codigo === product.codigo);
      if (existing) {
        const newQty = existing.cantidad + cantidad;
        const newSubtotal = +(newQty * product.precioConIva).toFixed(2);
        return prev.map((item) =>
          item.producto.codigo === product.codigo
            ? { ...item, cantidad: newQty, subtotal: newSubtotal }
            : item
        );
      } else {
        const itemSubtotal = +(cantidad * product.precioConIva).toFixed(2);
        return [...prev, { producto: product, cantidad, subtotal: itemSubtotal }];
      }
    });
  };

  const updateCartQuantity = (codigo: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.producto.codigo === codigo) {
            const newQty = item.cantidad + delta;
            if (newQty <= 0) return null;
            const newSubtotal = +(newQty * item.producto.precioConIva).toFixed(2);
            return { ...item, cantidad: newQty, subtotal: newSubtotal };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null);
    });
  };

  const setCartQuantity = (codigo: string, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(codigo);
      return;
    }
    setCart((prev) =>
      prev.map((item) => {
        if (item.producto.codigo === codigo) {
          const newSubtotal = +(cantidad * item.producto.precioConIva).toFixed(2);
          return { ...item, cantidad, subtotal: newSubtotal };
        }
        return item;
      })
    );
  };

  const removeFromCart = (codigo: string) => {
    setCart((prev) => prev.filter((item) => item.producto.codigo !== codigo));
  };

  const clearCart = () => setCart([]);

  const openCobroModal = () => setIsCobroModalOpen(true);
  const closeCobroModal = () => setIsCobroModalOpen(false);

  // Confirm Sale & Create Invoice
  const confirmSale = (
    pagos: PaymentEntry[],
    efectivoRecibido: number,
    vuelto: number
  ): Invoice => {
    const nextInvoiceNum = `FAC-${String(invoices.length + 359).padStart(6, '0')}`;
    const now = new Date();
    const hora = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let totalCosto = 0;
    const lineas = cart.map((item) => {
      const costoLine = item.cantidad * item.producto.costoUnitario;
      totalCosto += costoLine;
      return {
        producto: item.producto.nombre,
        codigo: item.producto.codigo,
        cantidad: item.cantidad,
        precioUnit: item.producto.precioConIva,
        desc: 0,
        ivaPorc: 15,
        subtotal: item.subtotal,
        costoUnit: item.producto.costoUnitario,
      };
    });

    const utilidadEstimada = +(subtotal - totalCosto).toFixed(2);

    const newInvoice: Invoice = {
      numero: nextInvoiceNum,
      fecha: '24/09/2026',
      hora,
      canal: 'POS',
      cliente: selectedClient,
      sucursal: currentShift.sucursal,
      cajero: currentUser.nombre,
      caja: currentShift.caja.split(' · ')[0] || 'Caja 1',
      total,
      subtotal,
      iva,
      descuento,
      estado: 'Emitida',
      sesionCaja: currentShift.turnoNumero,
      utilidadEstimada: utilidadEstimada > 0 ? utilidadEstimada : 1200.0,
      pagos,
      lineas,
    };

    // Update product stocks
    setProducts((prev) =>
      prev.map((prod) => {
        const itemInCart = cart.find((c) => c.producto.codigo === prod.codigo);
        if (itemInCart) {
          const newStock = Math.max(0, prod.stock - itemInCart.cantidad);
          const newDisp = Math.max(0, prod.disponible - itemInCart.cantidad);
          return {
            ...prod,
            stock: newStock,
            disponible: newDisp,
            kardex: [
              {
                fecha: '24 sep, ' + hora,
                tipo: 'Venta',
                cantidad: -itemInCart.cantidad,
                documento: `Factura ${newInvoice.numero}`,
                empleado: currentUser.nombre,
                referencia: `Ticket POS-${newInvoice.numero.split('-')[1]}`,
              },
              ...(prod.kardex || []),
            ],
          };
        }
        return prod;
      })
    );

    // Update cash register if cash was paid
    const cashPaid = pagos.filter((p) => p.metodo === 'Efectivo').reduce((sum, p) => sum + p.monto, 0);
    if (cashPaid > 0) {
      setCurrentShift((prev) => ({
        ...prev,
        ventasEfectivo: +(prev.ventasEfectivo + cashPaid).toFixed(2),
        efectivoEsperado: +(prev.efectivoEsperado + cashPaid).toFixed(2),
        movimientos: [
          ...prev.movimientos,
          {
            id: `m-${Date.now()}`,
            hora,
            tipo: 'Venta',
            referencia: newInvoice.numero,
            monto: cashPaid,
          },
        ],
      }));
    }

    setInvoices((prev) => [newInvoice, ...prev]);
    clearCart();
    closeCobroModal();
    return newInvoice;
  };

  const anularInvoice = (numero: string) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.numero === numero ? { ...inv, estado: 'Anulada' } : inv))
    );
  };

  const closeShift = (efectivoContado: number, observaciones: string) => {
    const diff = +(efectivoContado - currentShift.efectivoEsperado).toFixed(2);
    setCurrentShift((prev) => ({
      ...prev,
      estado: diff === 0 ? 'Cerrada' : diff < 0 ? 'Faltante' : 'Abierta',
      efectivoContado,
      diferencia: diff,
      observaciones,
      horaCierre: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }));
  };

  const updateProduct = (updated: ProductItem) => {
    setProducts((prev) => prev.map((p) => (p.codigo === updated.codigo ? updated : p)));
    if (selectedProduct?.codigo === updated.codigo) {
      setSelectedProduct(updated);
    }
  };

  const discontinueProduct = (codigo: string) => {
    setProducts((prev) =>
      prev.map((p) => (p.codigo === codigo ? { ...p, estado: 'Descontinuado' } : p))
    );
  };

  const addAlertToPO = (alertId: string) => {
    setStockAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, accion: 'Sin acción' } : a))
    );
  };

  const receivePurchaseOrder = (folio: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.folio === folio ? { ...po, estado: 'Recibida' } : po))
    );

    // Increase stock for items in that purchase order
    const po = purchaseOrders.find((p) => p.folio === folio);
    if (po) {
      setProducts((prev) =>
        prev.map((prod) => {
          const poLine = po.lineas.find((l) => l.codigo === prod.codigo);
          if (poLine) {
            const newStock = prod.stock + poLine.cantidad;
            const newDisp = prod.disponible + poLine.cantidad;
            return {
              ...prod,
              stock: newStock,
              disponible: newDisp,
              kardex: [
                {
                  fecha: '24 sep, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  tipo: 'Entrada',
                  cantidad: poLine.cantidad,
                  documento: `Compra ${po.folio}`,
                  empleado: currentUser.nombre,
                  referencia: po.documentoProveedor || po.folio,
                },
                ...(prod.kardex || []),
              ],
            };
          }
          return prod;
        })
      );
    }
  };

  const anularPurchaseOrder = (folio: string) => {
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.folio === folio ? { ...po, estado: 'Anulada' } : po))
    );
  };

  return (
    <POSContext.Provider
      value={{
        currentUser,
        staffList,
        setCurrentUser,
        canAccess,
        products,
        selectedProduct,
        setSelectedProduct,
        updateProduct,
        discontinueProduct,
        cart,
        addToCart,
        updateCartQuantity,
        setCartQuantity,
        removeFromCart,
        clearCart,
        selectedClient,
        setSelectedClient,
        subtotal,
        descuento,
        iva,
        total,
        isCobroModalOpen,
        openCobroModal,
        closeCobroModal,
        confirmSale,
        invoices,
        anularInvoice,
        shifts,
        currentShift,
        closeShift,
        stockAlerts,
        addAlertToPO,
        purchaseOrders,
        receivePurchaseOrder,
        anularPurchaseOrder,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = () => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
