'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  X,
  Send,
  Wrench,
  Sparkles,
  Bot,
  ShoppingCart,
  Check,
  RotateCcw,
  HardHat,
  ChevronDown,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { ToolMaterialItem, CalculationResult } from '@/lib/agentTools';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  proposal?: CalculationResult | null;
  productsFound?: Array<{
    id: number;
    codigo_producto: string;
    nombre: string;
    marca: string;
    precio_con_iva: number;
    stock: number;
    imagen?: string;
    slug: string;
  }> | null;
  model?: string;
}

export default function AIAssistant() {
  const { addToCart, openCart, isCartOpen } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [agregadosMap, setAgregadosMap] = useState<Record<string, boolean>>({});

  // Si el panel lateral del carrito se abre, cerramos la ventana del asistente para evitar superposición
  useEffect(() => {
    if (isCartOpen) {
      setIsOpen(false);
    }
  }, [isCartOpen]);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content:
        '¡Hola! Soy Don Carlos, tu Asesor Técnico de Ferretería Construye. Puedo calcularte materiales para construcción, pintura, o recomendarte las herramientas precisas para tu proyecto. ¿Qué tienes en mente hoy?',
      model: 'Motor Experto Ferretero',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input.trim();
    if (!query || loading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
    };

    setMessages((prev) => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (!res.ok) throw new Error('Error al consultar agente');

      const data = await res.json();

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: data.content,
        proposal: data.proposal,
        productsFound: data.productsFound,
        model: data.model,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content:
            'Disculpa, hubo un problema al conectar con el motor de cálculo. Por favor inténtalo de nuevo.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddProposalToCart = (proposalId: string, items: ToolMaterialItem[]) => {
    // Añadir cada ítem de la cotización al carrito real de la tienda
    items.forEach((item) => {
      addToCart(
        {
          id: item.id,
          codigo_producto: item.codigo_producto,
          nombre: item.nombre,
          marca: item.marca,
          categoria: item.categoria || 'Ferretería general',
          precio_con_iva: item.precio_unitario,
          imagen_principal: item.imagen_principal || '',
          slug: item.slug,
          disponible: true,
        },
        item.cantidad
      );
    });

    setAgregadosMap((prev) => ({ ...prev, [proposalId]: true }));
    // Cerramos el asistente de IA para que el drawer lateral del carrito tenga todo el protagonismo
    setIsOpen(false);
  };

  return (
    <>
      {/* Botón Flotante en la esquina inferior derecha */}
      <div className="fixed bottom-6 right-6 z-40">
        {!isOpen && (
          <button
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-3 px-5 py-3.5 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-2xl border-2 border-amber-400 hover:scale-105 transition-all duration-200 group cursor-pointer"
            aria-label="Abrir asesor técnico de IA"
          >
            <div className="relative">
              <HardHat className="w-6 h-6 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full" />
            </div>
            <div className="text-left">
              <span className="block text-xs sm:text-sm font-black tracking-wide uppercase">
                Asesor Técnico IA
              </span>
              <span className="block text-xs text-amber-400 font-medium">
                Calcula tus materiales
              </span>
            </div>
          </button>
        )}
      </div>

      {/* Ventana de Chat Flotante — Más amplia y con tipografía legible */}
      {isOpen && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 w-[calc(100vw-2rem)] sm:w-[560px] md:w-[620px] h-[720px] max-h-[88vh] bg-white rounded-2xl shadow-2xl border border-slate-300 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
          {/* Encabezado del Asistente */}
          <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-amber-500/30">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                <HardHat className="w-7 h-7" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-black text-base sm:text-lg text-white">Don Carlos</h3>
                  <span className="text-[11px] sm:text-xs bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded-md">
                    IA Ferretera
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                  Ferretería Construye · Cálculos técnicos y cotizaciones
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() =>
                  setMessages([
                    {
                      id: 'welcome',
                      role: 'assistant',
                      content:
                        '¡Listo! Memoria reiniciada. ¿Qué otro proyecto o cálculo necesitas realizar?',
                    },
                  ])
                }
                title="Reiniciar chat"
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                aria-label="Cerrar asistente"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                {/* Burbuja de Texto */}
                <div
                  className={`max-w-[90%] rounded-2xl p-4 text-sm sm:text-base leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-amber-500 text-slate-950 font-semibold rounded-br-xs shadow-xs'
                      : 'bg-white text-slate-850 border border-slate-200 rounded-bl-xs shadow-xs'
                  }`}
                >
                  <p className="whitespace-pre-line">{msg.content}</p>

                  {/* Etiqueta de modelo utilizado */}
                  {msg.model && msg.role === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        {msg.model}
                      </span>
                    </div>
                  )}
                </div>

                {/* Tarjeta de Cotización / Materiales Calculados */}
                {msg.proposal && (
                  <div className="mt-3 w-full bg-white rounded-xl border-2 border-amber-300/80 p-4 sm:p-5 shadow-sm space-y-3.5">
                    <div className="flex items-start justify-between border-b border-slate-100 pb-2.5">
                      <div>
                        <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md uppercase tracking-wider">
                          Cotización Técnica de Materiales
                        </span>
                        <h4 className="text-sm sm:text-base font-black text-slate-900 mt-1.5">
                          {msg.proposal.proyecto}
                        </h4>
                        <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-0.5">
                          Dimensiones: {msg.proposal.dimensiones}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/70">
                      {msg.proposal.explicacion}
                    </p>

                    {/* Lista de Ítems */}
                    <div className="divide-y divide-slate-200 border-y border-slate-200 py-1 space-y-1">
                      {msg.proposal.items.map((item) => (
                        <div
                          key={item.id}
                          className="py-2 flex items-center justify-between gap-3 text-xs sm:text-sm"
                        >
                          <div className="flex items-center gap-3 min-w-0 pr-2">
                            <div className="relative w-12 h-12 rounded-lg bg-slate-100 border border-slate-200 shrink-0 overflow-hidden">
                              {item.imagen_principal && (
                                <Image
                                  src={item.imagen_principal}
                                  alt=""
                                  fill
                                  className="object-cover"
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate text-xs sm:text-sm">
                                {item.nombre}
                              </p>
                              <p className="text-xs text-slate-500 font-mono">
                                {item.cantidad} unidades × C$ {item.precio_unitario.toFixed(2)}
                              </p>
                            </div>
                          </div>
                          <span className="font-mono font-black text-slate-900 text-xs sm:text-sm shrink-0">
                            C$ {item.subtotal.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Total y Acción */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50/50 p-3 rounded-xl border border-amber-200/60">
                      <div>
                        <span className="text-xs text-slate-500 block font-medium">Total Estimado con IVA:</span>
                        <span className="font-mono font-black text-base sm:text-xl text-slate-950">
                          C${' '}
                          {msg.proposal.totalEstimado.toLocaleString('es-NI', {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() =>
                          handleAddProposalToCart(msg.id, msg.proposal!.items)
                        }
                        className={`w-full sm:w-auto px-5 py-3 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer ${
                          agregadosMap[msg.id]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950'
                        }`}
                      >
                        {agregadosMap[msg.id] ? (
                          <>
                            <Check className="w-4 h-4" />
                            <span>¡Agregados al Carrito!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Añadir al Carrito</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Indicador de cálculo en progreso */}
            {loading && (
              <div className="flex items-center gap-3 p-3.5 bg-white rounded-xl border border-slate-200 text-xs sm:text-sm text-slate-700 animate-pulse w-fit shadow-xs">
                <Wrench className="w-4 h-4 text-amber-500 animate-spin" />
                <span>Don Carlos está calculando materiales con IA y consultando inventario...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Sugerencias Rápidas */}
          <div className="px-3 py-2.5 bg-slate-100 border-t border-slate-200 overflow-x-auto flex gap-2">
            <button
              onClick={() =>
                handleSend('Quiero calcular materiales para una pared de 4x3 metros')
              }
              className="text-xs font-semibold bg-white hover:bg-amber-100 text-slate-800 hover:text-amber-950 border border-slate-300 rounded-full px-3.5 py-1.5 whitespace-nowrap transition-colors"
            >
              🧱 Pared de 4x3m
            </button>
            <button
              onClick={() =>
                handleSend('¿Cuánta pintura necesito para un cuarto de 4x4 metros?')
              }
              className="text-xs font-semibold bg-white hover:bg-amber-100 text-slate-800 hover:text-amber-950 border border-slate-300 rounded-full px-3.5 py-1.5 whitespace-nowrap transition-colors"
            >
              🎨 Pintura cuarto 4x4m
            </button>
            <button
              onClick={() =>
                handleSend('Recomiéndame un kit básico de herramientas para el hogar')
              }
              className="text-xs font-semibold bg-white hover:bg-amber-100 text-slate-800 hover:text-amber-950 border border-slate-300 rounded-full px-3.5 py-1.5 whitespace-nowrap transition-colors"
            >
              🧰 Kit herramientas casa
            </button>
          </div>

          {/* Barra de Entrada de Texto */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 sm:p-4 bg-white border-t border-slate-200 flex items-center gap-2.5"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe a Don Carlos (ej: pared de 5x3m, pintar 20m²)..."
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="p-3 bg-amber-500 hover:bg-amber-600 disabled:bg-slate-200 text-slate-950 rounded-xl transition-colors shrink-0 cursor-pointer"
              aria-label="Enviar mensaje"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
