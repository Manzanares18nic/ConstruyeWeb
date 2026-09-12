'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Flame,
  ArrowRight,
  Truck,
  Store,
  ShieldCheck,
  Bot,
  Wrench,
  Layers,
  Pause,
  Play,
} from 'lucide-react';

interface Slide {
  id: number;
  imagen: string;
  tag: string;
  titulo: string;
  subtitulo: string;
  botonTexto: string;
  botonHref: string;
  botonSecundarioTexto?: string;
  botonSecundarioHref?: string;
}

const SLIDES: Slide[] = [
  {
    id: 1,
    imagen:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1600&q=80',
    tag: '⚡ NOVEDADES 2026 • EQUIPO INDUSTRIAL',
    titulo: 'Potencia y Rendimiento para Proyectos Reales',
    subtitulo:
      'Taladros percutores, rotomartillos y esmeriladoras DeWalt y Bosch con garantía oficial y stock en Managua.',
    botonTexto: 'Comprar Ahora',
    botonHref: '/catalogo?categoria=herramientas-electricas',
    botonSecundarioTexto: 'Ver Catálogo Completo',
    botonSecundarioHref: '/catalogo',
  },
  {
    id: 2,
    imagen:
      'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=1600&q=80',
    tag: '🔨 DISTRIBUIDOR OFICIAL STANLEY & TRUPER',
    titulo: 'Herramientas Manuales Forjadas para Uso Rudo',
    subtitulo:
      'Martillos de uña, juegos de llaves combinadas, niveles y alicates diseñados para resistencia continua en obra.',
    botonTexto: 'Explorar Herramientas Manuales',
    botonHref: '/categorias/herramientas-manuales',
    botonSecundarioTexto: 'Ver Promociones',
    botonSecundarioHref: '/catalogo',
  },
  {
    id: 3,
    imagen:
      'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=1600&q=80',
    tag: '🏗️ PRECIOS POR MAYOR PARA CONTRATISTAS',
    titulo: 'Tornillería, Fijaciones y Pinturas Arquitectónicas',
    subtitulo:
      'Suministros estructurales, selladores Sika y acabados de alta resistencia con despacho inmediato en Managua.',
    botonTexto: 'Ver Fijaciones y Acabados',
    botonHref: '/categorias/tornilleria',
    botonSecundarioTexto: 'Hablar con Don Carlos',
    botonSecundarioHref: '/catalogo',
  },
];

const CHIPS_TENDENCIAS = [
  { label: 'Taladros Inalámbricos 20V', href: '/catalogo?buscar=taladro' },
  { label: 'Sierras y Esmeriles', href: '/catalogo?buscar=esmeriladora' },
  { label: 'Juegos de Brocas', href: '/catalogo?buscar=brocas' },
  { label: 'Tornillos y Pernos', href: '/categorias/tornilleria' },
  { label: 'Herramientas Manuales', href: '/categorias/herramientas-manuales' },
  { label: 'Pinturas y Brochas', href: '/categorias/pinturas-acabados' },
  { label: 'Plomería y Tuberías', href: '/categorias/plomeria-tuberias' },
];

