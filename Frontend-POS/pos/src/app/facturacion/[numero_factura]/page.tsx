'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { usePOS } from '@/context/POSContext';
import { Badge } from '@/components/Badge';
import { formatCurrency, formatNumber } from '@/lib/utils';
import {
  ArrowLeft,
  Printer,
  XCircle,
  CheckCircle2,
  TrendingUp,
  CreditCard,
  Banknote,
  Receipt,
  Building2,
  Calendar,
  User,
  QrCode,
  ShieldCheck,
} from 'lucide-react';

export default function DetalleFacturaPage() {
  const params = useParams();
  const numero = (params?.numero_factura as string) || 'FAC-000358';

  const { invoices, anularInvoice } = usePOS();

  const invoice = invoices.find((i) => i.numero.toLowerCase() === numero.toLowerCase()) || invoices[0];
  const [printFeedback, setPrintFeedback] = useState(false);

  if (!invoice) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-[#F3ECE6]">
        <p className="text-sm font-bold text-[#64748B]">Factura no encontrada</p>
        <Link
          href="/facturacion"
          className="inline-flex items-center gap-2 mt-4 text-xs font-bold text-[#FF6A1A] hover:underline"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a facturación
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    setPrintFeedback(true);
    setTimeout(() => {
      window.print();
      setPrintFeedback(false);
    }, 500);
  };

  const handleAnular = () => {
    if (confirm(`¿Estás seguro de anular la factura ${invoice.numero}? Esta acción generará una nota de crédito fiscal.`)) {
      anularInvoice(invoice.numero);
    }
  };

  const margen = invoice.utilidadEstimada
    ? ((invoice.utilidadEstimada / invoice.subtotal) * 100).toFixed(1)
    : '32.4';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back button */}
      <div>
        <Link
          href="/facturacion"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#FF6A1A] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a facturación
        </Link>
      </div>

      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-1.5 flex-wrap">
            <span className="font-mono text-xs font-extrabold text-[#FF6A1A] bg-[#FFF4EC] px-2.5 py-1 rounded-xl">
              {invoice.numero}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#1E293B] tracking-tight">
              Factura de venta
            </h1>
            <Badge variant={invoice.canal === 'POS' ? 'pos' : 'ecommerce'}>
              Canal {invoice.canal}
            </Badge>
            <Badge variant={invoice.estado === 'Emitida' ? 'success' : 'danger'}>
              {invoice.estado}
            </Badge>
          </div>
          <p className="text-xs text-[#64748B] font-medium flex items-center gap-2 flex-wrap">
            <span>Fecha: <strong className="text-[#1E293B]">{invoice.fecha} · {invoice.hora}</strong></span>
            <span>·</span>
            <span>Sucursal: <strong className="text-[#1E293B]">{invoice.sucursal}</strong></span>
            <span>·</span>
            <span>Caja: <strong className="text-[#1E293B]">{invoice.caja}</strong></span>
            <span>·</span>
            <span>Cajero: <strong className="text-[#1E293B]">{invoice.cajero}</strong></span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#1E293B] text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#FF6A1A]" />
            {printFeedback ? 'Preparando ticket...' : 'Reimprimir ticket'}
          </button>
          {invoice.estado === 'Emitida' && (
            <button
              type="button"
              onClick={handleAnular}
              className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white border border-[#E2E8F0] hover:border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <XCircle className="w-3.5 h-3.5" />
              Anular factura
            </button>
          )}
        </div>
      </div>

      {/* Main 2-column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Utility banner, lines and totals (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Green Profitability Banner */}
          <div className="bg-[#E8F8F0] border border-[#B6EAD0] rounded-3xl p-4 flex items-center justify-between text-xs text-[#1E9E60]">
            <div className="flex items-center gap-2 font-bold">
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>
                Utilidad bruta estimada de la venta: <strong>{formatCurrency(invoice.utilidadEstimada || 1592.1)}</strong>
              </span>
            </div>
            <span className="font-extrabold bg-[#B6EAD0]/50 px-2.5 py-1 rounded-xl text-[11px]">
              Margen {margen}%
            </span>
          </div>

          {/* Card: Líneas facturadas */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Líneas facturadas
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#F3ECE6] text-[#64748B] font-bold">
                    <th className="py-2.5">Producto</th>
                    <th className="py-2.5 text-center">Cant.</th>
                    <th className="py-2.5 text-right">Precio unit.</th>
                    <th className="py-2.5 text-center">IVA %</th>
                    <th className="py-2.5 text-right">Subtotal</th>
                    <th className="py-2.5 text-right">Costo unit.</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F3ECE6]">
                  {invoice.lineas.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3">
                        <p className="font-bold text-[#1E293B]">{line.producto}</p>
                        <p className="font-mono text-[10px] text-[#94A3B8]">{line.codigo}</p>
                      </td>
                      <td className="py-3 text-center font-bold text-[#1E293B]">
                        {formatNumber(line.cantidad)}
                      </td>
                      <td className="py-3 text-right font-medium text-[#1E293B]">
                        {formatCurrency(line.precioUnit)}
                      </td>
                      <td className="py-3 text-center font-medium text-[#64748B]">
                        {line.ivaPorc}%
                      </td>
                      <td className="py-3 text-right font-black text-[#1E293B]">
                        {formatCurrency(line.subtotal)}
                      </td>
                      <td className="py-3 text-right font-mono text-[11px] text-[#64748B]">
                        {formatCurrency(line.costoUnit)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card: Desglose de totales */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-3">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Totales del comprobante
            </h2>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#64748B]">
                <span>Subtotal neto sin impuestos:</span>
                <span className="font-bold text-[#1E293B]">{formatCurrency(invoice.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Descuento aplicado:</span>
                <span className="font-bold text-[#1E293B]">{formatCurrency(invoice.descuento)}</span>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Impuesto al Valor Agregado (IVA 15%):</span>
                <span className="font-bold text-[#1E293B]">{formatCurrency(invoice.iva)}</span>
              </div>
              <div className="pt-2 border-t border-[#F3ECE6] flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-[#1E293B]">Total factura:</span>
                <span className="text-2xl font-black text-[#FF6A1A]">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Pagos aplicados & Trazabilidad (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Pagos aplicados */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-black text-[#1E293B] tracking-tight">
                Pagos aplicados
              </h2>
              <span className="text-xs font-bold text-[#1E9E60]">Comprobado 100%</span>
            </div>

            <div className="space-y-2.5">
              {invoice.pagos.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl border border-[#F3ECE6] bg-[#FAF8F5] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-[#FF6A1A]">
                      {p.metodo === 'Efectivo' ? (
                        <Banknote className="w-4 h-4" />
                      ) : (
                        <CreditCard className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#1E293B]">{p.metodo}</p>
                      {p.referencia ? (
                        <p className="font-mono text-[10px] text-[#94A3B8]">
                          Ref: {p.referencia}
                        </p>
                      ) : (
                        <p className="text-[10px] text-[#94A3B8]">Pago en caja física</p>
                      )}
                    </div>
                  </div>
                  <span className="font-mono font-black text-sm text-[#1E293B]">
                    {formatCurrency(p.monto)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-[#F3ECE6] flex justify-between text-xs font-bold text-[#64748B]">
              <span>Total liquidado:</span>
              <span className="text-[#1E293B] font-extrabold">{formatCurrency(invoice.total)}</span>
            </div>
          </div>

          {/* Card: Detalles y trazabilidad de la venta */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs space-y-3.5 text-xs">
            <h2 className="text-base font-black text-[#1E293B] tracking-tight">
              Detalles y trazabilidad
            </h2>

            <div className="space-y-2.5 text-[#64748B]">
              <div className="flex justify-between">
                <span>Cliente:</span>
                <span className="font-bold text-[#1E293B]">{invoice.cliente}</span>
              </div>
              {invoice.clienteRuc && (
                <div className="flex justify-between">
                  <span>Cédula / RUC:</span>
                  <span className="font-mono font-bold text-[#1E293B]">{invoice.clienteRuc}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Sesión de caja:</span>
                <span className="font-mono font-bold text-[#FF6A1A]">
                  {invoice.sesionCaja || '#00214'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Movimiento en Kardex:</span>
                <span className="font-bold text-[#1E9E60]">
                  {invoice.lineas.length} productos descargados
                </span>
              </div>
              <div className="flex justify-between">
                <span>Estado fiscal DGI:</span>
                <span className="font-bold text-[#1E9E60]">Válida e inscrita</span>
              </div>
            </div>
          </div>

          {/* Card: Comprobante y QR DGI */}
          <div className="bg-white rounded-3xl p-6 border border-[#F3ECE6] shadow-2xs flex items-center gap-4 text-xs">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 border border-[#E2E8F0] flex items-center justify-center shrink-0">
              <QrCode className="w-10 h-10 text-slate-700" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1E293B]">
                <ShieldCheck className="w-4 h-4 text-[#1E9E60]" />
                <span>Certificación fiscal autorizada</span>
              </div>
              <p className="font-mono text-[10px] text-[#64748B] mt-0.5">
                Autorización DGI: DGI-RES-2026-90412
              </p>
              <p className="text-[10px] text-[#94A3B8]">
                Rango legal: FAC-000001 al FAC-010000
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
