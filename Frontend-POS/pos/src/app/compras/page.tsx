'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  Truck,
  Plus,
  Search,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  ArrowRight,
  Filter,
} from 'lucide-react';
import { PurchaseOrder } from '@/types/pos';

export default function ComprasPage() {
  const { purchaseOrders, currentUser } = usePOS();

  const [activeTab, setActiveTab] = useState<'todas' | 'pendientes' | 'recibidas' | 'anuladas'>('todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('Todos');
  const [selectedBranch, setSelectedBranch] = useState('Todas');
  const [showNewPOModal, setShowNewPOModal] = useState(false);

  // New PO form state
  const [newSupplier, setNewSupplier] = useState('Distribuidora Industrial S.A.');
  const [newBranch, setNewBranch] = useState('Managua Centro');
  const [newTotal, setNewTotal] = useState(15000);
  const [newPOFolio, setNewPOFolio] = useState('');

  const countPendientes = purchaseOrders.filter((po) => po.estado === 'Pendiente').length;
  const countRecibidas = purchaseOrders.filter((po) => po.estado === 'Recibida').length;
  const countAnuladas = purchaseOrders.filter((po) => po.estado === 'Anulada').length;

  const filteredOrders = purchaseOrders.filter((po) => {
    // Search filter
    const matchesSearch =
      po.folio.toLowerCase().includes(searchQuery.toLowerCase()) ||
      po.proveedor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (po.documentoProveedor && po.documentoProveedor.toLowerCase().includes(searchQuery.toLowerCase())) ||
      po.registradaPor.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'pendientes' && po.estado !== 'Pendiente') return false;
    if (activeTab === 'recibidas' && po.estado !== 'Recibida') return false;
    if (activeTab === 'anuladas' && po.estado !== 'Anulada') return false;

    // Dropdown filters
    if (selectedSupplier !== 'Todos' && po.proveedor !== selectedSupplier) return false;
    if (selectedBranch !== 'Todas' && po.sucursalDestino !== selectedBranch) return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <Header
        title="Compras a proveedores"
        subtitle="Órdenes de compra y recepción de mercadería para abastecimiento"
        badges={
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            {countPendientes} órdenes pendientes de recibir
          </span>
        }
        actions={
          <button
            type="button"
            onClick={() => setShowNewPOModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            + Nueva orden de compra
          </button>
        }
      />

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#F3ECE6] pb-1 overflow-x-auto no-scrollbar">
        {[
          { id: 'todas', label: `Todas (${purchaseOrders.length})` },
          { id: 'pendientes', label: `Pendientes (${countPendientes})` },
          { id: 'recibidas', label: `Recibidas (${countRecibidas})` },
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

      {/* Filter Toolbar */}
      <div className="bg-white rounded-3xl p-5 border border-[#F3ECE6] shadow-2xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-[#94A3B8] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar folio (OC-...), proveedor o documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-medium text-[#1E293B] bg-slate-50/50"
            />
          </div>

          {/* Supplier dropdown */}
          <div className="md:col-span-4">
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-semibold text-[#1E293B] bg-white cursor-pointer"
            >
              <option value="Todos">Todos los proveedores</option>
              <option value="Distribuidora Industrial S.A.">Distribuidora Industrial S.A.</option>
              <option value="Holcim Nicaragua S.A.">Holcim Nicaragua S.A.</option>
              <option value="Ferretería Mayoreo Bosch">Ferretería Mayoreo Bosch</option>
              <option value="DeWalt Centroamérica">DeWalt Centroamérica</option>
            </select>
          </div>

          {/* Branch dropdown */}
          <div className="md:col-span-3">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none text-xs font-semibold text-[#1E293B] bg-white cursor-pointer"
            >
              <option value="Todas">Todas las sucursales</option>
              <option value="Managua Centro">Managua Centro</option>
              <option value="Ciudad Sandino">Ciudad Sandino</option>
              <option value="Sabana Grande">Sabana Grande</option>
            </select>
          </div>
        </div>

        <div className="text-xs text-[#64748B] flex items-center justify-between border-t border-[#F3ECE6] pt-2">
          <span>Mostrando <strong>{filteredOrders.length}</strong> órdenes</span>
          <span className="text-[11px] text-[#94A3B8]">Fechas: Últimos 30 días</span>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-[#F3ECE6] shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FAF8F5] border-b border-[#F3ECE6] text-[#64748B] font-bold">
                <th className="py-3.5 px-6">Folio</th>
                <th className="py-3.5 px-4">Proveedor</th>
                <th className="py-3.5 px-4">Sucursal destino</th>
                <th className="py-3.5 px-4">Fecha</th>
                <th className="py-3.5 px-4">Registrada por</th>
                <th className="py-3.5 px-4 text-right">Total (C$)</th>
                <th className="py-3.5 px-4 text-center">Estado</th>
                <th className="py-3.5 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3ECE6]">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-[#64748B] font-medium">
                    No se encontraron órdenes de compra para los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((po) => (
                  <tr key={po.folio} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <Link
                        href={`/compras/recepcion/${po.folio}`}
                        className="font-mono font-bold text-[#FF6A1A] hover:underline"
                      >
                        {po.folio}
                      </Link>
                      {po.documentoProveedor && (
                        <p className="font-mono text-[10px] text-[#94A3B8]">
                          Doc: {po.documentoProveedor}
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#1E293B]">
                      {po.proveedor}
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{po.sucursalDestino}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#94A3B8]" />
                        <span>{po.fecha}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B]">
                      {po.registradaPor}
                    </td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#1E293B]">
                      {formatCurrency(po.total)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <Badge
                        variant={
                          po.estado === 'Recibida'
                            ? 'success'
                            : po.estado === 'Pendiente'
                            ? 'warning'
                            : 'neutral'
                        }
                      >
                        {po.estado}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {po.estado === 'Pendiente' ? (
                          <Link
                            href={`/compras/recepcion/${po.folio}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] text-white font-bold text-xs shadow-2xs hover:from-[#E6560B] hover:to-[#EB7424] transition-all"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            Recibir
                          </Link>
                        ) : (
                          <Link
                            href={`/compras/recepcion/${po.folio}`}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] font-bold text-xs transition-colors"
                          >
                            Ver
                            <ArrowRight className="w-3 h-3 text-[#94A3B8]" />
                          </Link>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Nueva orden de compra */}
      {showNewPOModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 border border-[#F3ECE6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-[#1E293B]">Crear nueva orden de compra</h3>
            <p className="text-xs text-[#64748B]">
              Genera una orden para reabastecimiento de bodega y recepción física.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert(`Orden de compra preliminar creada para ${newSupplier} en ${newBranch}.`);
                setShowNewPOModal(false);
              }}
              className="space-y-4 pt-2 text-xs"
            >
              <div>
                <label className="block font-bold text-[#64748B] mb-1">Proveedor mayorista</label>
                <select
                  value={newSupplier}
                  onChange={(e) => setNewSupplier(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] font-semibold text-[#1E293B] bg-white cursor-pointer"
                >
                  <option value="Distribuidora Industrial S.A.">Distribuidora Industrial S.A.</option>
                  <option value="Holcim Nicaragua S.A.">Holcim Nicaragua S.A.</option>
                  <option value="Ferretería Mayoreo Bosch">Ferretería Mayoreo Bosch</option>
                  <option value="DeWalt Centroamérica">DeWalt Centroamérica</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Sucursal destino</label>
                  <select
                    value={newBranch}
                    onChange={(e) => setNewBranch(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] font-semibold text-[#1E293B] bg-white cursor-pointer"
                  >
                    <option value="Managua Centro">Managua Centro</option>
                    <option value="Ciudad Sandino">Ciudad Sandino</option>
                    <option value="Sabana Grande">Sabana Grande</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-[#64748B] mb-1">Monto estimado (C$)</label>
                  <input
                    type="number"
                    value={newTotal}
                    onChange={(e) => setNewTotal(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] font-bold text-[#1E293B]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">Responsable</label>
                <input
                  type="text"
                  disabled
                  value={`${currentUser.nombre} (${currentUser.cargo})`}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] bg-slate-50 font-semibold text-[#64748B]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowNewPOModal(false)}
                  className="px-4 py-2 rounded-xl font-bold text-[#64748B] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] text-white font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                >
                  Generar orden
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
