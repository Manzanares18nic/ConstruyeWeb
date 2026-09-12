import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import {
  obtenerProductos,
  obtenerCategorias,
  obtenerMarcas,
} from '@/lib/api';
import {
  Wrench,
  Sparkles,
  SlidersHorizontal,
  X,
  Layers,
  ChevronRight,
} from 'lucide-react';

interface HomePageProps {
  searchParams: Promise<{
    categoria?: string;
    marca?: string;
    buscar?: string;
    pagina?: string;
  }>;
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const resolvedParams = await searchParams;
  const categoriaFiltro = resolvedParams.categoria;
  const marcaFiltro = resolvedParams.marca;
  const buscarFiltro = resolvedParams.buscar;
  const pagina = resolvedParams.pagina ? parseInt(resolvedParams.pagina, 10) : 1;

  // Obtenemos datos desde el cliente de API (con fallback transparente a Mocks)
  const [productosData, categorias, marcas] = await Promise.all([
    obtenerProductos({
      categoria: categoriaFiltro,
      marca: marcaFiltro,
      buscar: buscarFiltro,
      pagina,
      por_pagina: 12,
    }),
    obtenerCategorias(),
    obtenerMarcas(),
  ]);

  const hayFiltrosActivos = Boolean(categoriaFiltro || marcaFiltro || buscarFiltro);

  return (
    <div className="pb-16">
      {/* Hero Banner Ferretero (Solo en la portada sin filtros) */}
      {!hayFiltrosActivos && (
        <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-800 text-white py-12 md:py-16 border-b border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Ferretería Construye en Línea
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
                Herramientas y Materiales para Proyectos Reales
              </h1>
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                Catálogo conectado con stock en tiempo real en nuestra bodega central de Managua.
                Herramientas de uso rudo, tornillería por mayor y acabados de primera calidad.
              </p>
              <div className="pt-2 flex flex-wrap items-center gap-3">
                <Link
                  href="/?categoria=herramientas-electricas"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-sm transition-colors inline-flex items-center gap-2"
                >
                  <Wrench className="w-4 h-4" /> Ver Herramientas Eléctricas
                </Link>
                <Link
                  href="/?categoria=herramientas-manuales"
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold rounded-lg text-sm transition-colors border border-slate-700"
                >
                  Herramientas Manuales
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Barra de Marcas Principales */}
      <section className="bg-white border-b border-slate-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 shrink-0">
              Marcas Destacadas:
            </span>
            <div className="flex items-center gap-3">
              {marcas.map((m) => {
                const isActive = marcaFiltro?.toLowerCase() === m.slug.toLowerCase();
                return (
                  <Link
                    key={m.id}
                    href={
                      isActive
                        ? '/'
                        : `/?marca=${encodeURIComponent(m.slug)}${categoriaFiltro ? `&categoria=${encodeURIComponent(categoriaFiltro)}` : ''}`
                    }
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all border shrink-0 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-white'
                    }`}
                  >
                    {m.nombre}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Contenido Principal: Categorías y Rejilla de Productos */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Cabecera del catálogo y filtros activos */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2">
              <Layers className="w-6 h-6 text-amber-500" />
              {categoriaFiltro
                ? `Categoría: ${categoriaFiltro.replace(/-/g, ' ')}`
                : buscarFiltro
                ? `Búsqueda: "${buscarFiltro}"`
                : marcaFiltro
                ? `Marca: ${marcaFiltro.toUpperCase()}`
                : 'Catálogo General de Productos'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Mostrando {productosData.resultados.length} de {productosData.total} productos disponibles
            </p>
          </div>

          {/* Chips de filtros activos */}
          {hayFiltrosActivos && (
            <div className="flex flex-wrap items-center gap-2">
              {buscarFiltro && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-medium">
                  Búsqueda: {buscarFiltro}
                </span>
              )}
              {categoriaFiltro && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-medium">
                  {categoriaFiltro}
                </span>
              )}
              {marcaFiltro && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-medium uppercase">
                  {marcaFiltro}
                </span>
              )}
              <Link
                href="/"
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Limpiar filtros
              </Link>
            </div>
          )}
        </div>

        {/* Layout de dos columnas: Categorías laterales + Productos */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Barra lateral de Categorías */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 mb-4 pb-2 border-b border-slate-100">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                Departamentos
              </div>
              <ul className="space-y-1 text-sm">
                <li>
                  <Link
                    href="/"
                    className={`block px-3 py-2 rounded-lg font-medium transition-colors ${
                      !categoriaFiltro
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    Todos los departamentos
                  </Link>
                </li>
                {categorias.map((cat) => {
                  const isActive = categoriaFiltro === cat.slug;
                  return (
                    <li key={cat.id}>
                      <Link
                        href={`/?categoria=${encodeURIComponent(cat.slug)}`}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                        }`}
                      >
                        <span>{cat.nombre}</span>
                        {cat.hijas.length > 0 && (
                          <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                        )}
                      </Link>

                      {/* Subcategorías hijas si existen */}
                      {cat.hijas.length > 0 && (
                        <ul className="ml-4 mt-1 pl-2 border-l-2 border-slate-200 space-y-1">
                          {cat.hijas.map((hija) => (
                            <li key={hija.id}>
                              <Link
                                href={`/?categoria=${encodeURIComponent(hija.slug)}`}
                                className={`block px-2 py-1 text-xs rounded transition-colors ${
                                  categoriaFiltro === hija.slug
                                    ? 'text-amber-600 font-bold'
                                    : 'text-slate-500 hover:text-slate-900'
                                }`}
                              >
                                {hija.nombre}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          </aside>

          {/* Rejilla de Productos */}
          <div className="lg:col-span-3">
            {productosData.resultados.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                {productosData.resultados.map((prod) => (
                  <ProductCard key={prod.id} producto={prod} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
                <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Wrench className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  No se encontraron productos
                </h3>
                <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
                  No encontramos artículos que coincidan con los criterios seleccionados. Intenta con otra palabra clave o categoría.
                </p>
                <Link
                  href="/"
                  className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-sm transition-colors inline-block"
                >
                  Ver todo el catálogo
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
