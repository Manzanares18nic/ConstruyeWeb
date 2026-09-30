'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function CierreDeCajaPage() {
  const { currentShift, closeShift } = usePOS();

  const [efectivoContado, setEfectivoContado] = useState<number>(
    currentShift.efectivoContado || 9937.5
  );
  const [observaciones, setObservaciones] = useState<string>(
    currentShift.observaciones ||
      'Posible error de vuelto en venta FAC-000345, se revisará con el cliente.'
  );
  const [isClosedSuccess, setIsClosedSuccess] = useState<boolean>(
    currentShift.estado === 'Cerrada'
  );

  const diferencia = +(efectivoContado - currentShift.efectivoEsperado).toFixed(2);

  const handleCerrarTurno = () => {
    closeShift(efectivoContado, observaciones);
    setIsClosedSuccess(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title="Cierre de caja"
        subtitle={`Turno de ${currentShift.cajero} · ${currentShift.fecha} · ${currentShift.caja}`}
        badges={
          <Badge
            variant={
              isClosedSuccess
                ? 'green'
                : currentShift.estado === 'Faltante'
                ? 'amber'
                : 'green'
            }
            dot
          >
            {isClosedSuccess
              ? `Turno ${currentShift.turnoNumero} cerrado`
              : `Cerrando turno ${currentShift.turnoNumero}`}
          </Badge>
        }
      />

      {isClosedSuccess && (
        <div className="p-4 rounded-2xl bg-[#EAF8F0] border border-[#1E9E60]/20 flex items-center gap-3 text-[#1E9E60] font-bold text-sm">
          <CheckCircle2 className="w-5 h-5" />
          <span>
            El turno {currentShift.turnoNumero} ha sido cerrado y arqueado satisfactoriamente. Los datos fueron registrados en contabilidad.
          </span>
        </div>
      )}

      {/* Two columns layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Movimientos del turno (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-xs space-y-4">
          <h3 className="text-base font-black text-[#1E293B]">
            Movimientos del turno
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#8C9BAE] border-b border-slate-100 font-semibold">
                  <th className="pb-3">Hora</th>
                  <th className="pb-3">Tipo</th>
                  <th className="pb-3">Referencia</th>
                  <th className="pb-3 text-right">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {currentShift.movimientos.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FFF9F5]/60 transition-colors">
                    <td className="py-3.5 text-slate-500">{m.hora}</td>
                    <td className="py-3.5">
                      <Badge
                        variant={
                          m.tipo === 'Venta'
                            ? 'green'
                            : m.tipo === 'Devolución' || m.tipo === 'Egreso manual'
                            ? 'red'
                            : 'amber'
                        }
                      >
                        {m.tipo}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-slate-700 font-medium">
                      {m.referencia}
                    </td>
                    <td
                      className={`py-3.5 text-right font-bold ${
                        m.monto >= 0 ? 'text-[#1E293B]' : 'text-[#E03B31]'
                      }`}
                    >
                      {m.monto >= 0 ? `+ ${formatNumber(m.monto)}` : `- ${formatNumber(Math.abs(m.monto))}`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column: Resumen y arqueo (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-xs space-y-5">
          <h3 className="text-base font-black text-[#1E293B]">
            Resumen y arqueo
          </h3>

          {/* Breakdown List */}
          <div className="space-y-2.5 text-xs text-[#64748B]">
            <div className="flex justify-between items-center">
              <span>Fondo inicial</span>
              <span className="font-bold text-[#1E293B]">
                {formatCurrency(currentShift.fondoInicial)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>+ Ventas en efectivo</span>
              <span className="font-bold text-[#1E293B]">
                {formatCurrency(currentShift.ventasEfectivo)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#E03B31]">
              <span>– Devoluciones</span>
              <span className="font-bold">
                – {formatCurrency(currentShift.devoluciones)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span>+ Ingresos manuales</span>
              <span className="font-bold text-[#1E293B]">
                {formatCurrency(currentShift.ingresosManuales)}
              </span>
            </div>
            <div className="flex justify-between items-center text-[#E03B31]">
              <span>– Egresos manuales</span>
              <span className="font-bold">
                – {formatCurrency(currentShift.egresosManuales)}
              </span>
            </div>
          </div>

          {/* Dashed line */}
          <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between items-baseline">
            <span className="text-sm font-black text-[#1E293B]">
              Efectivo esperado
            </span>
            <span className="text-xl font-black text-[#FF6A1A]">
              {formatCurrency(currentShift.efectivoEsperado)}
            </span>
          </div>

          {/* Efectivo contado input */}
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
              Efectivo contado
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 text-xs font-bold text-slate-400">
                C$
              </span>
              <input
                type="number"
                step="0.01"
                disabled={isClosedSuccess}
                value={efectivoContado}
                onChange={(e) => setEfectivoContado(parseFloat(e.target.value) || 0)}
                className="w-full pl-9 pr-4 py-3 rounded-2xl border border-[#E2E8F0] text-sm font-black text-[#1E293B] focus:border-[#FF6A1A] focus:outline-hidden disabled:bg-slate-50"
              />
            </div>
          </div>

          {/* Faltante / Sobrante / Cuadrado display */}
          {diferencia !== 0 ? (
            <div
              className={`p-4 rounded-2xl flex items-center justify-between ${
                diferencia < 0 ? 'bg-[#FDECEB] text-[#E03B31]' : 'bg-[#EAF8F0] text-[#1E9E60]'
              }`}
            >
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                <span className="text-xs font-bold">
                  {diferencia < 0 ? 'Faltante' : 'Sobrante'}
                </span>
              </div>
              <span className="text-sm font-black">
                {diferencia < 0 ? `- C$ ${formatNumber(Math.abs(diferencia))}` : `+ C$ ${formatNumber(diferencia)}`}
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-[#EAF8F0] text-[#1E9E60] flex items-center justify-between">
              <span className="text-xs font-bold">Caja cuadrada exacta</span>
              <span className="text-sm font-black">C$ 0.00</span>
            </div>
          )}

          {/* Observaciones textarea */}
          <div>
            <label className="text-xs font-semibold text-[#64748B] block mb-1.5">
              Observaciones
            </label>
            <textarea
              rows={3}
              disabled={isClosedSuccess}
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full p-3 rounded-2xl border border-[#E2E8F0] text-xs text-[#1E293B] focus:border-[#FF6A1A] focus:outline-hidden disabled:bg-slate-50 resize-none"
            />
          </div>

          {/* Action button */}
          <button
            onClick={handleCerrarTurno}
            disabled={isClosedSuccess}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-sm font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isClosedSuccess ? 'Turno Cerrado' : 'Cerrar turno'}
          </button>
        </div>
      </div>
    </div>
  );
}
