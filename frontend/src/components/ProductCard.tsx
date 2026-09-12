import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, CheckCircle2, XCircle } from 'lucide-react';
import { ProductoResumen } from '@/types/api';

interface ProductCardProps {
  producto: ProductoResumen;
}

export default function ProductCard({ producto }: ProductCardProps) {
  return (
    <div className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-lg hover:border-amber-400 transition-all duration-200 flex flex-col">
      {/* Contenedor de Imagen */}
      <Link
        href={`/productos/${producto.slug}`}
        className="relative aspect-4/3 w-full bg-slate-100 overflow-hidden block"
      >
        {producto.imagen_principal ? (
          <Image
            src={producto.imagen_principal}
            alt={producto.nombre}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">
            Sin imagen
          </div>
        )}

        {/* Badge de Marca */}
        <span className="absolute top-2.5 left-2.5 bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider">
          {producto.marca}
        </span>

        {/* Badge de Disponibilidad */}
        <span
          className={`absolute top-2.5 right-2.5 text-[11px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
            producto.disponible
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-rose-100 text-rose-800'
          }`}
        >
          {producto.disponible ? (
            <>
              <CheckCircle2 className="w-3 h-3" /> En stock
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3" /> Agotado
            </>
          )}
        </span>
      </Link>

      {/* Información del Producto */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span>{producto.categoria}</span>
            <span className="font-mono text-[11px]">{producto.codigo_producto}</span>
          </div>

          <Link href={`/productos/${producto.slug}`}>
            <h3 className="font-semibold text-slate-900 group-hover:text-amber-600 transition-colors line-clamp-2 text-sm leading-snug">
              {producto.nombre}
            </h3>
          </Link>
        </div>

        {/* Precio y Botón de Acción */}
        <div className="pt-2 border-t border-slate-100 flex items-end justify-between gap-2">
          <div>
            <span className="block text-[11px] text-slate-500 font-medium">
              Precio con IVA
            </span>
            <div className="text-lg font-black text-slate-900 tracking-tight">
              C${' '}
              {producto.precio_con_iva.toLocaleString('es-NI', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </div>
          </div>

          <Link
            href={`/productos/${producto.slug}`}
            className="px-3 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs shrink-0"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Ver</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
