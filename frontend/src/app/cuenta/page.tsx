'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  User,
  Package,
  MapPin,
  LogOut,
  Plus,
  Trash2,
  Check,
  Building,
  Calendar,
  ExternalLink,
  Phone,
  Mail,
  FileText,
  AlertCircle,
  Clock,
  CheckCircle2,
  Truck,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { EstadoPedido } from '@/types/api';

export default function CuentaPage() {
  const router = useRouter();
  const {
    cliente,
    isAuthenticated,
    direcciones,
    pedidos,
    logout,
    actualizarPerfil,
    agregarDireccion,
    eliminarDireccion,
    setDireccionPredeterminada,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'pedidos' | 'direcciones' | 'perfil'>('pedidos');

  // Estados de edición de perfil
  const [nombre, setNombre] = useState(cliente?.nombre || '');
  const [telefono, setTelefono] = useState(cliente?.telefono || '');
  const [codigoFiscal, setCodigoFiscal] = useState(cliente?.codigo_fiscal || '');
  const [perfilGuardado, setPerfilGuardado] = useState(false);

  // Estados para nueva dirección
  const [mostrarModalDireccion, setMostrarModalDireccion] = useState(false);
  const [nuevaAlias, setNuevaAlias] = useState('');
  const [nuevaDireccion, setNuevaDireccion] = useState('');
  const [nuevaCiudad, setNuevaCiudad] = useState('Managua');
  const [nuevaReferencia, setNuevaReferencia] = useState('');
  const [nuevaPredeterminada, setNuevaPredeterminada] = useState(false);

  if (!isAuthenticated || !cliente) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-4">
          <User className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Inicia sesión en tu cuenta</h1>
        <p className="text-sm text-slate-600 mb-6">
          Necesitas iniciar sesión para revisar tus pedidos históricos y gestionar tus direcciones de envío.
        </p>
        <div className="flex justify-center gap-3">
          <Link
            href="/login"
            className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition-colors"
          >
            Iniciar Sesión
          </Link>
          <Link
            href="/registro"
            className="px-6 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-lg text-sm transition-colors"
          >
            Registrarme
          </Link>
        </div>
      </div>
    );
  }

  const handleGuardarPerfil = (e: React.FormEvent) => {
    e.preventDefault();
    actualizarPerfil({
      nombre,
      telefono,
      codigo_fiscal: codigoFiscal,
    });
    setPerfilGuardado(true);
    setTimeout(() => setPerfilGuardado(false), 3000);
  };

  const handleCrearDireccion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevaAlias || !nuevaDireccion) return;

    agregarDireccion({
      alias: nuevaAlias,
      direccion: nuevaDireccion,
      ciudad: nuevaCiudad,
      referencia: nuevaReferencia,
      predeterminada: nuevaPredeterminada,
    });

    setNuevaAlias('');
    setNuevaDireccion('');
    setNuevaReferencia('');
    setNuevaPredeterminada(false);
    setMostrarModalDireccion(false);
  };

  const handleCerrarSesion = () => {
    logout();
    router.push('/login');
  };

  const getBadgeEstado = (estado: EstadoPedido) => {
    switch (estado) {
      case 'pendiente':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3" /> Pendiente
          </span>
        );
      case 'pagado':
      case 'en_preparacion':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
            <Package className="w-3 h-3" /> En Preparación
          </span>
        );
      case 'enviado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
            <Truck className="w-3 h-3" /> En Camino
          </span>
        );
      case 'entregado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3" /> Entregado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-800">
            {estado}
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Cabecera del Portal */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-2xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-amber-500 text-slate-950 font-black text-2xl flex items-center justify-center shrink-0">
            {cliente.nombre.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight">{cliente.nombre}</h1>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold uppercase tracking-wider border border-amber-500/30">
                Cliente Verificado
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-0.5">{cliente.email}</p>
            {cliente.telefono && <p className="text-xs text-slate-500">{cliente.telefono}</p>}
          </div>
        </div>

        <button
          type="button"
          onClick={handleCerrarSesion}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-red-950/50 hover:text-red-400 text-slate-300 text-xs font-bold transition-colors border border-slate-700 cursor-pointer self-start md:self-auto"
        >
          <LogOut className="w-4 h-4" /> Cerrar Sesión
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Barra Lateral de Pestañas */}
        <aside className="lg:col-span-1 space-y-1">
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'pedidos'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <Package className="w-5 h-5" />
            <span>Mis Pedidos</span>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full font-black ${
                activeTab === 'pedidos' ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {pedidos.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('direcciones')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'direcciones'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <MapPin className="w-5 h-5" />
            <span>Libreta de Direcciones</span>
            <span
              className={`ml-auto text-xs px-2 py-0.5 rounded-full font-black ${
                activeTab === 'direcciones' ? 'bg-slate-950 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {direcciones.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all text-left cursor-pointer ${
              activeTab === 'perfil'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
            }`}
          >
            <User className="w-5 h-5" />
            <span>Datos de Mi Perfil</span>
          </button>
        </aside>

        {/* Contenido Principal */}
        <div className="lg:col-span-3">
          {/* PESTAÑA 1: PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Historial de Pedidos</h2>
                  <p className="text-xs text-slate-500">
                    Revisa el estado de entrega y comprobantes con cálculo de IVA al 15%.
                  </p>
                </div>
              </div>

              {pedidos.length === 0 ? (
                <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
                  <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-sm font-bold text-slate-800">Aún no has realizado pedidos</p>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Explora nuestro catálogo ferretero y haz tu primer encargo de materiales.
                  </p>
                  <Link
                    href="/catalogo"
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors inline-block"
                  >
                    Ver Catálogo
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {pedidos.map((pedido) => (
                    <div
                      key={pedido.numero_pedido}
                      className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 hover:border-slate-300 transition-all shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-2">
                        <div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-base font-black text-slate-950">
                              {pedido.numero_pedido}
                            </span>
                            {getBadgeEstado(pedido.estado)}
                          </div>
                          <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {pedido.fecha}
                          </p>
                        </div>
                        <div className="sm:text-right">
                          <p className="text-xs text-slate-400">Total Facturado</p>
                          <p className="text-lg font-black text-slate-900">
                            C$ {pedido.total.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>

                      {/* Lista resumida de artículos */}
                      <div className="space-y-2 mb-4">
                        {pedido.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs py-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-slate-800">{item.cantidad}x</span>
                              <span className="text-slate-600 line-clamp-1">{item.nombre}</span>
                            </div>
                            <span className="font-mono text-slate-700 shrink-0 font-medium">
                              C$ {item.subtotal.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                        <div className="text-slate-500 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          <span className="truncate max-w-sm">{pedido.destino_entrega}</span>
                        </div>

                        <Link
                          href={`/pedido/${pedido.numero_pedido}`}
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-xs transition-colors shrink-0"
                        >
                          Ver Comprobante y Tracking <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PESTAÑA 2: LIBRETA DE DIRECCIONES */}
          {activeTab === 'direcciones' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Libreta de Direcciones</h2>
                  <p className="text-xs text-slate-500">
                    Direcciones de entrega con puntos de referencia tradicionales para fletes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setMostrarModalDireccion(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" /> Agregar Dirección
                </button>
              </div>

              {/* Formulario de nueva dirección */}
              {mostrarModalDireccion && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 mb-4 animate-in fade-in duration-200">
                  <h3 className="text-sm font-black text-slate-900 mb-3 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-600" /> Nueva Dirección de Envío
                  </h3>
                  <form onSubmit={handleCrearDireccion} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Alias / Identificador *
                        </label>
                        <input
                          type="text"
                          required
                          value={nuevaAlias}
                          onChange={(e) => setNuevaAlias(e.target.value)}
                          placeholder="Ej. Casa, Bodega Central, Proyecto Masaya"
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Ciudad / Departamento *
                        </label>
                        <select
                          value={nuevaCiudad}
                          onChange={(e) => setNuevaCiudad(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                        >
                          <option value="Managua">Managua</option>
                          <option value="Masaya">Masaya</option>
                          <option value="Granada">Granada</option>
                          <option value="León">León</option>
                          <option value="Carazo">Carazo</option>
                          <option value="Chinandega">Chinandega</option>
                          <option value="Matagalpa">Matagalpa</option>
                          <option value="Estelí">Estelí</option>
                          <option value="Rivas">Rivas</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Dirección Exacta *
                      </label>
                      <input
                        type="text"
                        required
                        value={nuevaDireccion}
                        onChange={(e) => setNuevaDireccion(e.target.value)}
                        placeholder="Ej. De la rotonda El Güegüense 2c abajo, 1c al lago"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Puntos de Referencia Tradicionales (Nicaragua)
                      </label>
                      <textarea
                        rows={2}
                        value={nuevaReferencia}
                        onChange={(e) => setNuevaReferencia(e.target.value)}
                        placeholder="Ej. Portón negro frente a pulpería La Bendición, casa con muro perimetral"
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500"
                      />
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nuevaPredeterminada}
                          onChange={(e) => setNuevaPredeterminada(e.target.checked)}
                          className="rounded text-amber-600"
                        />
                        Marcar como dirección predeterminada
                      </label>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setMostrarModalDireccion(false)}
                          className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-lg"
                        >
                          Guardar Dirección
                        </button>
                      </div>
                    </div>
                  </form>
                </div>
              )}

              {/* Lista de Direcciones */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {direcciones.map((dir) => (
                  <div
                    key={dir.id}
                    className={`bg-white rounded-xl border p-5 relative transition-all ${
                      dir.predeterminada
                        ? 'border-amber-500 ring-1 ring-amber-500 shadow-xs'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4 text-amber-600" />
                        <span className="font-black text-sm text-slate-900">{dir.alias}</span>
                      </div>
                      {dir.predeterminada && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
                          Predeterminada
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-700 font-medium leading-relaxed">
                      {dir.direccion}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{dir.ciudad}, Nicaragua</p>

                    {dir.referencia && (
                      <div className="mt-3 p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600">
                        <span className="font-bold text-slate-700 block">Referencia:</span>
                        {dir.referencia}
                      </div>
                    )}

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      {!dir.predeterminada ? (
                        <button
                          type="button"
                          onClick={() => setDireccionPredeterminada(dir.id)}
                          className="text-amber-600 hover:text-amber-700 font-bold cursor-pointer"
                        >
                          Hacer predeterminada
                        </button>
                      ) : (
                        <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                          <Check className="w-3.5 h-3.5" /> Activa para checkout
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => eliminarDireccion(dir.id)}
                        className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors"
                        title="Eliminar dirección"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PESTAÑA 3: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-900">Datos Personales y Fiscales</h2>
                <p className="text-xs text-slate-500">
                  Información para comprobantes de pago y contacto en Managua.
                </p>
              </div>

              {perfilGuardado && (
                <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Perfil actualizado con éxito en la sesión de cliente.
                </div>
              )}

              <form onSubmit={handleGuardarPerfil} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Nombre Completo *
                    </label>
                    <input
                      type="text"
                      required
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Correo Electrónico (Solo Lectura)
                    </label>
                    <input
                      type="email"
                      disabled
                      value={cliente.email}
                      className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Teléfono Móvil
                    </label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      placeholder="+505 8888-0000"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      RUC / Cédula Fiscal (Para Retenciones/Facturas)
                    </label>
                    <input
                      type="text"
                      value={codigoFiscal}
                      onChange={(e) => setCodigoFiscal(e.target.value)}
                      placeholder="J031000000123"
                      className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200 flex justify-end">
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition-colors cursor-pointer"
                  >
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
