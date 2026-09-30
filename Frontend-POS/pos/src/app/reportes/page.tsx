'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Calendar,
  CreditCard,
  ShoppingCart,
  Boxes,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
} from 'lucide-react';

export default function ReportesPage() {
  const { invoices, products, shifts } = usePOS();

  const [dateRange, setDateRange] = useState('Hoy');
  const [selectedBranch, setSelectedBranch] = useState('Todas');

  const totalVentas = invoices
    .filter((i) => i.estado === 'Emitida')
    .reduce((acc, i) => acc + i.total, 0);

  const ventasPOS = invoices
    .filter((i) => i.estado === 'Emitida' && i.canal === 'POS')
    .reduce((acc, i) => acc + i.total, 0);

  const ventasWeb = invoices
    .filter((i) => i.estado === 'Emitida' && i.canal === 'E-commerce')
    .reduce((acc, i) => acc + i.total, 0);

  const posPercentage = totalVentas > 0 ? ((ventasPOS / totalVentas) * 100).toFixed(0) : '0';
  const webPercentage = totalVentas > 0 ? ((ventasWeb / totalVentas) * 100).toFixed(0) : '0';

  const ticketPromedio = invoices.length > 0 ? +(totalVentas / invoices.length).toFixed(2) : 0;

  // Branch breakdowns
  const branches = [
    { name: 'Managua Centro', goal: 200000, current: 148520, percent: 74.2 },
    { name: 'Ciudad Sandino', goal: 120000, current: 78900, percent: 65.7 },
    { name: 'Sabana Grande', goal: 80000, current: 42100, percent: 52.6 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <Header
        title="Reportes y estadísticas"
        subtitle="Métricas operativas de facturación, desempeño por sucursal y rotación de stock"
        badges={
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6A1A] text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            Cierre consolidado al día
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => alert('Generando informe ejecutivo consolidado en formato PDF...')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E9E60]" />
            Descargar reporte PDF
          </button>
        }
      />

      {/* Date & Branch Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {['Hoy', 'Últimos 7 días', 'Este mes', 'Trimestre'].map((range) => (
            <button
              key={range}
              onClick={() => setDateRange(range)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                dateRange === range
                  ? 'bg-[#1E293B] text-white shadow-2xs'
                  : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Building2 className="w-4 h-4 text-[#94A3B8]" />
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3.5 py-2 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] text-xs font-semibold text-[#1E293B] bg-white cursor-pointer"
          >
            <option value="Todas">Todas las sucursales</option>
            <option value="Managua Centro">Managua Centro</option>
            <option value="Ciudad Sandino">Ciudad Sandino</option>
            <option value="Sabana Grande">Sabana Grande</option>
          </select>
        </div>
      </div>

      {/* 4 Top KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Ventas consolidadas</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF6A1A] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1E293B]">
            {formatCurrency(totalVentas)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#1E9E60] font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+14.8% vs período anterior</span>
          </div>
        </div>

        {/* Commercial Margin */}
        <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Margen bruto promedio</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-[#1E9E60] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1E293B]">
            34.2%
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#1E9E60] font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+2.1% sobre costo reposición</span>
          </div>
        </div>

        {/* Average Ticket */}
        <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Ticket promedio</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1E293B]">
            {formatCurrency(ticketPromedio)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#64748B] font-medium">
            <span>{invoices.length} transacciones registradas</span>
          </div>
        </div>

        {/* Inventory Turnover */}
        <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-[#64748B] text-xs font-bold">
            <span>Rotación inventario</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Boxes className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#1E293B]">
            4.8x / año
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[#1E9E60] font-bold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>Óptimo en ferretería pesada</span>
          </div>
        </div>
      </div>

      {/* 2-column Analysis Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Channels & Branch performance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Sales by Channel */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Distribución de ventas por canal
            </h2>

            <div className="space-y-4">
              {/* POS Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#1E293B]">POS Mostrador físico ({posPercentage}%)</span>
                  <span className="font-extrabold text-[#FF6A1A]">{formatCurrency(ventasPOS)}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] rounded-full"
                    style={{ width: `${posPercentage}%` }}
                  />
                </div>
              </div>

              {/* Web Bar */}
              <div>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-bold text-[#1E293B]">Tienda virtual E-commerce ({webPercentage}%)</span>
                  <span className="font-extrabold text-amber-600">{formatCurrency(ventasWeb)}</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 rounded-full"
                    style={{ width: `${webPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card: Desempeño por sucursal */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Cumplimiento de metas por sucursal
            </h2>

            <div className="space-y-4">
              {branches.map((b) => (
                <div key={b.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-[#1E293B]">{b.name}</span>
                    <span className="text-[#64748B]">
                      <strong className="text-[#1E293B]">{formatCurrency(b.current)}</strong> de {formatCurrency(b.goal)} ({b.percent}%)
                    </span>
                  </div>
                  <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        b.percent > 70
                          ? 'bg-[#1E9E60]'
                          : b.percent > 50
                          ? 'bg-[#FF6A1A]'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${b.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Top Products & Shifts summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Top productos más vendidos */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Productos líderes en ventas
            </h2>

            <div className="space-y-3">
              {products.slice(0, 4).map((p, idx) => (
                <div
                  key={p.codigo}
                  className="p-3 rounded-2xl border border-[#F3ECE6] bg-[#FAF8F5] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-[#1E293B] text-white font-black text-[11px] flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="font-bold text-[#1E293B] line-clamp-1">{p.nombre}</p>
                      <p className="text-[11px] text-[#64748B]">{p.categoria}</p>
                    </div>
                  </div>
                  <span className="font-extrabold text-[#FF6A1A] shrink-0">
                    {formatCurrency(p.precioConIva)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Control de arqueos de caja */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-3.5 text-xs">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Control de arqueos y sesiones
            </h2>

            <div className="space-y-2.5 text-[#64748B]">
              <div className="flex justify-between">
                <span>Sesiones activas:</span>
                <span className="font-bold text-[#1E9E60]">2 cajas abiertas</span>
              </div>
              <div className="flex justify-between">
                <span>Efectivo en custodia:</span>
                <span className="font-bold text-[#1E293B]">
                  {formatCurrency(shifts.reduce((acc, s) => acc + s.efectivoEsperado, 0))}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Diferencias acumuladas:</span>
                <span className="font-bold text-[#1E9E60]">C$ 0.00 (Sin faltantes)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
