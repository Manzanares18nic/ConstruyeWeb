'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { ProductCardPOS } from '@/components/ProductCardPOS';
import { CartTicket } from '@/components/CartTicket';
import { usePOS } from '@/context/POSContext';
import { ProductItem } from '@/types/pos';
import { Search } from 'lucide-react';

const CATEGORIES = [
  { id: 'todo', name: 'Todo' },
  { id: 'herramientas', name: 'Herramientas' },
  { id: 'electrico', name: 'Eléctrico' },
  { id: 'construccion', name: 'Construcción' },
  { id: 'pintura', name: 'Pintura' },
  { id: 'tornilleria', name: 'Tornillería' },
];

export default function PuntoDeVentaPage() {
  const { products, selectedProduct, setSelectedProduct, addToCart, currentShift } = usePOS();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('todo');

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.marca.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (selectedCategory === 'todo') return true;
    if (selectedCategory === 'herramientas') {
      return (
        p.categoriaSlug === 'herramientas-electricas' ||
        p.categoriaSlug === 'herramientas-manuales'
      );
    }
    return p.categoriaSlug === selectedCategory;
  });

  const handleSelectProduct = (product: ProductItem) => {
    setSelectedProduct(product);
    addToCart(product, 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <Header
        title="Punto de venta"
        subtitle="Nueva venta de mostrador"
        badges={
          <div className="flex items-center gap-2">
            <Badge variant="green" dot>
              Sesión abierta · {currentShift.horaApertura || '07:58 a.m.'}
            </Badge>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#F3ECE6] text-[#1E293B]">
              {currentShift.caja}
            </span>
          </div>
        }
      />

      {/* POS Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Search, Categories & Products Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-5 h-5 text-[#8C9BAE] absolute left-4 top-3.5" />
            <input
              type="text"
              placeholder="Buscar por nombre, código o escanear código de barras..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-white border border-[#F3ECE6] rounded-2xl text-sm font-medium text-[#1E293B] placeholder:text-[#8C9BAE] focus:outline-hidden focus:border-[#FF6A1A] focus:ring-1 focus:ring-[#FF6A1A] shadow-xs transition-all"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    isSelected
                      ? 'bg-[#FF6A1A] text-white shadow-sm shadow-orange-500/25'
                      : 'bg-[#FFF3E8]/70 text-[#78716C] hover:bg-[#FFE8D6]'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 pt-1">
            {filteredProducts.map((product) => (
              <ProductCardPOS
                key={product.codigo}
                product={product}
                isSelected={selectedProduct?.codigo === product.codigo}
                onSelect={handleSelectProduct}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-20 text-center bg-white rounded-3xl border border-[#F3ECE6]">
              <p className="text-sm font-bold text-[#64748B]">
                No se encontraron productos con "{searchQuery}"
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('todo');
                }}
                className="mt-2 text-xs text-[#FF6A1A] font-bold hover:underline"
              >
                Limpiar búsqueda
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Cart Ticket (4 cols) */}
        <div className="lg:col-span-4 sticky top-6">
          <CartTicket />
        </div>
      </div>
    </div>
  );
}
