'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  ArrowRight,
  Truck,
  Store,
  ShieldCheck,
  Bot,
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
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=1600&q=80',
    tag: '⚡ LÍNEA INALÁMBRICA 20V MAX',
    titulo: 'Potencia y Precisión para Tu Próximo Proyecto',
    subtitulo:
      'Taladros percutores, rotomartillos y esmeriladoras con garantía directa de fábrica y stock disponible en Managua.',
    botonTexto: 'Comprar Ahora',
    botonHref: '/catalogo?categoria=herramientas-electricas',
    botonSecundarioTexto: 'Ver Catálogo Completo',
    botonSecundarioHref: '/catalogo',
  },
  {
    id: 2,
    imagen:
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=1600&q=80',
    tag: '🔨 DISTRIBUIDOR OFICIAL STANLEY & TRUPER',
    titulo: 'Herramientas Profesionales para Trabajo Pesado',
    subtitulo:
      'Martillos de uña, juegos de llaves combinadas, niveles y alicates forjados para máxima resistencia continua en obra.',
    botonTexto: 'Ver Herramientas Manuales',
    botonHref: '/categorias/herramientas-manuales',
    botonSecundarioTexto: 'Ver Promociones',
    botonSecundarioHref: '/catalogo',
  },
  {
    id: 3,
    imagen:
      'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=1600&q=80',
    tag: '🎨 PINTURAS Y ACABADOS ARQUITECTÓNICOS',
    titulo: 'Color, Protección e Impermeabilización de Calidad',
    subtitulo:
      'Selladores estructurales Sika, pinturas lavables y accesorios profesionales para transformar cualquier espacio.',
    botonTexto: 'Ver Pinturas y Acabados',
    botonHref: '/categorias/pinturas-acabados',
    botonSecundarioTexto: 'Asesoría Don Carlos AI',
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
    <div className="space-y-6 pt-2">
      {/* 1. Barra de Chips / Tendencias Rápidas (Estilo Ace Hardware) */}
      <div className="border-b border-slate-200 bg-white py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            {/* Tag de Alerta / Temporada (Borde rojo, fondo blanco, texto rojo como Ace Hardware) */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border-2 border-red-500 text-red-600 text-xs font-black tracking-wide shrink-0 shadow-2xs">
              <Flame className="w-4 h-4 text-red-600 fill-red-500" />
              <span>DÍAS DE CONSTRUCCIÓN</span>
            </div>

            {/* Botón de Ofertas en rojo sólido estilo Ace Hardware */}
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs font-black shrink-0 transition-colors shadow-2xs"
            >
              <span>Ofertas y Especiales</span>
            </Link>

            {/* Chips de categorías limpias en blanco */}
            {CHIPS_TENDENCIAS.map((chip, idx) => (
              <Link
                key={idx}
                href={chip.href}
                className="px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold whitespace-nowrap transition-colors border border-slate-300 hover:border-slate-400 shrink-0 shadow-2xs"
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
          {/* Columna Izquierda: Carrusel Principal (Luminoso, fondo claro, estilo Ace Hardware) */}
          <div
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            className="lg:col-span-8 relative rounded-2xl overflow-hidden shadow-sm border border-slate-200 min-h-[380px] sm:min-h-[440px] flex flex-col justify-end group bg-slate-100"
          >
            {/* Imágenes del carrusel a plena luz del día */}
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
                {/* Degradado suave localizado solo a la izquierda para contraste del texto sin oscurecer la foto */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
              </div>
            ))}

            {/* Contenido de texto del Slide activo */}
            <div className="relative z-10 p-6 sm:p-10 md:p-12 space-y-4 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#fe5722] text-white text-xs font-black tracking-wider uppercase shadow-md">
                {SLIDES[slideActual].tag}
              </span>

              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                {SLIDES[slideActual].titulo}
              </h2>

              <p className="text-white text-xs sm:text-sm md:text-base leading-relaxed max-w-xl drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)] font-medium">
                {SLIDES[slideActual].subtitulo}
              </p>

              {/* Botón blanco destacado con texto en color de marca, idéntico a Ace Hardware SHOP NOW */}
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href={SLIDES[slideActual].botonHref}
                  className="px-6 py-3 bg-white hover:bg-slate-50 text-[#fe5722] font-black rounded-lg text-xs sm:text-sm transition-all inline-flex items-center gap-2 shadow-xl hover:scale-105 transform cursor-pointer uppercase tracking-wider"
                >
                  <span>{SLIDES[slideActual].botonTexto}</span>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                </Link>

                {SLIDES[slideActual].botonSecundarioTexto && (
                  <Link
                    href={SLIDES[slideActual].botonSecundarioHref || '/catalogo'}
                    className="px-5 py-3 bg-black/40 hover:bg-black/60 text-white font-bold rounded-lg text-xs sm:text-sm transition-colors border border-white/40 backdrop-blur-xs shadow-md"
                  >
                    {SLIDES[slideActual].botonSecundarioTexto}
                  </Link>
                )}
              </div>
            </div>

            {/* Flechas Circulares Blancas estilo Ace Hardware */}
            <button
              type="button"
              onClick={anteriorSlide}
              aria-label="Slide anterior"
              className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white hover:bg-slate-100 text-red-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 shadow-xl border border-slate-200 cursor-pointer hover:scale-110"
            >
              <ChevronLeft className="w-6 h-6 stroke-[3]" />
            </button>
            <button
              type="button"
              onClick={siguienteSlide}
              aria-label="Slide siguiente"
              className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white hover:bg-slate-100 text-red-600 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 z-20 shadow-xl border border-slate-200 cursor-pointer hover:scale-110"
            >
              <ChevronRight className="w-6 h-6 stroke-[3]" />
            </button>

            {/* Indicadores / Dots de posición estilo Ace Hardware */}
            <div className="absolute bottom-4 right-6 sm:bottom-6 sm:right-10 z-20 flex items-center gap-2 bg-black/30 backdrop-blur-xs px-3 py-1.5 rounded-full">
              <button
                type="button"
                onClick={() => setIsPaused(!isPaused)}
                aria-label={isPaused ? 'Reanudar carrusel' : 'Pausar carrusel'}
                className="text-white/80 hover:text-white p-0.5 transition-colors mr-1"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
              </button>
              {SLIDES.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => irASlide(idx)}
                  aria-label={`Ir al slide ${idx + 1}`}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    slideActual === idx ? 'w-7 bg-red-500' : 'w-2 bg-white/70 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Columna Derecha: Tarjeta Promo Clara (Estilo Toro / Ace Hardware) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col justify-between p-6 relative group hover:border-[#fe5722]/50 transition-all">
            <div className="space-y-4">
              <div className="relative aspect-4/3 w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200/80">
                <Image
                  src="https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?auto=format&fit=crop&w=800&q=80"
                  alt="Herramientas DeWalt 20V Max"
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Insignia de Marca roja en la esquina superior izquierda idéntica a Ace Hardware (TORO) */}
                <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-[11px] px-2.5 py-1 rounded-sm uppercase tracking-wider shadow-sm">
                  DEWALT 20V
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-700 rounded-sm">
                    OFERTA DESTACADA
                  </span>
                  <span className="text-xs text-red-600 font-bold">Hasta 20% OFF</span>
                </div>
                <h3 className="font-black text-lg text-slate-900 leading-snug group-hover:text-[#fe5722] transition-colors">
                  Combo Taladro Percutor + Set de 100 Brocas
                </h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                  Motor sin carbones de alta eficiencia y batería de litio de larga duración para contratistas y talleres.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">Precio Especial</span>
                <div className="flex items-baseline gap-2">
                  <span className="font-mono font-black text-xl text-slate-900">C$ 3,499.00</span>
                  <span className="text-xs text-slate-400 line-through">C$ 4,200</span>
                </div>
              </div>
              <Link
                href="/catalogo?buscar=taladro"
                className="px-4 py-2 bg-[#fe5722] hover:bg-[#e04a1b] text-white font-black text-xs rounded-lg transition-all inline-flex items-center gap-1.5 shadow-sm"
              >
                <span>Ver Oferta</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Franja Institucional de Confianza (Fondo claro y luminoso, estilo Ace Hardware) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-100/90 border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <div className="flex items-center gap-3 pt-2 md:pt-0">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#fe5722] border border-orange-200 shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900">Envío Gratis Managua</h4>
                <p className="text-[11px] text-slate-600 font-medium">En compras mayores a C$ 1,500</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-0 md:pl-6 pt-2 md:pt-0">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#fe5722] border border-orange-200 shrink-0">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900">Retiro Inmediato</h4>
                <p className="text-[11px] text-slate-600 font-medium">Bodega Km 4.5 Carr. Norte</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-0 md:pl-6 pt-2 md:pt-0">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#fe5722] border border-orange-200 shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900">Garantía Original</h4>
                <p className="text-[11px] text-slate-600 font-medium">Stanley, DeWalt, Truper, Bosch</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pl-0 md:pl-6 pt-2 md:pt-0">
              <div className="p-2.5 rounded-xl bg-orange-100 text-[#fe5722] border border-orange-200 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-black text-xs sm:text-sm text-slate-900">Asesor Don Carlos AI</h4>
                <p className="text-[11px] text-slate-600 font-medium">Cálculo de materiales 24/7</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