export default function HomeHeroBanner() {
  const [slideActual, setSlideActual] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-avance de slides cada 6 segundos
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setSlideActual((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const irASlide = (idx: number) => {
    setSlideActual(idx);
  };

  const anteriorSlide = () => {
    setSlideActual((prev) => (prev > 0 ? prev - 1 : SLIDES.length - 1));
  };

  const siguienteSlide = () => {
    setSlideActual((prev) => (prev < SLIDES.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-6">
      {/* 1. Barra de Chips / Tendencias Rápidas (Estilo Ace Hardware) */}
      <div className="border-b border-slate-200 bg-white py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Tag de Alerta / Temporada */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-black uppercase tracking-wider shrink-0 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-red-600 animate-pulse" />
              <span>OFERTAS DE TEMPORADA</span>
            </div>

            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black shrink-0 transition-colors shadow-2xs"
            >
              <span>Promociones Especiales</span>
            </Link>

            {/* Chips de productos populares */}
            {CHIPS_TENDENCIAS.map((chip, idx) => (
              <Link
                key={idx}
                href={chip.href}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors border border-slate-200 shrink-0"
              >
                {chip.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Grid de Banners Principales (2 Columnas: 70% Carrusel + 30% Promo Lateral) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Columna Izquierda: Carrusel Principal */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="lg:col-span-8 relative rounded-3xl overflow-hidden shadow-lg border border-slate-200 min-h-[380px] sm:min-h-[460px] flex flex-col justify-end group bg-slate-950"
          >
            {/* Imágenes del carrusel con fundido cruzado */}
            {SLIDES.map((slide, index) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === slideActual ? 'opacity-100 z-0' : 'opacity-0 -z-10 pointer-events-none'
                }`}
              >
                <Image
                  src={slide.imagen}
                  alt={slide.titulo}
                  fill
                  priority={index === 0}
                  className="object-cover"
                />
                {/* Degradado para máxima legibilidad del texto */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/65 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 via-transparent to-transparent" />
              </div>
            ))}

            {/* Contenido de texto del Slide activo */}
            <div className="relative z-10 p-6 sm:p-10 md:p-12 space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-black tracking-wider uppercase shadow-xs">
                {SLIDES[slideActual].tag}
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-md">
                {SLIDES[slideActual].titulo}
              </h2>

              <p className="text-slate-200 text-xs sm:text-sm md:text-base leading-relaxed max-w-xl drop-shadow-sm">
                {SLIDES[slideActual].subtitulo}
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={SLIDES[slideActual].botonHref}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-full text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-md hover:scale-105 transform cursor-pointer"
                >
                  <span>{SLIDES[slideActual].botonTexto}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                {SLIDES[slideActual].botonSecundarioTexto && (
                  <Link
                    href={SLIDES[slideActual].botonSecundarioHref || '/catalogo'}
                    className="px-5 py-3 bg-slate-900/80 hover:bg-slate-900 text-white font-bold rounded-full text-xs sm:text-sm transition-colors border border-slate-700 backdrop-blur-xs"
                  >
                    {SLIDES[slideActual].botonSecundarioTexto}
                  </Link>
                )}
              </div>
            </div>

            {/* Flechas de Navegación del Carrusel */}
            <button
              type="button"
              onClick={anteriorSlide}
              aria-label="Slide anterior"
              className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 shadow-md cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={siguienteSlide}
              aria-label="Slide siguiente"
              className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 hover:bg-white text-slate-900 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 shadow-md cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores / Dots de posición */}
            <div className="absolute bottom-4 right-6 sm:bottom-6 sm:right-10 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? 'Reanudar carrusel' : 'Pausar carrusel'}
                className="text-white/70 hover:text-white p-1 transition-colors mr-1"
              >
                {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
              </button>
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => irASlide(idx)}
                  aria-label={`Ir al slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    slideActual === idx ? 'w-8 bg-amber-400' : 'w-2 bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Promo Destacada (Estilo Ace Hardware) */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between p-6 sm:p-7 relative group hover:border-amber-400 transition-all">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-950 text-[11px] font-black uppercase tracking-wider rounded-md">
                  Destacado de la Semana
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">DeWalt 20V Max</span>
              </div>

              <div className="relative aspect-4/3 w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-200/80">
                <Image
                  src="https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80"
                  alt="Herramientas DeWalt 20V"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-2.5 py-1 rounded-md uppercase tracking-wider shadow-xs">
                  Hasta 20% OFF
                </div>
              </div>

              <div>
                <h3 className="font-black text-lg text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                  Combo Taladro Percutor + Brocas de Alto Impacto
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  El kit más vendido para contratistas y talleres. Potencia sin carbones y máxima durabilidad.
                </p>
              </div>
            </div>

            <div className="pt-5 border-t border-slate-100 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Precio Promocional</span>
                <span className="font-mono font-black text-xl text-slate-900">C$ 3,499.00</span>
              </div>
              <Link
                href="/productos/taladro-percutor-20v-dewalt"
                className="px-4 py-2 bg-slate-950 hover:bg-amber-500 hover:text-slate-950 text-white font-bold text-xs rounded-xl transition-all inline-flex items-center gap-1.5 shadow-xs"
              >
                <span>Ver Oferta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Cinta Institucional de Confianza (Estilo Ace Hardware) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-xs border border-slate-800">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-800">
            <div className="flex items-center gap-3 pt-2 md:pt-0">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">Envío Gratis Managua</h4>
                <p className="text-[11px] text-slate-400">En compras mayores a C$ 1,500</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-0 md:pl-6 pt-2 md:pt-0">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">Retiro Inmediato</h4>
                <p className="text-[11px] text-slate-400">Bodega Km 4.5 Carr. Norte</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-0 md:pl-6 pt-2 md:pt-0">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">Garantía Original</h4>
                <p className="text-[11px] text-slate-400">Stanley, DeWalt, Truper, Bosch</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-0 md:pl-6 pt-2 md:pt-0">
              <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-white">Asesor Don Carlos AI</h4>
                <p className="text-[11px] text-slate-400">Cálculo de materiales 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
