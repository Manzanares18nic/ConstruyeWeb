'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { usePOS } from '@/context/POSContext';
import { formatNumber } from '@/lib/utils';
import {
  ArrowLeft,
  AlertTriangle,
  FileSpreadsheet,
  PlusCircle,
  Search,
  CheckCircle2,
  PackagePlus,
  Building2,
  ArrowUpDown,
} from 'lucide-react';

export default function AlertasStockPage() {
  const { stockAlerts, addAlertToPO } = usePOS();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('Todas');
  const [selectedLevel, setSelectedLevel] = useState('Todos');
  const [sortBy, setSortBy] = useState<'critico' | 'faltante' | 'proveedor'>('critico');
  const [notification, setNotification] = useState<string | null>(null);

  const filteredAlerts = stockAlerts
    .filter((alert) => {
      const matchesSearch =
        alert.producto.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        alert.proveedorSugerido.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (selectedBranch !== 'Todas' && alert.sucursal !== selectedBranch) return false;
      if (selectedLevel === 'Críticos' && alert.nivel !== 'Crítico') return false;
      if (selectedLevel === 'Bajo' && alert.nivel !== 'Bajo') return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'critico') {
        if (a.nivel === 'Crítico' && b.nivel !== 'Crítico') return -1;
        if (a.nivel !== 'Crítico' && b.nivel === 'Crítico') return 1;
        return a.disponible - b.disponible;
      }
      if (sortBy === 'faltante') {
        return b.faltante - a.faltante;
      }
      if (sortBy === 'proveedor') {
        return a.proveedorSugerido.localeCompare(b.proveedorSugerido);
      }
      return 0;
    });

  const handleGenerateAllPOs = () => {
    filteredAlerts.forEach((a) => {
      if (a.accion === 'Agregar a OC') {
        addAlertToPO(a.id);
      }
    });
    setNotification(
      'Se han agrupado y generado órdenes de compra sugeridas para los proveedores correspondientes.'
    );
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddSingle = (id: string, prodName: string) => {
    addAlertToPO(id);
    setNotification(`Producto "${prodName}" agregado a la orden de compra preliminar.`);
    setTimeout(() => setNotification(null), 3000);
  };

  const totalCriticos = stockAlerts.filter((a) => a.nivel === 'Crítico').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/inventario"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#FF6A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al catálogo de productos
        </Link>
      </div>

      {/* Header */}
      <Header
        title="Alertas de stock bajo"
        subtitle="Monitoreo de existencias bajo punto de reorden y reposición sugerida"
        badges={
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              {stockAlerts.length} productos en alerta ({totalCriticos} críticos)
            </span>
          </div>
        }
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => alert('Exportando informe de alertas de stock a formato CSV/Excel...')}
              className="flex items-center gap-2 px-3.5 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E9E60]" />
              Exportar reporte
            </button>
            <button
              type="button"
              onClick={handleGenerateAllPOs}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <PackagePlus className="w-3.5 h-3.5" />
              Generar órdenes sugeridas
            </button>
          </div>
        }
      />

      {notification && (
        <div className="flex items-center gap-2 p-4 bg-[#E8F8F0] border border-[#B6EAD0] rounded-2xl text-[#1E9E60] text-xs font-bold animate-in fade-in duration-200 shadow-2xs">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {notification}
        </div>
      )}

      {/* Filters Card */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar producto, código SKU o proveedor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-medium text-[#1E293B] bg-slate-50/50"
            />
          </div>

          {/* Sucursal filter */}
          <div className="md:col-span-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-semibold text-[#1E293B] bg-white cursor-pointer"
            >
              <option value="Todas">Todas las sucursales</option>
              <option value="Managua Centro">Sucursal Managua Centro</option>
              <option value="Ciudad Sandino">Sucursal Ciudad Sandino</option>
              <option value="Sabana Grande">Sucursal Sabana Grande</option>
            </select>
          </div>

          {/* Nivel pill buttons */}
          <div className="md:col-span-4 flex items-center gap-1.5">
            {['Todos', 'Críticos', 'Bajo'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                  selectedLevel === lvl
                    ? 'bg-[#1E293B] text-white shadow-2xs'
                    : 'bg-slate-100 text-[#64748B] hover:bg-slate-200 hover:text-[#1E293B]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Sort selector */}
        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F3ECE6]">
          <span className="text-[#64748B] font-medium">
            Mostrando <strong>{filteredAlerts.length}</strong> productos en alerta
          </span>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#64748B]">Ordenar:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="border-none bg-transparent font-bold text-[#FF6A1A] focus:outline-none cursor-pointer text-xs"
            >
              <option value="critico">Más crítico primero</option>
              <option value="faltante">Mayor faltante</option>
              <option value="proveedor">Proveedor sugerido</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-[#F3ECE6] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#F3ECE6] text-[#64748B] font-bold">
                <th className="py-3.5 px-6">Producto y código</th>
                <th className="py-3.5 px-4">Sucursal</th>
                <th className="py-3.5 px-3 text-center">Físico</th>
                <th className="py-3.5 px-3 text-center">Disponible</th>
                <th className="py-3.5 px-3 text-center">Umbral mín.</th>
                <th className="py-3.5 px-3 text-center">Faltante</th>
                <th className="py-3.5 px-4">Proveedor sugerido</th>
                <th className="py-3.5 px-4 text-center">Nivel</th>
                <th className="py-3.5 px-6 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECE6]">
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748B] font-medium">
                    No hay productos en alerta que coincidan con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert) => (
                  <tr key={alert.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <Link
                        href={`/inventario/${alert.codigo}`}
                        className="font-bold text-[#1E293B] hover:text-[#FF6A1A] block transition-colors"
                      >
                        {alert.producto}
                      </Link>
                      <span className="font-mono text-[11px] text-[#94A3B8]">
                        {alert.codigo}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{alert.sucursal}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-semibold text-[#1E293B]">
                      {formatNumber(alert.stock)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-bold">
                      <span className={alert.disponible === 0 ? 'text-rose-600' : 'text-amber-600'}>
                        {formatNumber(alert.disponible)}
                      </span>
                    </td>
                    <td className="py-3.5 px-3 text-center text-[#64748B] font-medium">
                      {formatNumber(alert.umbral)}
                    </td>
                    <td className="py-3.5 px-3 text-center font-extrabold text-[#FF6A1A]">
                      +{formatNumber(alert.faltante)}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-[#1E293B]">
                      {alert.proveedorSugerido}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge variant={alert.nivel === 'Crítico' ? 'danger' : 'warning'}>
                        {alert.nivel}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      {alert.accion === 'Agregar a OC' ? (
                        <button
                          type="button"
                          onClick={() => handleAddSingle(alert.id, alert.producto)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6A1A] hover:bg-[#FF6A1A] hover:text-white transition-all font-bold text-xs cursor-pointer shadow-2xs"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Agregar a OC
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1E9E60] bg-[#E8F8F0] px-2.5 py-1 rounded-xl">
                          <CheckCircle2 className="w-3 h-3" />
                          En orden
                        </span>
                      )}
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
