'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { usePOS } from '@/context/POSContext';
import { formatCurrency } from '@/lib/utils';
import {
  FileText,
  Search,
  Building2,
  Calendar,
  FileSpreadsheet,
  ArrowRight,
  TrendingUp,
  Receipt,
} from 'lucide-react';

export default function FacturacionPage() {
  const { invoices } = usePOS();

  const [activeTab, setActiveTab] = useState<'todas' | 'pos' | 'ecommerce' | 'anuladas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('Todas');

  const countEmitidas = invoices.filter((i) => i.estado === 'Emitida').length;
  const countAnuladas = invoices.filter((i) => i.estado === 'Anulada').length;
  const countPOS = invoices.filter((i) => i.canal === 'POS').length;
  const countEcommerce = invoices.filter((i) => i.canal === 'E-commerce').length;

  const totalFacturadoHoy = invoices
    .filter((i) => i.estado === 'Emitida')
    .reduce((acc, i) => acc + i.total, 0);

  const filteredInvoices = invoices.filter((inv) => {
    // Search
    const matchesSearch =
      inv.numero.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.cliente.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.clienteRuc && inv.clienteRuc.toLowerCase().includes(searchQuery.toLowerCase())) ||
      inv.cajero.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Tabs
    if (activeTab === 'pos' && inv.canal !== 'POS') return false;
    if (activeTab === 'ecommerce' && inv.canal !== 'E-commerce') return false;
    if (activeTab === 'anuladas' && inv.estado !== 'Anulada') return false;

    // Branch
    if (selectedBranch !== 'Todas' && inv.sucursal !== selectedBranch) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <Header
        title="Facturación"
        subtitle="Registro legal de ventas emitidas en punto de venta y tienda virtual"
        badges={
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-[#1E9E60] text-xs font-bold">
            <Receipt className="w-3.5 h-3.5" />
            {countEmitidas} facturas emitidas · {countAnuladas} anuladas
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => alert('Exportando registro contable de facturas a CSV fiscal...')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E9E60]" />
            Exportar CSV
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#F3ECE6] pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'todas', label: `Todas (${invoices.length})` },
          { id: 'pos', label: `POS mostrador (${countPOS})` },
          { id: 'ecommerce', label: `E-commerce (${countEcommerce})` },
          { id: 'anuladas', label: `Anuladas (${countAnuladas})` },
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive ? 'text-[#FF6A1A]' : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {tab.label}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6A1A] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por N.° factura (FAC-...), cliente, RUC o cajero..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-medium text-[#1E293B] bg-slate-50/50"
            />
          </div>

          {/* Branch dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-semibold text-[#1E293B] bg-white cursor-pointer"
            >
              <option value="Todas">Todas las sucursales</option>
              <option value="Managua Centro">Sucursal Managua Centro</option>
              <option value="Ciudad Sandino">Sucursal Ciudad Sandino</option>
              <option value="Sabana Grande">Sucursal Sabana Grande</option>
              <option value="Bodega e-commerce">Bodega e-commerce</option>
            </select>
          </div>

          {/* Summary stat */}
          <div className="md:col-span-2 flex items-center justify-end">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#94A3B8] block">
                Total filtrado
              </span>
              <span className="text-sm font-black text-[#1E293B]">
                {formatCurrency(totalFacturadoHoy)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#F3ECE6] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#F3ECE6] text-[#64748B] font-bold">
                <th className="py-3.5 px-6">N.° Factura</th>
                <th className="py-3.5 px-4">Canal</th>
                <th className="py-3.5 px-4">Cliente / RUC</th>
                <th className="py-3.5 px-4">Sucursal</th>
                <th className="py-3.5 px-4">Cajero / Origen</th>
                <th className="py-3.5 px-4 text-right">Total (C$)</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECE6]">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B] font-medium">
                    No se encontraron comprobantes fiscales que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.numero} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <Link
                        href={`/facturacion/${inv.numero}`}
                        className="font-mono font-bold text-[#FF6A1A] hover:underline"
                      >
                        {inv.numero}
                      </Link>
                      <p className="text-[11px] text-[#94A3B8]">
                        {inv.fecha} · {inv.hora}
                      </p>
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={inv.canal === 'POS' ? 'pos' : 'ecommerce'}>
                        {inv.canal}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#1E293B]">{inv.cliente}</p>
                      {inv.clienteRuc && (
                        <p className="font-mono text-[10px] text-[#94A3B8]">
                          RUC: {inv.clienteRuc}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{inv.sucursal}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {inv.cajero}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-[#1E293B]">
                      {formatCurrency(inv.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={inv.estado === 'Emitida' ? 'success' : 'danger'}>
                        {inv.estado}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <Link
                        href={`/facturacion/${inv.numero}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] font-bold text-xs transition-colors"
                      >
                        Ver detalle
                        <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
