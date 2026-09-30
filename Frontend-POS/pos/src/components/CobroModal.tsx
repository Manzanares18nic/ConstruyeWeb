'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { PaymentEntry, PaymentMethodType } from '@/types/pos';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Plus } from 'lucide-react';

export const CobroModal: React.FC = () => {
  const router = useRouter();
  const { isCobroModalOpen, closeCobroModal, total, confirmSale } = usePOS();

  // Initial mixed payment matching 04_cobro_pago_mixto.png
  const [pagos, setPagos] = useState<PaymentEntry[]>([
    { id: '1', metodo: 'Efectivo', monto: 3000.0 },
    { id: '2', metodo: 'Tarjeta', monto: +(total - 3000.0).toFixed(2), referencia: 'POS-VISA-99231' },
  ]);

  const [efectivoRecibido, setEfectivoRecibido] = useState<number>(3000.0);
  const [showAddMethod, setShowAddMethod] = useState<boolean>(false);
  const [newMethod, setNewMethod] = useState<PaymentMethodType>('Transferencia');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newRef, setNewRef] = useState<string>('');

  // Update payments when total changes
  useEffect(() => {
    if (total > 0) {
      if (total >= 3000) {
        setPagos([
          { id: '1', metodo: 'Efectivo', monto: 3000.0 },
          { id: '2', metodo: 'Tarjeta', monto: +(total - 3000.0).toFixed(2), referencia: 'POS-VISA-99231' },
        ]);
        setEfectivoRecibido(3000.0);
      } else {
        setPagos([
          { id: '1', metodo: 'Efectivo', monto: total },
        ]);
        setEfectivoRecibido(total);
      }
    }
  }, [total]);

  if (!isCobroModalOpen) return null;

  const totalPagado = pagos.reduce((sum, p) => sum + p.monto, 0);
  const pagoEfectivo = pagos.find((p) => p.metodo === 'Efectivo')?.monto || 0;
  const vuelto = Math.max(0, +(efectivoRecibido - pagoEfectivo).toFixed(2));
  const pendiente = Math.max(0, +(total - totalPagado).toFixed(2));

  const handleRemovePayment = (id: string) => {
    setPagos((prev) => prev.filter((p) => p.id !== id));
  };

  const handleAddPayment = () => {
    const parsedAmount = parseFloat(newAmount) || pendiente;
    if (parsedAmount <= 0) return;

    const newEntry: PaymentEntry = {
      id: String(Date.now()),
      metodo: newMethod,
      monto: parsedAmount,
      referencia: newRef.trim() ? newRef : newMethod === 'Tarjeta' ? 'POS-VISA-99231' : undefined,
    };

    setPagos((prev) => [...prev, newEntry]);
    setShowAddMethod(false);
    setNewAmount('');
    setNewRef('');
  };

  const handleConfirm = () => {
    const createdInvoice = confirmSale(pagos, efectivoRecibido, vuelto);
    router.push(`/facturacion/${createdInvoice.numero}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] p-8 max-w-xl w-full shadow-2xl border border-[#F3ECE6] space-y-6 animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-[#1E293B] tracking-tight">
            Cobrar venta
          </h2>
          <span className="text-2xl font-black text-[#FF6A1A]">
            {formatCurrency(total)}
          </span>
        </div>

        {/* Payments List */}
        <div className="space-y-3">
          {pagos.map((pago) => (
            <div
              key={pago.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FFFBF7] border border-[#F7EFE8]"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    pago.metodo === 'Efectivo'
                      ? 'bg-[#EAF8F0] text-[#1E9E60]'
                      : pago.metodo === 'Tarjeta'
                      ? 'bg-[#FFF6D6] text-[#B87B00]'
                      : 'bg-blue-50 text-blue-600'
                  }`}
                >
                  {pago.metodo}
                </span>

                {pago.referencia && (
                  <span className="text-xs font-medium text-[#64748B]">
                    {pago.referencia}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm font-black text-[#1E293B]">
                  {formatCurrency(pago.monto)}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemovePayment(pago.id)}
                  className="text-xs font-bold text-[#E03B31] hover:underline cursor-pointer"
                >
                  Quitar
                </button>
              </div>
            </div>
          ))}

          {/* Add method button or form */}
          {showAddMethod ? (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Método
                  </label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as PaymentMethodType)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="Efectivo">Efectivo</option>
                    <option value="Tarjeta">Tarjeta</option>
                    <option value="Transferencia">Transferencia</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Monto (C$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={String(pendiente)}
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-600 block mb-1">
                  Referencia / Autorización (opcional)
                </label>
                <input
                  type="text"
                  placeholder="Ej. POS-VISA-99231"
                  value={newRef}
                  onChange={(e) => setNewRef(e.target.value)}
                  className="w-full text-xs p-2 rounded-xl border border-slate-300 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowAddMethod(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleAddPayment}
                  className="px-3 py-1.5 text-xs bg-[#FF6A1A] text-white font-bold rounded-lg"
                >
                  Agregar método
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setNewAmount(pendiente > 0 ? String(pendiente) : '');
                setShowAddMethod(true);
              }}
              className="px-4 py-2.5 rounded-2xl border border-dashed border-[#FF6A1A]/40 text-[#FF6A1A] text-xs font-bold hover:bg-[#FFF4EC] transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              + Agregar método de pago
            </button>
          )}
        </div>

        {/* Summary Boxes */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-[#FFF6D6] space-y-1">
            <span className="text-xs font-semibold text-[#855B00] block">
              Total a cobrar
            </span>
            <span className="text-xl font-black text-[#1E293B] block">
              {formatCurrency(total)}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#EAF8F0] space-y-1">
            <span className="text-xs font-semibold text-[#1E9E60] block">
              Pagado
            </span>
            <span className="text-xl font-black text-[#1E9E60] block">
              {formatCurrency(totalPagado)}
            </span>
          </div>
        </div>

        {/* Cash Given & Change Row */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
              Efectivo recibido
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">
                C$
              </span>
              <input
                type="number"
                step="0.01"
                value={efectivoRecibido}
                onChange={(e) => setEfectivoRecibido(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-4 py-2.5 rounded-2xl border border-[#E2E8F0] text-sm font-bold text-[#1E293B] focus:border-[#FF6A1A] focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
              Vuelto
            </label>
            <div className="w-full px-4 py-2.5 rounded-2xl border border-[#E2E8F0] bg-slate-50 text-sm font-bold text-[#1E293B]">
              {formatCurrency(vuelto)}
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={closeCobroModal}
            className="px-6 py-3 rounded-2xl border border-[#E2E8F0] text-sm font-bold text-[#64748B] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={totalPagado < total}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-sm font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Confirmar y emitir factura
          </button>
        </div>
      </div>
    </div>
  );
};
