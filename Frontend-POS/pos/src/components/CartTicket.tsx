'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Plus, Minus, Trash2, User, ChevronDown, Check } from 'lucide-react';

const CLIENTS = [
  'Consumidor Final',
  'Constructora Vega y Asoc.',
  'Ferretería El Tanque (RUC J0310000123456)',
  'Empresas Hermanos Baltodano',
  'Ingeniería & Proyectos Managua',
];

export const CartTicket: React.FC = () => {
  const {
    cart,
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
    openCobroModal,
  } = usePOS();

  const [isClientMenuOpen, setIsClientMenuOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [tempQty, setTempQty] = useState<string>('');

  const handleStartEditQty = (codigo: string, currentQty: number) => {
    setEditingItem(codigo);
    setTempQty(String(currentQty));
  };

  const handleSaveQty = (codigo: string) => {
    const val = parseFloat(tempQty);
    if (!isNaN(val) && val > 0) {
      setCartQuantity(codigo, val);
    }
    setEditingItem(null);
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-sm flex flex-col justify-between h-full min-h-[640px]">
      <div>
        {/* Ticket Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#F3ECE6] mb-4">
          <h2 className="text-lg font-black text-[#1E293B] tracking-tight">
            Venta actual
          </h2>
          <button
            onClick={clearCart}
            disabled={cart.length === 0}
            className="text-xs font-semibold text-[#8C9BAE] hover:text-red-500 transition-colors disabled:opacity-40 cursor-pointer"
          >
            Ticket nuevo
          </button>
        </div>

        {/* Items List */}
        {cart.length === 0 ? (
          <div className="py-16 text-center text-[#94A3B8]">
            <p className="text-sm font-semibold">El carrito está vacío</p>
            <p className="text-xs mt-1">Haz clic en los productos para agregarlos al ticket</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-1">
            {cart.map((item) => {
              const isFractional = item.producto.esFraccionable;

              return (
                <div
                  key={item.producto.codigo}
                  className="group flex flex-col p-2.5 rounded-2xl hover:bg-[#FFF9F5] transition-colors border border-transparent hover:border-orange-100"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-[#1E293B] leading-tight">
                        {item.producto.nombre}
                      </h4>
                      {isFractional && (
                        <span className="text-[11px] text-[#64748B] block mt-0.5">
                          {item.cantidad} {item.producto.unidad.toLowerCase()}
                        </span>
                      )}
                    </div>

                    {/* Quantity Pill & Actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {editingItem === item.producto.codigo ? (
                        <div className="flex items-center gap-1">
                          <input
                            type="number"
                            step={isFractional ? '0.1' : '1'}
                            value={tempQty}
                            onChange={(e) => setTempQty(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveQty(item.producto.codigo);
                            }}
                            className="w-16 px-2 py-0.5 text-xs text-center border border-[#FF6A1A] rounded-lg font-bold"
                            autoFocus
                          />
                          <button
                            onClick={() => handleSaveQty(item.producto.codigo)}
                            className="p-1 bg-[#FF6A1A] text-white rounded-lg hover:bg-orange-600"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleStartEditQty(item.producto.codigo, item.cantidad)}
                          title="Haz clic para editar cantidad"
                          className="px-2.5 py-0.5 rounded-full bg-[#FFF3D6] text-[#A66C00] font-black text-xs hover:bg-[#FFE8B3] transition-colors"
                        >
                          × {formatNumber(item.cantidad, isFractional ? 1 : 0)}
                        </button>
                      )}

                      <span className="text-sm font-black text-[#1E293B] w-20 text-right">
                        {formatNumber(item.subtotal)}
                      </span>
                    </div>
                  </div>

                  {/* Quantity quick steppers (visible on hover or active) */}
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/60 opacity-80 group-hover:opacity-100 transition-opacity">
                    <span className="text-[11px] text-[#94A3B8]">
                      {formatCurrency(item.producto.precioConIva)} c/u
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => updateCartQuantity(item.producto.codigo, isFractional ? -0.5 : -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Disminuir"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => updateCartQuantity(item.producto.codigo, isFractional ? 0.5 : 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                        title="Aumentar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => removeFromCart(item.producto.codigo)}
                        className="w-6 h-6 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors cursor-pointer ml-1"
                        title="Eliminar del ticket"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Financial Breakdown & Checkout Button */}
      <div className="pt-4 border-t border-[#F3ECE6] space-y-3">
        <div className="space-y-1.5 text-xs text-[#64748B]">
          <div className="flex justify-between items-center font-medium">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span>Descuento</span>
            <span>{formatCurrency(descuento)}</span>
          </div>
          <div className="flex justify-between items-center font-medium">
            <span>IVA (15%)</span>
            <span>{formatCurrency(iva)}</span>
          </div>
        </div>

        {/* Dashed line */}
        <div className="border-t border-dashed border-slate-200 pt-2 flex justify-between items-baseline">
          <span className="text-base font-black text-[#1E293B]">Total</span>
          <span className="text-2xl font-black text-[#FF6A1A] tracking-tight">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Client selector box */}
        <div className="relative">
          <div
            onClick={() => setIsClientMenuOpen(!isClientMenuOpen)}
            className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF6D6] hover:bg-[#FFEFC0] cursor-pointer transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#855B00] font-semibold">Cliente:</span>
              <span className="text-xs font-black text-[#1E293B] line-clamp-1">
                {selectedClient}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-[#855B00] shrink-0" />
          </div>

          {isClientMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded-2xl shadow-xl border border-[#F3ECE6] z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
              <div className="px-2 py-1 text-[10px] font-bold text-[#94A3B8] uppercase">
                Seleccionar cliente:
              </div>
              <div className="space-y-1 mt-1 max-h-48 overflow-y-auto">
                {CLIENTS.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setSelectedClient(c);
                      setIsClientMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      selectedClient === c
                        ? 'bg-[#FFF4EC] text-[#FF6A1A] font-bold'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className="truncate">{c}</span>
                    {selectedClient === c && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#FF6A1A]" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button */}
        <button
          onClick={openCobroModal}
          disabled={cart.length === 0}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-base font-black shadow-lg shadow-orange-500/25 transition-all transform active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
        >
          Cobrar {formatCurrency(total)}
        </button>
      </div>
    </div>
  );
};
