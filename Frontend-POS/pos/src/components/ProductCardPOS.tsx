'use client';

import React from 'react';
import { ProductItem } from '@/types/pos';
import { formatCurrency } from '@/lib/utils';
import { Wrench, Zap, Layers, Paintbrush, Hammer } from 'lucide-react';

interface ProductCardPOSProps {
  product: ProductItem;
  isSelected?: boolean;
  onSelect: (product: ProductItem) => void;
}

export const ProductCardPOS: React.FC<ProductCardPOSProps> = ({
  product,
  isSelected,
  onSelect,
}) => {
  // Category icon helper
  const getIcon = () => {
    switch (product.categoriaSlug) {
      case 'herramientas-electricas':
        return <Zap className="w-8 h-8 text-[#FF8C38] opacity-60" />;
      case 'herramientas-manuales':
        return <Hammer className="w-8 h-8 text-[#FF8C38] opacity-60" />;
      case 'electrico':
        return <Zap className="w-8 h-8 text-[#FF8C38] opacity-60" />;
      case 'construccion':
        return <Layers className="w-8 h-8 text-[#FF8C38] opacity-60" />;
      case 'pintura':
        return <Paintbrush className="w-8 h-8 text-[#FF8C38] opacity-60" />;
      default:
        return <Wrench className="w-8 h-8 text-[#FF8C38] opacity-60" />;
    }
  };

  // Badge color based on stock
  const getStockBadgeClass = () => {
    if (product.stock <= 2) {
      return 'bg-[#FDECEB] text-[#E03B31]'; // red
    }
    if (product.stock <= 10 || product.esFraccionable) {
      return 'bg-[#FEF6E6] text-[#D98204]'; // amber
    }
    return 'bg-[#EAF8F0] text-[#1E9E60]'; // green
  };

  return (
    <div
      onClick={() => onSelect(product)}
      className={`relative bg-white rounded-3xl p-5 border transition-all duration-200 cursor-pointer flex flex-col justify-between hover:shadow-lg ${
        isSelected
          ? 'border-[#FF6A1A] ring-2 ring-[#FF6A1A]/30 shadow-md'
          : 'border-[#F3ECE6] hover:border-orange-200'
      }`}
    >
      {/* Product Image Placeholder Box */}
      <div className="w-full h-32 rounded-2xl bg-[#FDF0E2] flex items-center justify-center mb-4 overflow-hidden relative group">
        {getIcon()}
      </div>

      {/* Info */}
      <div className="space-y-1 mb-4 flex-1">
        <span className="text-[11px] font-mono text-[#8C9BAE] uppercase tracking-wider block">
          {product.codigo}
        </span>
        <h3 className="text-sm font-bold text-[#1E293B] leading-snug line-clamp-2">
          {product.nombre}
        </h3>
      </div>

      {/* Price & Stock Badge Row */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-base font-extrabold text-[#1E293B]">
          {formatCurrency(product.precioConIva)}
        </span>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold tracking-tight ${getStockBadgeClass()}`}
        >
          {product.esFraccionable
            ? `${product.stock.toFixed(1)} m`
            : `${product.stock} ${product.unidad === 'Unidad' ? 'und' : product.unidad.toLowerCase()}`}
        </span>
      </div>
    </div>
  );
};
