'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CartDrawer() {
  const {
    items,
    isCartOpen,
    closeCart,
    updateQuantity,
    removeFromCart,
    totalItems,
    subtotalNeto,
    ivaTotal,
    total,
  } = useCart();

  // Cerrar al presionar la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isCartOpen) {
        closeCart();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCartOpen, closeCart]);

  // Bloquear scroll de fondo cuando el drawer esté abierto
  useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Fondo oscurecido con desenfoque */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
        aria-hidden="true"
      />

      {/* Contenedor del panel lateral */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out">
          
          {/* Encabezado del Carrito */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-900 text-white">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-400" />
              <h2 className="text-base font-bold tracking-wide">
                Tu Carrito ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Ítems o Estado Vacío */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    Tu carrito está vacío
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    Añade productos de ferretería, herramientas o materiales para iniciar tu pedido.
                  </p>
                </div>
                <button
                  onClick={closeCart}
                  className="mt-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-bold transition-colors"
                >
                  Explorar Catálogo
                </button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:border-slate-300 transition-colors"
                >
                  {/* Miniatura */}
                  <div className="relative w-18 h-18 bg-white rounded-lg border border-slate-200 overflow-hidden shrink-0">
                    {item.imagen_principal ? (
                      <Image
                        src={item.imagen_principal}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                        Sin foto
                      </div>
                    )}
                  </div>

                  {/* Detalles */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-1">
                        <span className="text-[10px] font-bold uppercase text-amber-600 tracking-wider">
                          {item.marca}
                        </span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">
                        {item.nombre}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-500">
                        {item.codigo_producto}
                      </p>
                    </div>

                    {/* Selector de Cantidad y Precio */}
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-200/60">
                      <div className="flex items-center border border-slate-300 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded-l transition-colors"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-slate-800">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded-r transition-colors"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-black text-slate-900">
                          C${' '}
                          {item.subtotal.toLocaleString('es-NI', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          C$ {item.precio_unitario.toFixed(2)} c/u
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pie del Carrito con Totales y Botón de Checkout */}
          {items.length > 0 && (
            <div className="p-4 sm:p-6 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Desglose de Precios */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal neto:</span>
                  <span className="font-mono">
                    C${' '}
                    {subtotalNeto.toLocaleString('es-NI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (15%):</span>
                  <span className="font-mono">
                    C${' '}
                    {ivaTotal.toLocaleString('es-NI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total con IVA:</span>
                  <span className="font-mono text-base text-slate-950">
                    C${' '}
                    {total.toLocaleString('es-NI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="space-y-2 pt-2">
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Proceder al Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/carrito"
                  onClick={closeCart}
                  className="w-full py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold rounded-xl text-xs flex items-center justify-center transition-colors"
                >
                  Ver carrito detallado
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
