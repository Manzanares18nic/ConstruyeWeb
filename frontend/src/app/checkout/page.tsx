'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ShieldCheck,
  CreditCard,
  Truck,
  Store,
  CheckCircle2,
  ArrowLeft,
  Lock,
  Printer,
  ShoppingBag,
  ExternalLink,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export default function CheckoutPage() {
  const {
    items,
    totalItems,
    subtotalNeto,
    ivaTotal,
    total,
    clearCart,
  } = useCart();

  // Estados del formulario
  const [nombre, setNombre] = useState('Jonathan Manzanares');
  const [email, setEmail] = useState('cliente@construyeweb.com');
  const [telefono, setTelefono] = useState('+505 8888-0000');

  const [modalidadEntrega, setModalidadEntrega] = useState<'sucursal' | 'domicilio'>('sucursal');
  const [sucursalId, setSucursalId] = useState('1');
  const [direccion, setDireccion] = useState('De la rotonda El Güegüense 2c abajo');
  const [ciudad, setCiudad] = useState('Managua');

  const [metodoPago, setMetodoPago] = useState<'tarjeta' | 'contra_entrega'>('tarjeta');
  const [tarjetaNumero, setTarjetaNumero] = useState('4242 •••• •••• 4242');
  const [tarjetaExp, setTarjetaExp] = useState('12/28');
  const [tarjetaCvc, setTarjetaCvc] = useState('123');

  // Estados del proceso de compra
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState<{
    numero_pedido: string;
    fecha: string;
    metodo_pago: string;
    total: number;
    subtotal: number;
    iva: number;
    sucursal: string;
    items: typeof items;
  } | null>(null);

  const handleAutocompletarStripe = () => {
    setTarjetaNumero('4242 4242 4242 4242');
    setTarjetaExp('12/28');
    setTarjetaCvc('424');
  };

  const handleFinalizarCompra = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setIsProcessing(true);

    // Simular latencia de red de Stripe PaymentIntent y reserva de inventario
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const numeroPedidoGenerado = `CW-${Math.floor(100000 + Math.random() * 900000)}`;
    const fechaActual = new Date().toLocaleString('es-NI', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });

    const sucursalTexto =
      sucursalId === '1'
        ? 'Sucursal Central (Km 4.5 Carretera Norte)'
        : 'Sucursal Sur (Carretera a Masaya Km 11)';

    setOrderCompleted({
      numero_pedido: numeroPedidoGenerado,
      fecha: fechaActual,
      metodo_pago: metodoPago === 'tarjeta' ? 'Tarjeta (Stripe Test)' : 'Contra entrega',
      total,
      subtotal: subtotalNeto,
      iva: ivaTotal,
      sucursal: modalidadEntrega === 'sucursal' ? sucursalTexto : `Envío a: ${direccion}, ${ciudad}`,
      items: [...items],
    });

    // Vaciar el carrito tras orden exitosa
    clearCart();
    setIsProcessing(false);
  };

  // Si se completó el pedido, mostrar la pantalla de confirmación/recibo
  if (orderCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-10 shadow-sm">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
              Pago Aprobado con Éxito
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
              ¡Gracias por tu compra en ConstruyeWeb!
            </h1>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Tu pedido ha sido registrado en el sistema y el inventario ha sido reservado atómicamente.
            </p>
          </div>

          {/* Recuadro de detalles del pedido */}
          <div className="mt-8 p-5 bg-slate-50 rounded-xl border border-slate-200/80 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Número de Pedido:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">
                  {orderCompleted.numero_pedido}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Fecha y Hora:</span>
                <span className="font-semibold text-slate-900">{orderCompleted.fecha}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Método de Pago:</span>
                <span className="font-semibold text-slate-900">{orderCompleted.metodo_pago}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Estado:</span>
                <span className="inline-flex items-center gap-1 font-bold text-emerald-600">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Pagado
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 text-xs">
              <span className="text-slate-500 block font-medium">Entrega / Retiro:</span>
              <span className="text-slate-800 font-semibold">{orderCompleted.sucursal}</span>
            </div>
          </div>

          {/* Desglose de artículos */}
          <div className="mt-6 border-t border-slate-200 pt-6">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Artículos del Pedido</h3>
            <div className="divide-y divide-slate-100">
              {orderCompleted.items.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700">{item.cantidad}x</span>
                    <span className="text-slate-800 font-medium">{item.nombre}</span>
                    <span className="text-slate-400 font-mono">({item.codigo_producto})</span>
                  </div>
                  <span className="font-mono font-semibold text-slate-900">
                    C${' '}
                    {item.subtotal.toLocaleString('es-NI', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>

            {/* Totales */}
            <div className="mt-4 pt-4 border-t border-slate-200 space-y-1.5 text-xs text-right">
              <div className="flex justify-between sm:justify-end sm:gap-8 text-slate-600">
                <span>Subtotal neto:</span>
                <span className="font-mono">
                  C${' '}
                  {orderCompleted.subtotal.toLocaleString('es-NI', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-8 text-slate-600">
                <span>IVA (15% ferretero):</span>
                <span className="font-mono">
                  C${' '}
                  {orderCompleted.iva.toLocaleString('es-NI', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between sm:justify-end sm:gap-8 text-sm font-black text-slate-950 pt-2 border-t border-slate-100">
                <span>Total pagado:</span>
                <span className="font-mono text-base text-amber-600">
                  C${' '}
                  {orderCompleted.total.toLocaleString('es-NI', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
            <button
              onClick={() => window.print()}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Recibo</span>
            </button>

            <Link
              href="/"
              className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Volver a la Tienda</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Si no hay artículos y no se ha completado orden
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900">No hay productos para pagar</h1>
        <p className="text-sm text-slate-500 mt-2">
          Agrega artículos al carrito antes de proceder a la pantalla de pago.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Ir al Catálogo</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Navegación y Encabezado */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
        <Link href="/carrito" className="hover:text-amber-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Carrito</span>
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold">Finalizar Pedido</span>
      </nav>

      <div className="pb-6 border-b border-slate-200">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <span>Checkout & Confirmación</span>
          <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md flex items-center gap-1">
            <Lock className="w-3 h-3" /> Pago Seguro
          </span>
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Completa tus datos de entrega y el método de pago según el contrato de API ferretero.
        </p>
      </div>

      <form onSubmit={handleFinalizarCompra} className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Columna Izquierda: Formulario de Checkout */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Datos del Cliente */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h2 className="text-base font-bold text-slate-900">Datos del Comprador</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="tel"
                  required
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* 2. Modalidad de Entrega */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h2 className="text-base font-bold text-slate-900">Modalidad de Entrega</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  modalidadEntrega === 'sucursal'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Store className="w-4 h-4 text-amber-600" />
                    <span>Retiro en Sucursal</span>
                  </div>
                  <input
                    type="radio"
                    name="modalidadEntrega"
                    checked={modalidadEntrega === 'sucursal'}
                    onChange={() => setModalidadEntrega('sucursal')}
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Sin costo de envío. Listo para retirar en 2 horas hábiles.
                </p>
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
                  modalidadEntrega === 'domicilio'
                    ? 'border-amber-500 bg-amber-50/40 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Truck className="w-4 h-4 text-amber-600" />
                    <span>Envío a Domicilio</span>
                  </div>
                  <input
                    type="radio"
                    name="modalidadEntrega"
                    checked={modalidadEntrega === 'domicilio'}
                    onChange={() => setModalidadEntrega('domicilio')}
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-2">
                  Despacho en camión ferretero para carga y herramientas.
                </p>
              </label>
            </div>

            {modalidadEntrega === 'sucursal' ? (
              <div className="mt-4 pt-3 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Selecciona la Sucursal de Retiro
                </label>
                <select
                  value={sucursalId}
                  onChange={(e) => setSucursalId(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                >
                  <option value="1">Sucursal 1 — Managua Centro (Km 4.5 Carretera Norte)</option>
                  <option value="2">Sucursal 2 — Managua Sur (Carretera a Masaya Km 11)</option>
                </select>
              </div>
            ) : (
              <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Dirección de Entrega
                  </label>
                  <input
                    type="text"
                    required
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Ej. De la rotonda El Güegüense 2c abajo"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Ciudad / Departamento
                  </label>
                  <input
                    type="text"
                    required
                    value={ciudad}
                    onChange={(e) => setCiudad(e.target.value)}
                    placeholder="Ej. Managua"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Método de Pago (Stripe Mode Test) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-slate-900 text-white text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base font-bold text-slate-900">Método de Pago</h2>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                Stripe Test Mode
              </span>
            </div>

            {/* Aviso informativo de Stripe Test */}
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold">Modo de Pruebas de Stripe Activo</p>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Usa la tarjeta de prueba estándar <code>4242 4242 4242 4242</code>. No se realizarán cobros reales.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAutocompletarStripe}
                className="shrink-0 px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded text-[11px] transition-colors"
              >
                Autocompletar
              </button>
            </div>

            <div className="space-y-3">
              <label
                className={`p-4 rounded-xl border cursor-pointer block transition-all ${
                  metodoPago === 'tarjeta'
                    ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <span>Tarjeta de Crédito / Débito (Stripe)</span>
                  </div>
                  <input
                    type="radio"
                    name="metodoPago"
                    checked={metodoPago === 'tarjeta'}
                    onChange={() => setMetodoPago('tarjeta')}
                    className="accent-amber-500"
                  />
                </div>

                {metodoPago === 'tarjeta' && (
                  <div className="mt-4 space-y-3 pt-3 border-t border-slate-200/60">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Número de Tarjeta
                      </label>
                      <input
                        type="text"
                        required
                        value={tarjetaNumero}
                        onChange={(e) => setTarjetaNumero(e.target.value)}
                        className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          Vencimiento (MM/AA)
                        </label>
                        <input
                          type="text"
                          required
                          value={tarjetaExp}
                          onChange={(e) => setTarjetaExp(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                          CVC / CVV
                        </label>
                        <input
                          type="text"
                          required
                          value={tarjetaCvc}
                          onChange={(e) => setTarjetaCvc(e.target.value)}
                          className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </label>

              <label
                className={`p-4 rounded-xl border cursor-pointer block transition-all ${
                  metodoPago === 'contra_entrega'
                    ? 'border-amber-500 bg-amber-50/20 ring-2 ring-amber-500/20'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900">
                    <Store className="w-4 h-4 text-slate-700" />
                    <span>Pago en Caja / Contra Entrega</span>
                  </div>
                  <input
                    type="radio"
                    name="metodoPago"
                    checked={metodoPago === 'contra_entrega'}
                    onChange={() => setMetodoPago('contra_entrega')}
                    className="accent-amber-500"
                  />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Paga en efectivo o con POS móvil al retirar o recibir tus productos.
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Resumen de Compra y Botón de Pago */}
        <div className="lg:col-span-5 sticky top-24">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-5">
            <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
              Resumen de la Orden ({totalItems} {totalItems === 1 ? 'ítem' : 'ítems'})
            </h2>

            {/* Lista resumida */}
            <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 bg-slate-100 rounded border border-slate-200 shrink-0 overflow-hidden">
                      {item.imagen_principal && (
                        <Image src={item.imagen_principal} alt={item.nombre} fill className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 truncate">{item.nombre}</p>
                      <p className="text-[11px] text-slate-500">
                        {item.cantidad} x C$ {item.precio_unitario.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <span className="font-mono font-bold text-slate-900 shrink-0">
                    C$ {item.subtotal.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Desglose Financiero */}
            <div className="pt-3 border-t border-slate-200 space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal neto:</span>
                <span className="font-mono font-semibold text-slate-900">
                  C${' '}
                  {subtotalNeto.toLocaleString('es-NI', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>IVA (15%):</span>
                <span className="font-mono font-semibold text-slate-900">
                  C${' '}
                  {ivaTotal.toLocaleString('es-NI', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Costo de envío:</span>
                <span className="font-semibold text-emerald-600">Gratis</span>
              </div>
              <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
                <span className="text-sm font-bold text-slate-900">Total a Pagar:</span>
                <span className="text-xl font-black text-slate-950 font-mono">
                  C${' '}
                  {total.toLocaleString('es-NI', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </div>
            </div>

            {/* Botón de Confirmación */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:bg-slate-300 text-slate-950 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Procesando pago con Stripe...</span>
                  </div>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirmar y Pagar Pedido</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 text-center text-[11px] text-slate-400 space-y-1">
              <p>Al confirmar, el backend creará la reserva atómica en la tabla <code>inventario</code>.</p>
              <p>Ambiente de prueba seguro (PostgreSQL + DRF + Stripe).</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
