'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Filter,
  SlidersHorizontal,
  Grid,
  List,
  Search,
  X,
  ChevronDown,
  Layers,
  Wrench,
  Check,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ArrowUpDown,
} from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import { ProductoResumen, Categoria, Marca } from '@/types/api';

interface CatalogoClientProps {
  productosIniciales: ProductoResumen[];
  categorias: Categoria[];
  marcas: Marca[];
  categoriaInicial?: string;
  marcaInicial?: string;
  busquedaInicial?: string;
}

export default function CatalogoClient({
  productosIniciales,
  categorias,
  marcas,
  categoriaInicial,
  marcaInicial,
  busquedaInicial,
}: CatalogoClientProps) {
  // Estados de filtros
  const [busqueda, setBusqueda] = useState(busquedaInicial || '');
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>(categoriaInicial || '');
  const [marcasSeleccionadas, setMarcasSeleccionadas] = useState<string[]>(
    marcaInicial ? [marcaInicial.toLowerCase()] : []
  );
  const [precioMin, setPrecioMin] = useState<string>('');
  const [precioMax, setPrecioMax] = useState<string>('');
  const [soloEnStock, setSoloEnStock] = useState<boolean>(false);
  const [orden, setOrden] = useState<'relevancia' | 'precio_asc' | 'precio_desc' | 'nombre_asc'>('relevancia');
  const [vista, setVista] = useState<'grid' | 'list'>('grid');
  const [mostrarFiltrosMovil, setMostrarFiltrosMovil] = useState(false);

  // Conteo de productos por marca
  const conteoPorMarca = useMemo(() => {
    const mapa: Record<string, number> = {};
    productosIniciales.forEach((p) => {
      const m = p.marca.toLowerCase();
      mapa[m] = (mapa[m] || 0) + 1;
    });
    return mapa;
  }, [productosIniciales]);

  // Filtrado y ordenamiento en cliente
  const productosFiltrados = useMemo(() => {
    return productosIniciales
      .filter((p) => {
        // Búsqueda por texto
        if (busqueda.trim()) {
          const query = busqueda.toLowerCase().trim();
          const coincideNombre = p.nombre.toLowerCase().includes(query);
          const coincideMarca = p.marca.toLowerCase().includes(query);
          const coincideCodigo = p.codigo_producto.toLowerCase().includes(query);
          if (!coincideNombre && !coincideMarca && !coincideCodigo) return false;
        }

        // Filtro por categoría
        if (categoriaSeleccionada) {
          const catNorm = categoriaSeleccionada.toLowerCase().replace(/-/g, ' ');
          const prodCatNorm = p.categoria.toLowerCase();
          if (!prodCatNorm.includes(catNorm) && !catNorm.includes(prodCatNorm)) {
            return false;
          }
        }

        // Filtro por marcas
        if (marcasSeleccionadas.length > 0) {
          const matchMarca = marcasSeleccionadas.some(
            (m) => p.marca.toLowerCase() === m.toLowerCase() || p.marca.toLowerCase().includes(m.toLowerCase())
          );
          if (!matchMarca) return false;
        }

        // Filtro por precio mínimo
        if (precioMin !== '') {
          const min = parseFloat(precioMin);
          if (!isNaN(min) && p.precio_con_iva < min) return false;
        }

        // Filtro por precio máximo
        if (precioMax !== '') {
          const max = parseFloat(precioMax);
          if (!isNaN(max) && p.precio_con_iva > max) return false;
        }

        // Filtro solo en stock
        if (soloEnStock && !p.disponible) return false;

        return true;
      })
      .sort((a, b) => {
        if (orden === 'precio_asc') return a.precio_con_iva - b.precio_con_iva;
        if (orden === 'precio_desc') return b.precio_con_iva - a.precio_con_iva;
        if (orden === 'nombre_asc') return a.nombre.localeCompare(b.nombre);
        return 0; // Relevancia / orden original
      });
  }, [
    productosIniciales,
    busqueda,
    categoriaSeleccionada,
    marcasSeleccionadas,
    precioMin,
    precioMax,
    soloEnStock,
    orden,
  ]);

  const toggleMarca = (slug: string) => {
    const slugNorm = slug.toLowerCase();
    setMarcasSeleccionadas((prev) =>
      prev.includes(slugNorm) ? prev.filter((m) => m !== slugNorm) : [...prev, slugNorm]
    );
  };

  const handleLimpiarFiltros = () => {
    setBusqueda('');
    setCategoriaSeleccionada('');
    setMarcasSeleccionadas([]);
    setPrecioMin('');
    setPrecioMax('');
    setSoloEnStock(false);
    setOrden('relevancia');
  };

  const hayFiltrosActivos =
    Boolean(busqueda) ||
    Boolean(categoriaSeleccionada) ||
    marcasSeleccionadas.length > 0 ||
    precioMin !== '' ||
    precioMax !== '' ||
    soloEnStock;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Cabecera del Catálogo */}
      <div className="mb-6 pb-6 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
            <Link href="/" className="hover:text-amber-600 transition-colors">
              Inicio
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Catálogo General</span>
          </nav>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <Layers className="w-7 h-7 text-amber-500" />
            Catálogo Ferretero Profesional
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Herramientas originales, fijaciones por mayor y suministros con stock físico en Managua.
          </p>
        </div>

        {/* Acciones de la Cabecera */}
        <div className="flex items-center gap-2.5 self-start md:self-auto">
          {/* Ordenamiento */}
          <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs shadow-xs">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <label htmlFor="ordenar-por" className="text-slate-500 font-medium">Ordenar:</label>
            <select
              id="ordenar-por"
              aria-label="Ordenar productos por"
              value={orden}
              onChange={(e) => setOrden(e.target.value as any)}
              className="bg-transparent font-bold text-slate-800 focus:outline-hidden cursor-pointer"
            >
              <option value="relevancia">Más Relevantes</option>
              <option value="precio_asc">Menor Precio</option>
              <option value="precio_desc">Mayor Precio</option>
              <option value="nombre_asc">Nombre A - Z</option>
            </select>
          </div>

          {/* Toggle Vista Grid/List */}
          <div className="hidden sm:flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
              onClick={() => setVista('grid')}
              aria-label="Vista en cuadrícula"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                vista === 'grid' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVista('list')}
              aria-label="Vista en lista"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                vista === 'list' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Botón Filtros Móvil */}
          <button
            onClick={() => setMostrarFiltrosMovil(!mostrarFiltrosMovil)}
            className="md:hidden flex items-center gap-2 px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold"
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filtros</span>
            {hayFiltrosActivos && (
              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* BARRA LATERAL DE FILTROS */}
        <aside
          className={`md:block ${
            mostrarFiltrosMovil ? 'block fixed inset-0 z-50 bg-white p-6 overflow-y-auto' : 'hidden'
          } md:static md:z-auto md:p-0`}
        >
          {mostrarFiltrosMovil && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200 md:hidden">
              <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" /> Filtros del Catálogo
              </h3>
              <button
                onClick={() => setMostrarFiltrosMovil(false)}
                className="p-1.5 rounded-lg bg-slate-100 text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="space-y-6">
            {/* Buscador Rápido */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Búsqueda Rápida
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Ej. Taladro, Broca, Truper..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-amber-500"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                {busqueda && (
                  <button
                    onClick={() => setBusqueda('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Filtro por Categorías */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Categorías
                </h4>
                {categoriaSeleccionada && (
                  <button
                    onClick={() => setCategoriaSeleccionada('')}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-bold"
                  >
                    Todas
                  </button>
                )}
              </div>

              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => setCategoriaSeleccionada('')}
                  className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                    categoriaSeleccionada === ''
                      ? 'bg-amber-500 text-slate-950 font-bold'
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Todas las Categorías
                </button>
                {categorias.map((cat) => {
                  const isSelected =
                    categoriaSeleccionada.toLowerCase() === cat.slug.toLowerCase();
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategoriaSeleccionada(cat.slug)}
                      className={`w-full text-left px-2.5 py-1.5 rounded-md font-medium transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span>{cat.nombre}</span>
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filtro por Marcas */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Marcas Ferreteras
              </h4>
              <div className="space-y-2 max-h-52 overflow-y-auto pr-1 text-xs">
                {marcas.map((m) => {
                  const isChecked = marcasSeleccionadas.includes(m.slug.toLowerCase());
                  const totalProd = conteoPorMarca[m.nombre.toLowerCase()] || 0;
                  return (
                    <label
                      key={m.id}
                      className="flex items-center justify-between gap-2 cursor-pointer py-1 px-1 rounded-md hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleMarca(m.slug)}
                          className="rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                        />
                        <span
                          className={`font-medium ${
                            isChecked ? 'text-slate-950 font-bold' : 'text-slate-700'
                          }`}
                        >
                          {m.nombre}
                        </span>
                      </div>
                      {totalProd > 0 && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono">
                          {totalProd}
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Filtro por Rango de Precio en Córdobas (C$) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                Rango de Precio (C$)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Mínimo</label>
                  <input
                    type="number"
                    value={precioMin}
                    onChange={(e) => setPrecioMin(e.target.value)}
                    placeholder="0"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block mb-1">Máximo</label>
                  <input
                    type="number"
                    value={precioMax}
                    onChange={(e) => setPrecioMax(e.target.value)}
                    placeholder="10000"
                    className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md font-mono text-xs focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>
            </div>

            {/* Filtro Solo en Stock */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
              <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={soloEnStock}
                  onChange={(e) => setSoloEnStock(e.target.checked)}
                  className="rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                />
                <span>Solo productos con stock en bodega</span>
              </label>
            </div>

            {/* Botón de Limpiar */}
            {hayFiltrosActivos && (
              <button
                type="button"
                onClick={handleLimpiarFiltros}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Limpiar Todos los Filtros
              </button>
            )}

            {mostrarFiltrosMovil && (
              <button
                type="button"
                onClick={() => setMostrarFiltrosMovil(false)}
                className="w-full py-2.5 bg-amber-500 text-slate-950 font-bold rounded-lg text-xs md:hidden"
              >
                Ver {productosFiltrados.length} Resultados
              </button>
            )}
          </div>
        </aside>

        {/* ÁREA DE RESULTADOS */}
        <section className="md:col-span-3 space-y-6">
          {/* Barra de Filtros Activos (Chips) */}
          {hayFiltrosActivos && (
            <div className="flex flex-wrap items-center gap-2 p-3 bg-slate-100 rounded-xl text-xs">
              <span className="font-bold text-slate-500">Filtros activos:</span>

              {busqueda && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-300 text-slate-800 font-medium">
                  Búsqueda: {busqueda}
                  <button onClick={() => setBusqueda('')} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {categoriaSeleccionada && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-medium">
                  Categoría: {categoriaSeleccionada}
                  <button onClick={() => setCategoriaSeleccionada('')} className="hover:text-amber-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {marcasSeleccionadas.map((m) => (
                <span
                  key={m}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-300 text-slate-800 font-medium"
                >
                  Marca: {m.toUpperCase()}
                  <button onClick={() => toggleMarca(m)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}

              {(precioMin || precioMax) && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-slate-300 text-slate-800 font-medium">
                  Precio: C$ {precioMin || '0'} - {precioMax || 'Max'}
                  <button
                    onClick={() => {
                      setPrecioMin('');
                      setPrecioMax('');
                    }}
                    className="hover:text-red-500"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              {soloEnStock && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-medium">
                  En Stock
                  <button onClick={() => setSoloEnStock(false)} className="hover:text-emerald-950">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}

              <button
                onClick={handleLimpiarFiltros}
                className="text-[11px] font-bold text-amber-600 hover:text-amber-700 ml-auto"
              >
                Limpiar todo
              </button>
            </div>
          )}

          {/* Contador de Resultados */}
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Mostrando <strong className="text-slate-900">{productosFiltrados.length}</strong> de{' '}
              {productosIniciales.length} artículos disponibles
            </span>
          </div>

          {/* Cuadrícula o Lista de Productos */}
          {productosFiltrados.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-800">
                No encontramos productos con esos filtros
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-6">
                Intenta ajustar el término de búsqueda, ampliar el rango de precios o quitar marcas.
              </p>
              <button
                onClick={handleLimpiarFiltros}
                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-lg transition-colors inline-flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restablecer Catálogo
              </button>
            </div>
          ) : vista === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {productosFiltrados.map((producto) => (
                <ProductCard key={producto.id} producto={producto} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {productosFiltrados.map((producto) => (
                <div
                  key={producto.id}
                  className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col sm:flex-row items-center gap-4 hover:border-slate-300 transition-all shadow-2xs"
                >
                  <div className="w-full sm:w-36 h-36 relative bg-slate-100 rounded-lg overflow-hidden shrink-0">
                    <Image
                      src={producto.imagen_principal}
                      alt={producto.nombre}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 bg-amber-50 px-2 py-0.5 rounded-sm">
                        {producto.marca}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {producto.codigo_producto}
                      </span>
                    </div>

                    <Link
                      href={`/productos/${producto.slug}`}
                      className="block font-bold text-sm text-slate-900 hover:text-amber-600 transition-colors line-clamp-2"
                    >
                      {producto.nombre}
                    </Link>
                    <p className="text-xs text-slate-500">{producto.categoria}</p>

                    <div className="pt-2 flex items-baseline gap-2">
                      <span className="text-lg font-black text-slate-900">
                        C$ {producto.precio_con_iva.toLocaleString('es-NI', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-slate-400">IVA 15% incluido</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto shrink-0">
                    <Link
                      href={`/productos/${producto.slug}`}
                      className="w-full sm:w-auto px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-xs inline-flex items-center justify-center gap-2 transition-colors"
                    >
                      Ver Detalle
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
