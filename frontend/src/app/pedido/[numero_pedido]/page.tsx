'use client';

import React, { use } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  Package,
  Truck,
  MapPin,
  Printer,
  ArrowLeft,
  Calendar,
  CreditCard,
  Building,
  Phone,
  MessageCircle,
  FileText,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { EstadoPedido } from '@/types/api';

interface PedidoPageProps {
  params: Promise<{ numero_pedido: string }>;
}

export default function PedidoDetallePage({ params }: PedidoPageProps) {
  const resolvedParams = use(params);
  const numeroPedidoParam = decodeURIComponent(resolvedParams.numero_pedido);

  const { obtenerPedido, cliente } = useAuth();
  const pedido = obtenerPedido(numeroPedidoParam);

  // Fallback si no se encuentra en el historial local (ej. si entraron directamente con URL arbitraria)
  const pedidoActivo = pedido || {
    numero_pedido: numeroPedidoParam.toUpperCase(),
    fecha: new Date().toLocaleString('es-NI', { dateStyle: 'medium', timeStyle: 'short' }),
    estado: 'pagado' as EstadoPedido,
    metodo_pago: 'Tarjeta de Crédito / Débito (Stripe Test)',
    modalidad_entrega: 'domicilio' as const,
    destino_entrega: 'De la rotonda El Güegüense 2c abajo, 1c al lago, Managua',
    referencia_entrega: 'Portón negro frente a pulpería La Bendición',
    subtotal: 3930.43,
    iva_total: 589.57,
    total: 4520.0,
    items: [
      {
        producto_id: 1,
        nombre: 'Taladro Percutor Inalámbrico 20V Max Brushless DeWalt',
        slug: 'taladro-percutor-20v-dewalt',
        cantidad: 1,
        precio_unitario: 3499.0,
        subtotal: 3499.0,
      },
      {
        producto_id: 3,
        nombre: 'Juego de Brocas para Concreto y Mampostería Stanley 15 pzas',
        slug: 'juego-brocas-concreto-stanley',
        cantidad: 2,
        precio_unitario: 510.5,
        subtotal: 1021.0,
      },
    ],
  };

  const pasosTracking = [
    { id: 1, titulo: 'Pedido Recibido', estado: 'completado', desc: 'Registrado en sistema' },
    {
      id: 2,
      titulo: 'Pago Confirmado',
      estado: pedidoActivo.estado !== 'pendiente' ? 'completado' : 'activo',
      desc: 'Liquidación en Stripe / POS',
    },
    {
      id: 3,
      titulo: 'En Preparación',
      estado:
        pedidoActivo.estado === 'en_preparacion'
          ? 'activo'
          : pedidoActivo.estado === 'enviado' || pedidoActivo.estado === 'entregado'
          ? 'completado'
          : 'pendiente',
      desc: 'Separando stock en bodega central',
    },
    {
      id: 4,
      titulo: 'En Ruta / Listo',
      estado:
        pedidoActivo.estado === 'enviado'
          ? 'activo'
          : pedidoActivo.estado === 'entregado'
          ? 'completado'
          : 'pendiente',
      desc: 'Vehículo de flete asignado',
    },
    {
      id: 5,
      titulo: 'Entregado',
      estado: pedidoActivo.estado === 'entregado' ? 'completado' : 'pendiente',
      desc: 'Recepción y firma de remisión',
    },
  ];

  const handleImprimir = () => {
    window.print();
  };

  const mensajeWhatsApp = encodeURIComponent(
    `Hola Ferretería Construye, deseo consultar sobre el estado de mi pedido ${pedidoActivo.numero_pedido} por un total de C$ ${pedidoActivo.total.toFixed(2)}.`
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      {/* Botón Volver (oculto al imprimir) */}
      <div className="print:hidden mb-6 flex items-center justify-between">
        <Link
          href="/cuenta"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a Mis Pedidos
        </Link>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleImprimir}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-xs cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600" /> Imprimir Factura
          </button>
          <a
            href={`https://wa.me/50588889999?text=${mensajeWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-xs transition-colors"
          >
            <MessageCircle className="w-4 h-4" /> Soporte WhatsApp
          </a>
        </div>
      </div>

      {/* Contenedor del Comprobante */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden print:border-none print:shadow-none">
        {/* Cabecera Comercial */}
        <div className="bg-slate-950 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="inline-block bg-white px-2.5 py-1.5 rounded-xl shadow-xs shrink-0">
              <Image
                src="/logo.png"
                alt="Ferretería Construye"
                width={530}
                height={361}
                className="h-11 w-auto object-contain"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight">
                  CONSTRUYE<span className="text-amber-500">WEB</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700">
                  Ferretería & Materiales
                </span>
              </div>
              <p className="text-xs text-slate-400">
                RUC: J0310000008899 | Sucursal Central, Carretera Norte Km 4.5, Managua
              </p>
              <p className="text-xs text-slate-400">Tel: +505 2222-3333 | ventas@construyeweb.com</p>
            </div>
          </div>

          <div className="sm:text-right bg-slate-900 sm:bg-transparent p-3 sm:p-0 rounded-xl border border-slate-800 sm:border-none">
            <span className="text-xs text-slate-400 block uppercase tracking-wider font-semibold">
              Comprobante de Venta
            </span>
            <span className="font-mono text-xl sm:text-2xl font-black text-amber-400">
              {pedidoActivo.numero_pedido}
            </span>
            <p className="text-xs text-slate-400 mt-0.5">{pedidoActivo.fecha}</p>
          </div>
        </div>

        {/* Stepper de Seguimiento en Tiempo Real (Oculto al imprimir factura formal) */}
        <div className="print:hidden p-6 sm:p-8 bg-amber-50/50 border-b border-slate-200">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-6 flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" /> Estado de Despacho y Logística
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {pasosTracking.map((paso) => (
              <div key={paso.id} className="flex md:flex-col items-center md:items-start gap-3 md:gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 font-bold text-xs ${
                    paso.estado === 'completado'
                      ? 'bg-emerald-600 text-white'
                      : paso.estado === 'activo'
                      ? 'bg-amber-500 text-slate-950 ring-4 ring-amber-200 animate-pulse'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {paso.estado === 'completado' ? <CheckCircle2 className="w-5 h-5" /> : paso.id}
                </div>
                <div>
                  <h3
                    className={`text-xs font-black ${
                      paso.estado === 'completado'
                        ? 'text-emerald-900'
                        : paso.estado === 'activo'
                        ? 'text-amber-900'
                        : 'text-slate-400'
                    }`}
                  >
                    {paso.titulo}
                  </h3>
                  <p className="text-[11px] text-slate-500 leading-tight">{paso.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Datos del Cliente y Envío */}
        <div className="p-6 sm:p-8 border-b border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Cliente y Facturación
            </span>
            <p className="font-black text-slate-900 text-sm">{cliente?.nombre || 'Cliente Ferretero'}</p>
            <p className="text-slate-600">{cliente?.email || 'cliente@construyeweb.com'}</p>
            <p className="text-slate-600">Teléfono: {cliente?.telefono || '+505 8888-0000'}</p>
            {cliente?.codigo_fiscal && (
              <p className="text-slate-600 mt-1">
                <span className="font-semibold">RUC / Cédula:</span> {cliente.codigo_fiscal}
              </p>
            )}
          </div>

          <div>
            <span className="font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Destino de Entrega / Retiro
            </span>
            <div className="flex items-start gap-1.5 text-slate-800 font-semibold">
              <MapPin className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{pedidoActivo.destino_entrega}</span>
            </div>
            {pedidoActivo.referencia_entrega && (
              <div className="mt-2 p-2 bg-slate-50 rounded-md border border-slate-200 text-slate-600 text-[11px]">
                <strong className="text-slate-800 block">Puntos de Referencia:</strong>
                {pedidoActivo.referencia_entrega}
              </div>
            )}
            <p className="text-slate-500 mt-2">
              <span className="font-semibold">Forma de Pago:</span> {pedidoActivo.metodo_pago}
            </p>
          </div>
        </div>

        {/* Tabla Detalle de Items */}
        <div className="p-6 sm:p-8">
          <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-3">
            Detalle de Artículos y Materiales
          </h3>

          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                <th className="py-2.5">Cant.</th>
                <th className="py-2.5">Descripción del Material</th>
                <th className="py-2.5 text-right">P. Unitario (Neto)</th>
                <th className="py-2.5 text-right">Subtotal</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pedidoActivo.items.map((item, idx) => (
                <tr key={idx} className="py-2.5">
                  <td className="py-2.5 font-bold text-slate-900">{item.cantidad}</td>
                  <td className="py-2.5">
                    <span className="font-bold text-slate-800">{item.nombre}</span>
                  </td>
                  <td className="py-2.5 text-right font-mono text-slate-600">
                    C$ {(item.precio_unitario / 1.15).toLocaleString('es-NI', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="py-2.5 text-right font-mono font-bold text-slate-900">
                    C$ {item.subtotal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Liquidación Fiscal y Total */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex justify-end">
            <div className="w-full sm:w-64 space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal Neto:</span>
                <span className="font-mono">
                  C$ {pedidoActivo.subtotal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA (15% Ley Tributaria):</span>
                <span className="font-mono text-amber-700 font-medium">
                  C$ {pedidoActivo.iva_total.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Flete / Envío:</span>
                <span className="font-mono text-emerald-700 font-semibold">Gratis</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-950">
                <span>Total Facturado:</span>
                <span className="font-mono text-base text-slate-950">
                  C$ {pedidoActivo.total.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pie de comprobante */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 text-center text-[11px] text-slate-500">
          <p className="font-semibold text-slate-700">
            Gracias por construir con nosotros — Ferretería Construye
          </p>
          <p className="mt-0.5">
            Este comprobante digital avala la reserva e inventario según el esquema PostgreSQL de ConstruyeWeb.
          </p>
        </div>
      </div>
    </div>
  );
}
