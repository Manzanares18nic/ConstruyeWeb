'use client';

import React from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Download, ArrowUpRight } from 'lucide-react';

export default function PanelGeneralPage() {
  const { stockAlerts, purchaseOrders } = usePOS();

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <Header
        title="Panel general"
        subtitle="Jueves 24 de septiembre de 2026"
        badges={
          <Badge variant="green" dot>
            3 sesiones de caja abiertas
          </Badge>
        }
        actions={
          <button
            onClick={() => alert('Reporte consolidado del día exportado correctamente (PDF / Excel).')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Exportar reporte
          </button>
        }
      />

      {/* Top 4 KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Ventas de hoy */}
        <div className="p-6 rounded-3xl bg-gradient-to-br from-[#FF6A1A] to-[#FF8C38] text-white shadow-lg shadow-orange-500/20 flex flex-col justify-between">
          <p className="text-xs font-semibold opacity-90">Ventas de hoy</p>
          <div className="my-2">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight">
              C$ 148,930.40
            </h2>
          </div>
          <p className="text-xs font-bold text-white/90 flex items-center gap-1">
            <span>▲ 12.4% vs. ayer</span>
          </p>
        </div>

        {/* Card 2: Facturas emitidas */}
        <div className="p-6 rounded-3xl bg-white border border-[#F3ECE6] shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#64748B]">Facturas emitidas</p>
          <div className="my-2">
            <h2 className="text-2xl lg:text-3xl font-black text-[#1E293B] tracking-tight">
              96
            </h2>
          </div>
          <p className="text-xs font-medium text-[#64748B]">
            POS 71 · E-commerce 25
          </p>
        </div>

        {/* Card 3: Productos en alerta */}
        <div className="p-6 rounded-3xl bg-white border border-[#F3ECE6] shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#64748B]">Productos en alerta</p>
          <div className="my-2">
            <h2 className="text-2xl lg:text-3xl font-black text-[#FF6A1A] tracking-tight">
              37
            </h2>
          </div>
          <p className="text-xs font-medium text-[#64748B]">
            Bajo su punto de reorden
          </p>
        </div>

        {/* Card 4: Diferencia de caja */}
        <div className="p-6 rounded-3xl bg-white border border-[#F3ECE6] shadow-xs flex flex-col justify-between">
          <p className="text-xs font-semibold text-[#64748B]">Diferencia de caja</p>
          <div className="my-2">
            <h2 className="text-2xl lg:text-3xl font-black text-[#1E293B] tracking-tight">
              C$ -42.50
            </h2>
          </div>
          <p className="text-xs font-medium text-[#64748B]">
            2 turnos con faltante hoy
          </p>
        </div>
      </div>

      {/* Row 1 of Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Ventas por sucursal y canal (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#1E293B]">
              Ventas por sucursal y canal
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#8C9BAE] border-b border-slate-100 font-semibold">
                  <th className="pb-3">Sucursal</th>
                  <th className="pb-3">Canal</th>
                  <th className="pb-3 text-center">Facturas</th>
                  <th className="pb-3">Total vendido</th>
                  <th className="pb-3 w-32">Participación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                <tr className="hover:bg-[#FFF9F5]/60 transition-colors">
                  <td className="py-3.5 font-bold text-[#1E293B]">Managua Centro</td>
                  <td className="py-3.5">
                    <Badge variant="pos">POS</Badge>
                  </td>
                  <td className="py-3.5 text-center text-slate-700">41</td>
                  <td className="py-3.5 font-bold text-[#1E293B]">C$ 71,204.10</td>
                  <td className="py-3.5">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#FF6A1A] h-2 rounded-full w-[65%]" />
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-[#FFF9F5]/60 transition-colors">
                  <td className="py-3.5 font-bold text-[#1E293B]">Managua Centro</td>
                  <td className="py-3.5">
                    <Badge variant="ecommerce">E-commerce</Badge>
                  </td>
                  <td className="py-3.5 text-center text-slate-700">18</td>
                  <td className="py-3.5 font-bold text-[#1E293B]">C$ 39,860.00</td>
                  <td className="py-3.5">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#FF8C38] h-2 rounded-full w-[38%]" />
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-[#FFF9F5]/60 transition-colors">
                  <td className="py-3.5 font-bold text-[#1E293B]">Ciudad Sandino</td>
                  <td className="py-3.5">
                    <Badge variant="pos">POS</Badge>
                  </td>
                  <td className="py-3.5 text-center text-slate-700">22</td>
                  <td className="py-3.5 font-bold text-[#1E293B]">C$ 24,110.30</td>
                  <td className="py-3.5">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#FF6A1A] h-2 rounded-full w-[24%]" />
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-[#FFF9F5]/60 transition-colors">
                  <td className="py-3.5 font-bold text-[#1E293B]">Bodega e-commerce</td>
                  <td className="py-3.5">
                    <Badge variant="ecommerce">E-commerce</Badge>
                  </td>
                  <td className="py-3.5 text-center text-slate-700">7</td>
                  <td className="py-3.5 font-bold text-[#1E293B]">C$ 8,940.00</td>
                  <td className="py-3.5">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#FF8C38] h-2 rounded-full w-[10%]" />
                    </div>
                  </td>
                </tr>

                <tr className="hover:bg-[#FFF9F5]/60 transition-colors">
                  <td className="py-3.5 font-bold text-[#1E293B]">Sabana Grande</td>
                  <td className="py-3.5">
                    <Badge variant="pos">POS</Badge>
                  </td>
                  <td className="py-3.5 text-center text-slate-700">8</td>
                  <td className="py-3.5 font-bold text-[#1E293B]">C$ 4,816.00</td>
                  <td className="py-3.5">
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div className="bg-[#FF6A1A] h-2 rounded-full w-[5%]" />
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Sesiones de caja en curso (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#1E293B]">
              Sesiones de caja en curso
            </h3>
            <Link
              href="/caja"
              className="text-xs font-bold text-[#FF6A1A] hover:underline flex items-center gap-0.5"
            >
              Ver caja <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3.5">
            {/* Session 1 */}
            <div className="p-3.5 rounded-2xl bg-[#FFFBF7] border border-[#F7EFE8] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1E293B]">
                  Caja 1 · Managua Centro
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  María Alemán · abierta 07:58 a.m.
                </p>
              </div>
              <Badge variant="green">Abierta</Badge>
            </div>

            {/* Session 2 */}
            <div className="p-3.5 rounded-2xl bg-[#FFFBF7] border border-[#F7EFE8] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1E293B]">
                  Caja 2 · Managua Centro
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Carlos Vado · abierta 08:03 a.m.
                </p>
              </div>
              <Badge variant="green">Abierta</Badge>
            </div>

            {/* Session 3 */}
            <div className="p-3.5 rounded-2xl bg-[#FFFBF7] border border-[#F7EFE8] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1E293B]">
                  Caja Mostrador · Ciudad Sandino
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Efectivo: C$ 19,300 de C$ 20,000
                </p>
              </div>
              <Badge variant="amber">Cerca del tope</Badge>
            </div>

            {/* Session 4 */}
            <div className="p-3.5 rounded-2xl bg-[#FFFBF7] border border-[#F7EFE8] flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-[#1E293B]">
                  Caja 1 · Sabana Grande
                </h4>
                <p className="text-[11px] text-[#64748B] mt-0.5">
                  Cerrada 12:40 p.m. · diferencia -C$ 42.50
                </p>
              </div>
              <Badge variant="red">Faltante</Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 of Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Alertas de stock bajo (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#1E293B]">
              Alertas de stock bajo
            </h3>
            <Link
              href="/inventario/alertas"
              className="text-xs font-bold text-[#FF6A1A] hover:underline flex items-center gap-0.5"
            >
              Ver todas <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#8C9BAE] border-b border-slate-100 font-semibold">
                  <th className="pb-3">Producto</th>
                  <th className="pb-3">Sucursal</th>
                  <th className="pb-3 text-center">Disponible</th>
                  <th className="pb-3 text-center">Umbral</th>
                  <th className="pb-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {stockAlerts.slice(0, 5).map((alert) => (
                  <tr key={alert.id} className="hover:bg-[#FFF9F5]/60 transition-colors">
                    <td className="py-3">
                      <p className="font-bold text-[#1E293B] leading-tight line-clamp-1">
                        {alert.producto}
                      </p>
                      <span className="text-[10px] text-[#8C9BAE] font-mono">
                        {alert.codigo}
                      </span>
                    </td>
                    <td className="py-3 text-slate-600">{alert.sucursal}</td>
                    <td className="py-3 text-center font-bold text-[#1E293B]">
                      {formatNumber(alert.disponible)}
                    </td>
                    <td className="py-3 text-center text-slate-500">
                      {formatNumber(alert.umbral)}
                    </td>
                    <td className="py-3 text-right">
                      <Badge variant={alert.nivel === 'Crítico' ? 'red' : 'amber'}>
                        {alert.nivel}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Órdenes de compra pendientes (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-xs">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-black text-[#1E293B]">
              Órdenes de compra pendientes
            </h3>
            <Link
              href="/compras"
              className="text-xs font-bold text-[#FF6A1A] hover:underline flex items-center gap-0.5"
            >
              Ver órdenes <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="text-[#8C9BAE] border-b border-slate-100 font-semibold">
                  <th className="pb-3">Folio</th>
                  <th className="pb-3">Proveedor</th>
                  <th className="pb-3">Destino</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {purchaseOrders.slice(0, 4).map((po) => (
                  <tr key={po.folio} className="hover:bg-[#FFF9F5]/60 transition-colors">
                    <td className="py-3 font-bold text-[#1E293B] font-mono">
                      {po.folio}
                    </td>
                    <td className="py-3 text-slate-700 line-clamp-1">{po.proveedor}</td>
                    <td className="py-3 text-slate-600">{po.sucursalDestino}</td>
                    <td className="py-3 font-bold text-[#1E293B]">
                      {formatCurrency(po.total)}
                    </td>
                    <td className="py-3 text-right">
                      <Badge
                        variant={
                          po.estado === 'Pendiente'
                            ? 'amber'
                            : po.estado === 'Recibida'
                            ? 'green'
                            : 'red'
                        }
                      >
                        {po.estado}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
