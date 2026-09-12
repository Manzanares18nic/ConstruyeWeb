'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ProductoResumen, ProductoDetalle } from '@/types/api';

export interface CartItem {
  id: number; // producto_id
  nombre: string;
  codigo_producto: string;
  precio_unitario: number; // Precio con IVA incluido
  cantidad: number;
  subtotal: number;
  imagen_principal?: string;
  slug: string;
  marca?: string;
}

interface CartContextType {
  items: CartItem[];
  isCartOpen: boolean;
  sessionId: string;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (producto: ProductoResumen | ProductoDetalle, cantidad?: number) => void;
  removeFromCart: (productoId: number) => void;
  updateQuantity: (productoId: number, cantidad: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalNeto: number;
  ivaTotal: number;
  total: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'construyeweb_cart_items';
const SESSION_STORAGE_KEY = 'construyeweb_session_id';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  // Inicializar carrito y session_id desde localStorage (cliente)
  useEffect(() => {
    try {
      // 1. Session ID para el contrato de API (invitado o cliente)
      let storedSession = localStorage.getItem(SESSION_STORAGE_KEY);
      if (!storedSession) {
        storedSession = `cw_sess_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem(SESSION_STORAGE_KEY, storedSession);
      }
      setSessionId(storedSession);

      // 2. Cargar ítems guardados del carrito
      const storedItems = localStorage.getItem(CART_STORAGE_KEY);
      if (storedItems) {
        setItems(JSON.parse(storedItems));
      }
    } catch (e) {
      console.error('Error al inicializar CartContext desde localStorage:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar en localStorage cuando cambien los ítems
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Error al persistir carrito:', e);
      }
    }
  }, [items, isLoaded]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = (
    producto: ProductoResumen | ProductoDetalle,
    cantidad: number = 1
  ) => {
    if (cantidad <= 0) return;

    // Normalizar precio según si viene de ProductoResumen o ProductoDetalle
    const precioUnitario =
      'precio_con_iva' in producto
        ? producto.precio_con_iva
        : producto.precio.precio_con_iva;

    const imagen =
      'imagen_principal' in producto
        ? producto.imagen_principal
        : producto.imagenes?.[0] || '';

    const marca =
      typeof producto.marca === 'string'
        ? producto.marca
        : producto.marca?.nombre || 'General';

    // Para slug en ProductoDetalle usamos su nombre normalizado si no viene directo
    const slug =
      'slug' in producto && typeof producto.slug === 'string'
        ? producto.slug
        : producto.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === producto.id);

      if (existingIndex > -1) {
        // Incrementar cantidad
        const updated = [...prevItems];
        const currentItem = updated[existingIndex];
        const newCantidad = currentItem.cantidad + cantidad;
        updated[existingIndex] = {
          ...currentItem,
          cantidad: newCantidad,
          subtotal: Number((newCantidad * precioUnitario).toFixed(2)),
        };
        return updated;
      }

      // Agregar nuevo ítem
      const newItem: CartItem = {
        id: producto.id,
        nombre: producto.nombre,
        codigo_producto: producto.codigo_producto,
        precio_unitario: precioUnitario,
        cantidad,
        subtotal: Number((cantidad * precioUnitario).toFixed(2)),
        imagen_principal: imagen,
        slug,
        marca,
      };

      return [...prevItems, newItem];
    });

    // Abrir automáticamente el drawer para confirmar que se agregó
    setIsCartOpen(true);
  };

  const removeFromCart = (productoId: number) => {
    setItems((prev) => prev.filter((item) => item.id !== productoId));
  };

  const updateQuantity = (productoId: number, cantidad: number) => {
    if (cantidad <= 0) {
      removeFromCart(productoId);
      return;
    }

    setItems((prev) =>
      prev.map((item) => {
        if (item.id === productoId) {
          return {
            ...item,
            cantidad,
            subtotal: Number((cantidad * item.precio_unitario).toFixed(2)),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(CART_STORAGE_KEY);
    } catch (e) {
      console.error(e);
    }
  };

  // Cálculos totales
  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const total = Number(
    items.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)
  );
  // En Nicaragua IVA es 15% incluido en el precio final
  const subtotalNeto = Number((total / 1.15).toFixed(2));
  const ivaTotal = Number((total - subtotalNeto).toFixed(2));

  return (
    <CartContext.Provider
      value={{
        items,
        isCartOpen,
        sessionId,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalNeto,
        ivaTotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart debe utilizarse dentro de un CartProvider');
  }
  return context;
}
