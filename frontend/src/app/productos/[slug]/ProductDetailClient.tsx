'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShoppingCart,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Plus,
  Minus,
  ShieldCheck,
  Truck,
  Store,
  Check,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
} from 'lucide-react';
import { ProductoDetalle } from '@/types/api';
import { useCart } from '@/context/CartContext';

interface ProductDetailClientProps {
  producto: ProductoDetalle;
}

export default function ProductDetailClient({
  producto,
}: ProductDetailClientProps) {
  const { addToCart } = useCart();
  const [imagenSeleccionada, setImagenSeleccionada] = useState(0);
  const [cantidad, setCantidad] = useState(1);
  const [agregado, setAgregado] = useState(false);

  // Estados para lupa tipo Amazon
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomCoords, setZoomCoords] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
    setZoomCoords({ x, y });
  };

  const handleAgregar = () => {
    if (!producto.disponible) return;
    addToCart(producto, cantidad);
    setAgregado(true);
    setTimeout(() => setAgregado(false), 2000);
  };

  const imagenes =
    producto.imagenes && producto.imagenes.length > 0
      ? producto.imagenes
      : ['/file.svg'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Migas de pan */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <Link href="/" className="hover:text-amber-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Catálogo</span>
        </Link>
        <span>/</span>
        <Link
          href={`/?categoria=${producto.categoria.slug}`}
          className="hover:text-amber-600 transition-colors"
        >
          {producto.categoria.nombre}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate max-w-xs sm:max-w-md">
          {producto.nombre}
        </span>
      </nav>

      {/* Ficha principal */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-6 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Galería de imágenes con Lupa Tipo Amazon */}
        <div className="lg:col-span-6 space-y-4">
          <div
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => {
              setIsZoomed(false);
              setZoomCoords({ x: 50, y: 50 });
            }}
            onMouseMove={handleMouseMove}
            className="relative aspect-4/3 w-full bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden group cursor-crosshair select-none"
          >
            {imagenes[imagenSeleccionada] && (
              <div
                className="w-full h-full relative overflow-hidden transition-transform duration-100 ease-out"
                style={{
                  transform: isZoomed ? 'scale(2.25)' : 'scale(1)',
                  transformOrigin: `${zoomCoords.x}% ${zoomCoords.y}%`,
                }}
              >
                <Image
                  src={imagenes[imagenSeleccionada]}
                  alt={producto.nombre}
                  fill
                  priority
                  className="object-cover pointer-events-none"
                />
              </div>
            )}

            {/* Badge de Marca */}
            <span className="absolute top-3 left-3 bg-slate-900/90 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-md uppercase tracking-wider z-10 pointer-events-none shadow-xs">
              {producto.marca.nombre}
            </span>

            {/* Botones Prev / Next estilo Amazon/Ace Hardware */}
            {imagenes.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagenSeleccionada((prev) => (prev > 0 ? prev - 1 : imagenes.length - 1));
                  }}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md text-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagenSeleccionada((prev) => (prev < imagenes.length - 1 ? prev + 1 : 0));
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white shadow-md text-slate-800 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-10 cursor-pointer"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
          </div>

          {/* Indicador de Lupa tipo Amazon */}
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 font-medium">
            <ZoomIn className="w-4 h-4 text-amber-600" />
            <span>Pasa el cursor sobre la imagen para ampliar los detalles</span>
          </div>

          {/* Miniaturas */}
          {imagenes.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-1">
              {imagenes.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImagenSeleccionada(idx)}
                  className={`relative w-20 h-20 rounded-xl border-2 overflow-hidden transition-all shrink-0 cursor-pointer ${
                    imagenSeleccionada === idx
                      ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                      : 'border-slate-200 hover:border-slate-400 opacity-70 hover:opacity-100'
                  }`}
                >
                  <Image src={img} alt="" fill className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Información del Producto */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-slate-500 font-medium">
                Código: {producto.codigo_producto}
              </span>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1.5 ${
                  producto.disponible
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {producto.disponible ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>En stock ({producto.stock_disponible} disponibles)</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Agotado</span>
                  </>
                )}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight">
              {producto.nombre}
            </h1>

            {/* Precio */}
            <div className="pt-3 pb-4 border-y border-slate-100 space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight font-mono">
                  C${' '}
                  {producto.precio.precio_con_iva.toLocaleString('es-NI', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-xs text-slate-500 font-semibold">IVA incluido</span>
              </div>
              <p className="text-xs text-slate-500">
                Precio neto: C$ {producto.precio.precio_sin_iva.toFixed(2)} + 15% IVA
              </p>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Descripción del Producto
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {producto.descripcion}
              </p>
            </div>
          </div>

          {/* Acciones de compra */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              {/* Selector de Cantidad */}
              <div className="flex items-center justify-between border border-slate-300 rounded-xl bg-slate-50 px-3 py-2 sm:w-36">
                <button
                  onClick={() => setCantidad((prev) => Math.max(1, prev - 1))}
                  className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Disminuir"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm text-slate-900">{cantidad}</span>
                <button
                  onClick={() =>
                    setCantidad((prev) =>
                      producto.stock_disponible
                        ? Math.min(producto.stock_disponible, prev + 1)
                        : prev + 1
                    )
                  }
                  className="p-1 text-slate-600 hover:text-slate-900 transition-colors"
                  aria-label="Aumentar"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Botón Agregar al Carrito */}
              <button
                type="button"
                onClick={handleAgregar}
                disabled={!producto.disponible}
                className={`flex-1 py-3.5 px-6 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer ${
                  agregado
                    ? 'bg-emerald-600 text-white'
                    : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed'
                }`}
              >
                {agregado ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    <span>Agregar al Carrito</span>
                  </>
                )}
              </button>
            </div>

            {/* Garantías en la ficha */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Store className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Retiro en sucursal hoy</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Envío seguro en Nicaragua</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Garantía de fabricante</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
