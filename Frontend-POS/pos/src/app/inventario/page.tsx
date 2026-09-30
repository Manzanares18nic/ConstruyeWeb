'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Badge } from '@/components/Badge';
import { usePOS } from '@/context/POSContext';
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Search, Plus, FileSpreadsheet, AlertTriangle, ArrowRight } from 'lucide-react';

const TABS = [
  { id: 'todos', name: 'Todos (6,952)' },
  { id: 'sin-categoria', name: 'Sin categoría (6,945)' },
  { id: 'activos', name: 'Activos' },
  { id: 'descontinuados', name: 'Descontinuados' },
  { id: 'web', name: 'Publicados en tienda web' },
];

export default function InventarioPage() {
  const { products } = usePOS();

  const [activeTab, setActiveTab] = useState('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('Managua Centro');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');

  const filteredProducts = products.filter((p) => {
    // Search filter
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.marca.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Tab filter
    if (activeTab === 'activos' && p.estado !== 'Activo') return false;
    if (activeTab === 'descontinuados' && p.estado !== 'Descontinuado') return false;
    if (activeTab === 'web' && !p.publicadoWeb) return false;

    // Dropdown filters
    if (selectedCategory && p.categoria !== selectedCategory) return false;
    if (selectedBrand && p.marca !== selectedBrand) return false;

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Header
        title="Catálogo de productos"
        subtitle="Existencias por sucursal"
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/inventario/alertas"
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold hover:bg-amber-100 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Alertas de stock bajo
            </Link>
            <button
              onClick={() => alert('Función de importación masiva desde archivo Excel / CSV.')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-[#1E9E60]" />
              Importar Excel
            </button>
            <button
              onClick={() => alert('Formulario para registrar un nuevo producto en catálogo y definir punto de reorden.')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              + Nuevo producto
            </button>
          </div>
        }
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-6 border-b border-[#F3ECE6] pb-1 overflow-x-auto no-scrollbar">
        {TABS.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-bold transition-all relative whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'text-[#FF6A1A]'
                  : 'text-[#64748B] hover:text-[#1E293B]'
              }`}
            >
              {tab.name}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6A1A] rounded-full" />
              )}
            </button>
          );
        })}
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#8C9BAE] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="esmeril, taladro dewalt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#F3ECE6] rounded-2xl text-xs font-medium text-[#1E293B] focus:outline-hidden focus:border-[#FF6A1A]"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-[#F3ECE6] rounded-2xl text-xs font-bold text-[#1E293B] focus:outline-hidden focus:border-[#FF6A1A]"
          >
            <option value="Managua Centro">Sucursal: Managua Centro ▼</option>
            <option value="Ciudad Sandino">Sucursal: Ciudad Sandino ▼</option>
            <option value="Sabana Grande">Sucursal: Sabana Grande ▼</option>
            <option value="Todas">Todas las sucursales ▼</option>
          </select>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-[#F3ECE6] rounded-2xl text-xs font-bold text-[#1E293B] focus:outline-hidden focus:border-[#FF6A1A]"
          >
            <option value="">Categoría ▼</option>
            <option value="Herramientas eléctricas">Herramientas eléctricas</option>
            <option value="Herramientas manuales">Herramientas manuales</option>
            <option value="Eléctrico">Eléctrico</option>
            <option value="Construcción">Construcción</option>
            <option value="Tornillería y Fijación">Tornillería y Fijación</option>
            <option value="Pintura">Pintura</option>
          </select>

          <select
            value={selectedBrand}
            onChange={(e) => setSelectedBrand(e.target.value)}
            className="px-3.5 py-2.5 bg-white border border-[#F3ECE6] rounded-2xl text-xs font-bold text-[#1E293B] focus:outline-hidden focus:border-[#FF6A1A]"
          >
            <option value="">Marca ▼</option>
            <option value="DeWalt">DeWalt</option>
            <option value="Stanley">Stanley</option>
            <option value="Bosch">Bosch</option>
            <option value="Truper">Truper</option>
            <option value="Holcim">Holcim</option>
            <option value="Centelsa">Centelsa</option>
            <option value="Sherwin Williams">Sherwin Williams</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="text-[#8C9BAE] border-b border-slate-100 font-semibold">
                <th className="pb-3 w-28">Código</th>
                <th className="pb-3">Producto</th>
                <th className="pb-3">Marca</th>
                <th className="pb-3">Unidad</th>
                <th className="pb-3">Precio con IVA</th>
                <th className="pb-3 text-center">Stock</th>
                <th className="pb-3 text-center">Disponible</th>
                <th className="pb-3 text-center">Estado</th>
                <th className="pb-3 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 font-medium">
              {filteredProducts.map((p) => {
                const stockColor =
                  p.stock <= 2
                    ? 'text-[#E03B31]'
                    : p.stock <= 10
                    ? 'text-[#D98204]'
                    : 'text-[#1E293B]';

                return (
                  <tr key={p.codigo} className="hover:bg-[#FFF9F5]/60 transition-colors">
                    <td className="py-4 font-mono font-bold text-[#64748B]">
                      {p.codigo}
                    </td>
                    <td className="py-4">
                      <p className="font-bold text-[#1E293B] leading-tight">
                        {p.nombre}
                      </p>
                      <p className="text-[10px] text-[#8C9BAE] mt-0.5">
                        {p.categoria}
                      </p>
                    </td>
                    <td className="py-4 text-[#1E293B]">{p.marca}</td>
                    <td className="py-4 text-slate-500">{p.unidad}</td>
                    <td className="py-4 font-bold text-[#1E293B]">
                      {formatCurrency(p.precioConIva)}
                    </td>
                    <td className={`py-4 text-center font-black ${stockColor}`}>
                      {formatNumber(p.stock)}
                    </td>
                    <td className="py-4 text-center text-slate-700">
                      {formatNumber(p.disponible)}
                    </td>
                    <td className="py-4 text-center">
                      <Badge variant={p.estado === 'Activo' ? 'green' : 'gray'}>
                        {p.estado}
                      </Badge>
                    </td>
                    <td className="py-4 text-right">
                      <Link
                        href={`/inventario/${p.codigo}`}
                        className="font-bold text-[#FF6A1A] hover:underline"
                      >
                        Ver
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-100 text-xs text-[#64748B] mt-2">
          <span>Mostrando 1-{filteredProducts.length} de 6,952 productos</span>
          <div className="flex items-center gap-1.5 font-bold">
            <button className="px-2.5 py-1 rounded-lg hover:bg-slate-100">
              ‹ Anterior
            </button>
            <button className="w-7 h-7 rounded-lg bg-[#FF6A1A] text-white flex items-center justify-center">
              1
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
              2
            </button>
            <button className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center">
              3
            </button>
            <span className="px-1">...</span>
            <button className="px-2 py-1 rounded-lg hover:bg-slate-100">
              1,159
            </button>
            <button className="px-2.5 py-1 rounded-lg hover:bg-slate-100">
              Siguiente ›
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
