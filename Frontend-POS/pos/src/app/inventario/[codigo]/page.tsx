'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  ArrowLeft,
  Save,
  Trash2,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  Calendar,
  Layers,
  Barcode,
  Image as ImageIcon,
  History,
  ShoppingCart,
  TrendingUp,
} from 'lucide-react';

export default function FichaProductoPage() {
  const params = useParams();
  const router = useRouter();
  const codigo = params?.codigo as string;

  const { products, updateProduct, discontinueProduct } = usePOS();

  const product = products.find((p) => p.codigo.toLowerCase() === codigo?.toLowerCase()) || products[0];

  const [activeTab, setActiveTab] = useState<'general' | 'codigos' | 'imagenes' | 'kardex' | 'compras'>('general');

  // Editable fields
  const [nombre, setNombre] = useState(product?.nombre || '');
  const [categoria, setCategoria] = useState(product?.categoria || '');
  const [marca, setMarca] = useState(product?.marca || '');
  const [unidad, setUnidad] = useState(product?.unidad || 'Unidad');
  const [proveedorHabitual, setProveedorHabitual] = useState(product?.proveedorHabitual || '');
  const [puntoReorden, setPuntoReorden] = useState(product?.puntoReorden || 5);
  const [codigoFiscal, setCodigoFiscal] = useState(product?.codigoFiscal || '8467.21.00');
  const [publicadoWeb, setPublicadoWeb] = useState(product?.publicadoWeb ?? true);
  const [esFraccionable, setEsFraccionable] = useState(product?.esFraccionable ?? false);
  const [precioSinIva, setPrecioSinIva] = useState(product?.precioSinIva || 3450);
  const [costoUnitario, setCostoUnitario] = useState(product?.costoUnitario || 2180);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // New price modal / state
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [newPrecioSinIva, setNewPrecioSinIva] = useState(product?.precioSinIva || 3450);

  if (!product) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#F3ECE6]">
        <p className="text-sm font-bold text-[#64748B]">Producto no encontrado</p>
        <Link
          href="/inventario"
          className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-[#FF6A1A] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al catálogo
        </Link>
      </div>
    );
  }

  const handleSave = () => {
    const updated = {
      ...product,
      nombre,
      categoria,
      marca,
      unidad,
      proveedorHabitual,
      puntoReorden: Number(puntoReorden),
      codigoFiscal,
      publicadoWeb,
      esFraccionable,
      precioSinIva: Number(precioSinIva),
      precioConIva: +(Number(precioSinIva) * 1.15).toFixed(2),
      costoUnitario: Number(costoUnitario),
    };
    updateProduct(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleAddPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const newSinIva = Number(newPrecioSinIva);
    const newConIva = +(newSinIva * 1.15).toFixed(2);
    const now = new Date();
    const dateStr = now.toLocaleDateString('es-NI', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' +
      now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const updatedHist = [
      {
        vigenteDesde: dateStr,
        hasta: '—',
        costoProm: product.costoUnitario,
        precioSinIva: newSinIva,
        precioConIva: newConIva,
      },
      ...(product.historialPrecios || []).map((h, idx) => idx === 0 ? { ...h, hasta: dateStr } : h),
    ];

    updateProduct({
      ...product,
      precioSinIva: newSinIva,
      precioConIva: newConIva,
      historialPrecios: updatedHist,
    });
    setPrecioSinIva(newSinIva);
    setShowPriceModal(false);
  };

  const handleDiscontinue = () => {
    if (confirm(`¿Estás seguro de descontinuar el producto ${product.codigo}?`)) {
      discontinueProduct(product.codigo);
    }
  };

  const totalStockConsolidado = (product.sucursalesStock || []).reduce((acc, s) => acc + s.stock, 0);
  const totalDispConsolidado = (product.sucursalesStock || []).reduce((acc, s) => acc + s.disponible, 0);
  const totalCompConsolidado = (product.sucursalesStock || []).reduce((acc, s) => acc + s.comprometido, 0);
  const margenBruto = (((product.precioSinIva - product.costoUnitario) / product.precioSinIva) * 100).toFixed(1);

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

      {/* Product Hero Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-extrabold text-[#FF6A1A] bg-[#FFF4EC] px-2.5 py-1 rounded-xl">
              {product.codigo}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
              {product.nombre}
            </h1>
            <Badge variant={product.estado === 'Activo' ? 'success' : 'neutral'}>
              {product.estado}
            </Badge>
          </div>
          <p className="text-xs text-[#64748B] font-medium flex items-center gap-2 flex-wrap">
            <span>Marca: <strong className="text-[#1E293B]">{product.marca}</strong></span>
            <span>·</span>
            <span>Categoría: <strong className="text-[#1E293B]">{product.categoria}</strong></span>
            <span>·</span>
            <span>SKU Proveedor: <strong className="text-[#1E293B] font-mono">{product.codigoFiscal || 'N/D'}</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handleDiscontinue}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Descontinuar
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] hover:from-[#E6560B] hover:to-[#EB7424] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            Guardar cambios
          </button>
        </div>
      </div>

      {saveSuccess && (
        <div className="flex items-center gap-2 p-4 bg-[#E8F8F0] border border-[#B6EAD0] rounded-2xl text-[#1E9E60] text-xs font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          Cambios en el producto guardados exitosamente.
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-6 border-b border-[#F3ECE6] pb-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'general' ? 'text-[#FF6A1A]' : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Layers className="w-4 h-4" />
          General y precios
          {activeTab === 'general' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6A1A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('codigos')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'codigos' ? 'text-[#FF6A1A]' : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <Barcode className="w-4 h-4" />
          Códigos de barra (2)
          {activeTab === 'codigos' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6A1A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('imagenes')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'imagenes' ? 'text-[#FF6A1A]' : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <ImageIcon className="w-4 h-4" />
          Imágenes (4)
          {activeTab === 'imagenes' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6A1A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('kardex')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'kardex' ? 'text-[#FF6A1A]' : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <History className="w-4 h-4" />
          Kardex
          {activeTab === 'kardex' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6A1A] rounded-full" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('compras')}
          className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-2 cursor-pointer ${
            activeTab === 'compras' ? 'text-[#FF6A1A]' : 'text-[#64748B] hover:text-[#1E293B]'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          Compras relacionadas
          {activeTab === 'compras' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#FF6A1A] rounded-full" />
          )}
        </button>
      </div>

      {/* Main Content Layout */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Precios & Stock (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Card: Historial de precios */}
            <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-base font-black text-[#1E293B] tracking-tight">
                    Historial de precios
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Margen bruto actual: <span className="font-bold text-[#1E9E60]">{margenBruto}%</span> sobre costo promedio ponderado
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-xl bg-orange-50 border border-orange-200 text-[#FF6A1A] text-xs font-extrabold">
                    Precio actual {formatCurrency(product.precioConIva)}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowPriceModal(true)}
                    className="p-2 rounded-xl bg-[#FFF4EC] text-[#FF6A1A] hover:bg-[#FFE8D6] transition-colors cursor-pointer"
                    title="Actualizar precio"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Price Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F3ECE6] text-[#64748B] font-bold">
                      <th className="py-2.5 font-bold">Vigente desde</th>
                      <th className="py-2.5 font-bold">Hasta</th>
                      <th className="py-2.5 font-bold text-right">Costo prom.</th>
                      <th className="py-2.5 font-bold text-right">Precio sin IVA</th>
                      <th className="py-2.5 font-bold text-right">Precio con IVA</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3ECE6]">
                    {(product.historialPrecios || []).map((h, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-semibold text-[#1E293B]">{h.vigenteDesde}</td>
                        <td className="py-3 text-[#64748B]">{h.hasta || '—'}</td>
                        <td className="py-3 text-right font-medium text-[#64748B]">
                          {formatCurrency(h.costoProm)}
                        </td>
                        <td className="py-3 text-right font-medium text-[#1E293B]">
                          {formatCurrency(h.precioSinIva)}
                        </td>
                        <td className="py-3 text-right font-bold text-[#FF6A1A]">
                          {formatCurrency(h.precioConIva)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Card: Stock por sucursal */}
            <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-[#1E293B] tracking-tight">
                    Stock por sucursal
                  </h2>
                  <p className="text-xs text-[#64748B] mt-0.5">
                    Distribución física en bodega y salas de venta
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Función de solicitud de traslado entre sucursales habilitada.')}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E2E8F0] hover:bg-slate-50 text-xs font-bold text-[#1E293B] transition-colors cursor-pointer"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5 text-[#FF6A1A]" />
                  Solicitar traslado
                </button>
              </div>

              {/* Branch Stock Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#F3ECE6] text-[#64748B] font-bold">
                      <th className="py-2.5">Sucursal</th>
                      <th className="py-2.5 text-center">Físico</th>
                      <th className="py-2.5 text-center">Comprometido</th>
                      <th className="py-2.5 text-center">Disponible</th>
                      <th className="py-2.5 text-right">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F3ECE6]">
                    {(product.sucursalesStock || []).map((s) => (
                      <tr key={s.sucursal} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 font-bold text-[#1E293B]">{s.sucursal}</td>
                        <td className="py-3 text-center font-semibold text-[#1E293B]">
                          {formatNumber(s.stock)}
                        </td>
                        <td className="py-3 text-center text-amber-600 font-semibold">
                          {formatNumber(s.comprometido)}
                        </td>
                        <td className="py-3 text-center font-bold text-[#1E9E60]">
                          {formatNumber(s.disponible)}
                        </td>
                        <td className="py-3 text-right">
                          <Badge variant={s.disponible > 0 ? 'success' : 'danger'}>
                            {s.disponible > 0 ? 'Disponible' : 'Sin existencias'}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Stock Consolidated Banner */}
              <div className="bg-[#FFF4EC] border border-[#FFE0CC] rounded-2xl p-3 flex items-center justify-between text-xs text-[#B24100] font-bold">
                <span>Total consolidado de la empresa:</span>
                <span className="font-extrabold text-[#FF6A1A]">
                  {formatNumber(totalStockConsolidado)} unidades ({formatNumber(totalDispConsolidado)} disponibles / {formatNumber(totalCompConsolidado)} en pedidos)
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Ficha Técnica & Kardex Snippet (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Card: Ficha técnica */}
            <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
              <h2 className="text-base font-black text-[#1E293B] tracking-tight">
                Ficha técnica y clasificación
              </h2>

              <div className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-[#64748B] font-bold mb-1">Nombre comercial</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-semibold text-[#1E293B]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#64748B] font-bold mb-1">Marca</label>
                    <input
                      type="text"
                      value={marca}
                      onChange={(e) => setMarca(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-semibold text-[#1E293B]"
                    />
                  </div>
                  <div>
                    <label className="block text-[#64748B] font-bold mb-1">Categoría</label>
                    <input
                      type="text"
                      value={categoria}
                      onChange={(e) => setCategoria(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-semibold text-[#1E293B]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[#64748B] font-bold mb-1">Unidad de medida</label>
                    <select
                      value={unidad}
                      onChange={(e) => setUnidad(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-semibold text-[#1E293B] bg-white cursor-pointer"
                    >
                      <option value="Unidad">Unidad (Pza)</option>
                      <option value="Metro">Metro (Fracc.)</option>
                      <option value="Caja">Caja</option>
                      <option value="Bolsa">Bolsa</option>
                      <option value="Litro">Litro</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[#64748B] font-bold mb-1">Punto de reorden</label>
                    <input
                      type="number"
                      value={puntoReorden}
                      onChange={(e) => setPuntoReorden(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-semibold text-[#1E293B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[#64748B] font-bold mb-1">Proveedor habitual</label>
                  <input
                    type="text"
                    value={proveedorHabitual}
                    onChange={(e) => setProveedorHabitual(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-semibold text-[#1E293B]"
                  />
                </div>

                <div>
                  <label className="block text-[#64748B] font-bold mb-1">Código fiscal / arancelario</label>
                  <input
                    type="text"
                    value={codigoFiscal}
                    onChange={(e) => setCodigoFiscal(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-mono text-[#1E293B]"
                  />
                </div>

                {/* Checkboxes */}
                <div className="pt-2 space-y-2">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={publicadoWeb}
                      onChange={(e) => setPublicadoWeb(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF6A1A] focus:ring-[#FF6A1A] border-[#CBD5E1]"
                    />
                    <span className="text-xs font-semibold text-[#1E293B]">
                      Publicar en catálogo e-commerce
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={esFraccionable}
                      onChange={(e) => setEsFraccionable(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF6A1A] focus:ring-[#FF6A1A] border-[#CBD5E1]"
                    />
                    <span className="text-xs font-semibold text-[#1E293B]">
                      Producto fraccionable (permite ventas con decimales)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Card: Kardex Snippet */}
            <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-black text-[#1E293B] tracking-tight">
                  Kardex — últimos movimientos
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('kardex')}
                  className="text-xs font-bold text-[#FF6A1A] hover:underline cursor-pointer"
                >
                  Ver todo →
                </button>
              </div>

              <div className="space-y-3">
                {(product.kardex || []).slice(0, 4).map((k, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl border border-[#F3ECE6] bg-[#FAF8F5] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2 font-bold text-[#1E293B]">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            k.tipo === 'Entrada'
                              ? 'bg-emerald-500'
                              : k.tipo === 'Venta'
                              ? 'bg-blue-500'
                              : k.tipo === 'Reserva'
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                        />
                        <span>{k.tipo} · {k.documento}</span>
                      </div>
                      <p className="text-[11px] text-[#64748B] mt-0.5">
                        {k.fecha} · {k.empleado}
                      </p>
                    </div>
                    <div
                      className={`font-mono font-extrabold ${
                        k.cantidad > 0 ? 'text-[#1E9E60]' : 'text-[#1E293B]'
                      }`}
                    >
                      {k.cantidad > 0 ? `+${k.cantidad}` : k.cantidad} {product.unidad}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Códigos de barra */}
      {activeTab === 'codigos' && (
        <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-black text-[#1E293B]">Códigos de barra asociados</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Escanea o ingresa códigos para asignarlos al punto de venta
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl border border-[#F3ECE6] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1E293B]">EAN-13 Principal</p>
                <p className="font-mono text-sm font-extrabold text-[#FF6A1A] mt-1">7410293847291</p>
                <p className="text-[11px] text-[#64748B]">Impreso en caja de fábrica</p>
              </div>
              <Barcode className="w-8 h-8 text-[#94A3B8]" />
            </div>
            <div className="p-4 rounded-2xl border border-[#F3ECE6] bg-[#FAF8F5] flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-[#1E293B]">Código interno POS</p>
                <p className="font-mono text-sm font-extrabold text-[#1E293B] mt-1">{product.codigo}</p>
                <p className="text-[11px] text-[#64748B]">Etiqueta de mostrador</p>
              </div>
              <Barcode className="w-8 h-8 text-[#94A3B8]" />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Imágenes */}
      {activeTab === 'imagenes' && (
        <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-6">
          <div>
            <h2 className="text-base font-black text-[#1E293B]">Galería multimedia del producto</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Sincronizado con la plataforma e-commerce pública
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-2xl border border-[#F3ECE6] bg-[#FAF8F5] flex flex-col items-center justify-center p-4 text-center group hover:border-[#FF6A1A] transition-colors"
              >
                <ImageIcon className="w-10 h-10 text-[#CBD5E1] group-hover:text-[#FF6A1A] transition-colors mb-2" />
                <span className="text-xs font-bold text-[#64748B]">Foto {i}</span>
                {i === 1 && (
                  <span className="text-[10px] font-extrabold text-[#FF6A1A] bg-[#FFF4EC] px-2 py-0.5 rounded-md mt-1">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Kardex completo */}
      {activeTab === 'kardex' && (
        <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-[#1E293B]">Kardex detallado de movimientos</h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Historial completo de entradas, salidas y reservas
              </p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#F3ECE6] text-[#64748B] font-bold">
                  <th className="py-2.5">Fecha y hora</th>
                  <th className="py-2.5">Tipo movimiento</th>
                  <th className="py-2.5 text-center">Cantidad</th>
                  <th className="py-2.5">Documento soporte</th>
                  <th className="py-2.5">Operador / Empleado</th>
                  <th className="py-2.5">Referencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F3ECE6]">
                {(product.kardex || []).map((k, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 font-semibold text-[#1E293B]">{k.fecha}</td>
                    <td className="py-3">
                      <Badge
                        variant={
                          k.tipo === 'Entrada'
                            ? 'success'
                            : k.tipo === 'Venta'
                            ? 'info'
                            : k.tipo === 'Reserva'
                            ? 'warning'
                            : 'danger'
                        }
                      >
                        {k.tipo}
                      </Badge>
                    </td>
                    <td className="py-3 text-center font-mono font-extrabold">
                      <span className={k.cantidad > 0 ? 'text-[#1E9E60]' : 'text-slate-800'}>
                        {k.cantidad > 0 ? `+${k.cantidad}` : k.cantidad}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-[#1E293B]">{k.documento}</td>
                    <td className="py-3 text-[#64748B]">{k.empleado}</td>
                    <td className="py-3 font-mono text-[11px] text-[#64748B]">{k.referencia}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Compras relacionadas */}
      {activeTab === 'compras' && (
        <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
          <div>
            <h2 className="text-base font-black text-[#1E293B]">Órdenes de compra del producto</h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              Registros históricos de adquisición con proveedores
            </p>
          </div>
          <div className="p-4 rounded-2xl border border-[#F3ECE6] bg-[#FAF8F5] flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-[#1E293B]">OC-000108 · DeWalt Centroamérica</p>
              <p className="text-[#64748B] mt-0.5">15/09/2026 · 8 unidades recibidas a costo C$ 1,895.65</p>
            </div>
            <Link
              href="/compras/recepcion/OC-000108"
              className="text-xs font-bold text-[#FF6A1A] hover:underline"
            >
              Ver orden →
            </Link>
          </div>
        </div>
      )}

      {/* Modal: Registrar cambio de precio */}
      {showPriceModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-[#F3ECE6] shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-lg font-black text-[#1E293B]">Registrar nuevo precio</h3>
            <p className="text-xs text-[#64748B]">
              Actualiza el precio de venta al público para <strong>{product.nombre}</strong>.
            </p>

            <form onSubmit={handleAddPrice} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-bold text-[#64748B] mb-1">
                  Nuevo precio sin IVA (C$)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newPrecioSinIva}
                  onChange={(e) => setNewPrecioSinIva(Number(e.target.value))}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-bold text-sm text-[#1E293B]"
                />
              </div>

              <div className="p-3 rounded-2xl bg-[#FFF4EC] border border-[#FFE0CC] text-xs space-y-1">
                <div className="flex justify-between text-[#B24100]">
                  <span>IVA 15%:</span>
                  <span className="font-bold">{formatCurrency(newPrecioSinIva * 0.15)}</span>
                </div>
                <div className="flex justify-between font-extrabold text-[#FF6A1A] text-sm">
                  <span>Precio final al consumidor:</span>
                  <span>{formatCurrency(newPrecioSinIva * 1.15)}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPriceModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#64748B] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                >
                  Confirmar precio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
