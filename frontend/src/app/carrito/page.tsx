'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Truck,
  Store,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CarritoPage() {
  const {
    items,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalItems,
    subtotalNeto,
    ivaTotal,
    total,
  } = useCart();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Migas de pan */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <Link href="/" className="hover:text-amber-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Catálogo</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Carrito de Compras</span>
      </nav>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Carrito de Compras
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Revisa y gestiona los artículos seleccionados antes de confirmar tu pedido.
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clearCart}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Vaciar Carrito
          </button>
        )}
      </div>

      {items.length === 0 ? (
        /* Estado vacío */
        <div className="my-16 py-16 px-4 text-center bg-white rounded-2xl border border-slate-200 max-w-xl mx-auto shadow-xs">
          <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-4">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            No tienes productos en tu carrito
          </h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Explora nuestro catálogo ferretero: herramientas manuales, eléctricas, tornillería y materiales de construcción con existencias en tiempo real.
          </p>
          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-xl text-sm transition-colors shadow-sm"
            >
              <span>Ir al Catálogo de Productos</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        /* Cuadrícula con Ítems y Resumen */
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Listado de Productos */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition-colors"
                >
                  {/* Foto y Nombre */}
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="relative w-20 h-20 bg-slate-100 rounded-lg border border-slate-200 overflow-hidden shrink-0">
                      {item.imagen_principal ? (
                        <Image
                          src={item.imagen_principal}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
                          Sin foto
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                        {item.marca}
                      </span>
                      <h3 className="text-sm sm:text-base font-semibold text-slate-900 truncate">
                        {item.nombre}
                      </h3>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">
                        Código: {item.codigo_producto}
                      </p>
                      <div className="text-xs text-slate-600 mt-1 sm:hidden">
                        C$ {item.precio_unitario.toFixed(2)} c/u
                      </div>
                    </div>
                  </div>

                  {/* Selector de cantidad y Subtotal */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    {/* Selector de Cantidad */}
                    <div className="flex items-center border border-slate-300 rounded-lg bg-white shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-l transition-colors"
                        aria-label="Disminuir cantidad"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 min-w-8 text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-r transition-colors"
                        aria-label="Aumentar cantidad"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Precios */}
                    <div className="text-right min-w-24">
                      <div className="text-base font-black text-slate-900">
                        C${' '}
                        {item.subtotal.toLocaleString('es-NI', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      <div className="hidden sm:block text-[11px] text-slate-500">
                        C$ {item.precio_unitario.toFixed(2)} c/u
                      </div>
                    </div>

                    {/* Botón Eliminar */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Quitar producto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Garantías y modalidades de entrega */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                <Store className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Retiro en Sucursal</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Listo en 2 horas en Sucursal Centro o Norte sin costo.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                <Truck className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Envío Ferretero</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Despacho ágil en Managua y departamentos.
                  </p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Garantía Directa</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Productos 100% originales con respaldo de fábrica.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tarjeta de Resumen y Checkout */}
          <div className="lg:col-span-4 sticky top-24">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
              <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
                Resumen del Pedido
              </h2>

              <div className="space-y-3 text-sm text-slate-600">
                <div className="flex justify-between">
                  <span>Artículos totales:</span>
                  <span className="font-semibold text-slate-900">
                    {totalItems} {totalItems === 1 ? 'unidad' : 'unidades'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Subtotal neto:</span>
                  <span className="font-mono text-slate-900">
                    C${' '}
                    {subtotalNeto.toLocaleString('es-NI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>IVA (15% ferretero):</span>
                  <span className="font-mono text-slate-900">
                    C${' '}
                    {ivaTotal.toLocaleString('es-NI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>

                <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                  <span className="text-base font-bold text-slate-900">Total a Pagar:</span>
                  <span className="text-2xl font-black text-slate-950 font-mono">
                    C${' '}
                    {total.toLocaleString('es-NI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>

              <div className="pt-2 space-y-3">
                <Link
                  href="/checkout"
                  className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors shadow-sm"
                >
                  <span>Continuar al Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/"
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center transition-colors"
                >
                  Seguir Comprando
                </Link>
              </div>

              <div className="pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400">
                  Transacción protegida con Stripe Test Mode y reserva atómica de inventario según contrato de API.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
