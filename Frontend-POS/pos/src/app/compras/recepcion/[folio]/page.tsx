'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  ArrowLeft,
  Truck,
  CheckCircle2,
  XCircle,
  FileText,
  Building2,
  Calendar,
  User,
  AlertCircle,
  PackageCheck,
} from 'lucide-react';

export default function RecepcionMercaderiaPage() {
  const params = useParams();
  const router = useRouter();
  const folio = (params?.folio as string) || 'OC-000112';

  const { purchaseOrders, receivePurchaseOrder, anularPurchaseOrder, currentUser } = usePOS();

  const po = purchaseOrders.find((p) => p.folio.toLowerCase() === folio.toLowerCase()) || purchaseOrders[0];

  const [documentoProveedor, setDocumentoProveedor] = useState(po?.documentoProveedor || 'FAC-PROV-90123');
  const [observaciones, setObservaciones] = useState('');
  const [receivedLines, setReceivedLines] = useState(
    po?.lineas.map((l) => ({ ...l, cantidadRecibida: l.cantidad })) || []
  );
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!po) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#F3ECE6]">
        <p className="text-sm font-bold text-[#64748B]">Orden de compra no encontrada</p>
        <Link
          href="/compras"
          className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-[#FF6A1A] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a compras
        </Link>
      </div>
    );
  }

  const handleConfirmReception = () => {
    if (po.estado === 'Recibida') {
      alert('Esta orden ya fue recibida anteriormente.');
      return;
    }
    receivePurchaseOrder(po.folio);
    setStatusMessage({
      type: 'success',
      text: `Mercadería recibida exitosamente en bodega de ${po.sucursalDestino}. El inventario y Kardex se actualizaron automáticamente.`,
    });
  };

  const handleAnular = () => {
    if (confirm(`¿Estás seguro de anular la orden ${po.folio}?`)) {
      anularPurchaseOrder(po.folio);
      setStatusMessage({
        type: 'error',
        text: `La orden de compra ${po.folio} ha sido anulada.`,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/compras"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#FF6A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a órdenes de compra
        </Link>
      </div>

      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-extrabold text-[#FF6A1A] bg-[#FFF4EC] px-2.5 py-1 rounded-xl">
              {po.folio}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
              Recepción de compra · {po.proveedor}
            </h1>
            <Badge
              variant={
                po.estado === 'Recibida'
                  ? 'success'
                  : po.estado === 'Pendiente'
                  ? 'warning'
                  : 'neutral'
              }
            >
              {po.estado === 'Pendiente' ? 'Pendiente de recibir' : po.estado}
            </Badge>
          </div>
          <p className="text-xs text-[#64748B] font-medium flex items-center gap-2 flex-wrap">
            <span>Fecha emisión: <strong className="text-[#1E293B]">{po.fecha}</strong></span>
            <span>·</span>
            <span>Destino: <strong className="text-[#1E293B]">{po.sucursalDestino}</strong></span>
            <span>·</span>
            <span>Registrada por: <strong className="text-[#1E293B]">{po.registradaPor}</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          {po.estado === 'Pendiente' && (
            <>
              <button
                type="button"
                onClick={handleAnular}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <XCircle className="w-3.5 h-3.5" />
                Anular orden
              </button>
              <button
                type="button"
                onClick={handleConfirmReception}
                className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#1E9E60] hover:bg-[#18834F] text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
              >
                <PackageCheck className="w-4 h-4" />
                Confirmar recepción
              </button>
            </>
          )}
          {po.estado === 'Recibida' && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#E8F8F0] border border-[#B6EAD0] text-[#1E9E60] text-xs font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Mercadería ingresada en inventario
            </div>
          )}
        </div>
      </div>

      {statusMessage && (
        <div
          className={`flex items-center gap-2 p-4 rounded-2xl border text-xs font-bold animate-in fade-in duration-200 shadow-2xs ${
            statusMessage.type === 'success'
              ? 'bg-[#E8F8F0] border-[#B6EAD0] text-[#1E9E60]'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          {statusMessage.text}
        </div>
      )}

      {/* Main 2-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Lines & Inbound details (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Líneas de la orden */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <div>
              <h2 className="text-base font-black text-[#1E293B] tracking-tight">
                Líneas de la orden de compra
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Verifica las cantidades físicas entregadas por el transportista
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F3ECE6] text-[#64748B] font-bold">
                    <th className="py-2.5">Producto</th>
                    <th className="py-2.5 text-center">Pedida</th>
                    <th className="py-2.5 text-center">A recibir</th>
                    <th className="py-2.5 text-right">Costo unit.</th>
                    <th className="py-2.5 text-center">IVA %</th>
                    <th className="py-2.5 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECE6]">
                  {receivedLines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3">
                        <p className="font-bold text-[#1E293B]">{line.producto}</p>
                        <p className="font-mono text-[10px] text-[#94A3B8]">{line.codigo}</p>
                      </td>
                      <td className="py-3 text-center font-bold text-[#64748B]">
                        {formatNumber(line.cantidad)}
                      </td>
                      <td className="py-3 text-center">
                        {po.estado === 'Pendiente' ? (
                          <input
                            type="number"
                            value={line.cantidadRecibida}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setReceivedLines((prev) =>
                                prev.map((l, i) => (i === idx ? { ...l, cantidadRecibida: val } : l))
                              );
                            }}
                            className="w-18 px-2 py-1 border border-[#CBD5E1] rounded-lg text-center font-extrabold text-[#FF6A1A] focus:outline-none focus:border-[#FF6A1A]"
                          />
                        ) : (
                          <span className="font-bold text-[#1E9E60]">
                            {formatNumber(line.cantidad)}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-medium text-[#64748B]">
                        {formatCurrency(line.costoUnitario)}
                      </td>
                      <td className="py-3 text-center font-medium text-[#64748B]">
                        {line.ivaPorc}%
                      </td>
                      <td className="py-3 text-right font-extrabold text-[#1E293B]">
                        {formatCurrency(line.subtotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Documento de soporte del proveedor */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Datos del comprobante del proveedor
            </h2>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#64748B] mb-1">
                  N.° Factura o Remisión del Proveedor
                </label>
                <input
                  type="text"
                  value={documentoProveedor}
                  onChange={(e) => setDocumentoProveedor(e.target.value)}
                  placeholder="Ej: FACT-9821 / REM-1029"
                  disabled={po.estado !== 'Pendiente'}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-mono font-bold text-[#1E293B]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#64748B] mb-1">
                  Observaciones de recepción / Notas de avería o faltante
                </label>
                <textarea
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Ej: Embalaje en perfecto estado, sellos de fábrica intactos..."
                  disabled={po.estado !== 'Pendiente'}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-[#E2E8F0] focus:border-[#FF6A1A] focus:outline-none font-medium text-[#1E293B] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Resumen & Metadata (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Resumen de la orden */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Resumen económico
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Productos distintos:</span>
                <span className="font-bold text-[#1E293B]">{po.lineas.length} ítems</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Unidades totales:</span>
                <span className="font-bold text-[#1E293B]">{formatNumber(po.unidades)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal sin IVA:</span>
                <span className="font-bold text-[#1E293B]">{formatCurrency(po.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>IVA 15%:</span>
                <span className="font-bold text-[#1E293B]">{formatCurrency(po.iva)}</span>
              </div>
              <div className="pt-2 border-t border-[#F3ECE6] flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-[#1E293B]">Total a pagar:</span>
                <span className="text-xl font-black text-[#FF6A1A]">
                  {formatCurrency(po.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Card: Datos de la orden */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-3.5 text-xs">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Datos de la compra
            </h2>

            <div className="space-y-2 text-[#64748B]">
              <div className="flex justify-between">
                <span>Proveedor:</span>
                <span className="font-bold text-[#1E293B] text-right">{po.proveedor}</span>
              </div>
              <div className="flex justify-between">
                <span>Sucursal de entrada:</span>
                <span className="font-bold text-[#1E293B]">{po.sucursalDestino}</span>
              </div>
              <div className="flex justify-between">
                <span>Registrado por:</span>
                <span className="font-bold text-[#1E293B]">{po.registradaPor}</span>
              </div>
              <div className="flex justify-between">
                <span>Receptor actual:</span>
                <span className="font-bold text-[#1E293B]">{currentUser.nombre}</span>
              </div>
            </div>
          </div>

          {/* Card: Instrucciones de bodega */}
          <div className="bg-[#FFF4EC] border border-[#FFE0CC] rounded-3xl p-5 space-y-2 text-xs text-[#B24100]">
            <div className="flex items-center gap-2 font-bold">
              <Truck className="w-4 h-4 text-[#FF6A1A]" />
              <span>Instrucción de control de inventario</span>
            </div>
            <p className="leading-relaxed">
              Al confirmar la recepción física, el stock se sumará de forma inmediata en la sucursal <strong>{po.sucursalDestino}</strong> y se generará una entrada con folio <strong>{po.folio}</strong> en el Kardex fiscal permanente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
