import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { Layers, ArrowLeft } from 'lucide-react';
import CatalogoClient from '@/app/catalogo/CatalogoClient';
import { obtenerProductos, obtenerCategorias, obtenerMarcas } from '@/lib/api';

interface CategoriaPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CategoriaPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const nombreLegible = resolvedParams.slug.replace(/-/g, ' ');
  return {
    title: `${nombreLegible.toUpperCase()} — Ferretería ConstruyeWeb`,
    description: `Catálogo especializado de ${nombreLegible} para construcción, taller y hogar en Managua, Nicaragua.`,
  };
}

export default async function CategoriaPage({ params }: CategoriaPageProps) {
  const resolvedParams = await params;
  const slug = decodeURIComponent(resolvedParams.slug);

  const [productosData, categorias, marcas] = await Promise.all([
    obtenerProductos({
      por_pagina: 50,
    }),
    obtenerCategorias(),
    obtenerMarcas(),
  ]);

  const categoriaActual = categorias.find(
    (c) => c.slug.toLowerCase() === slug.toLowerCase()
  );

  const tituloCategoria = categoriaActual
    ? categoriaActual.nombre
    : slug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

  return (
    <div className="pb-12">
      {/* Banner de la Categoría */}
      <div className="bg-slate-900 text-white py-10 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs text-slate-400 mb-3">
            <Link href="/" className="hover:text-amber-400">
              Inicio
            </Link>
            <span>/</span>
            <Link href="/catalogo" className="hover:text-amber-400">
              Catálogo
            </Link>
            <span>/</span>
            <span className="text-white font-bold">{tituloCategoria}</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center gap-3">
            <Layers className="w-8 h-8 text-amber-500" />
            {tituloCategoria}
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl mt-2">
            Selección especializada de suministros y herramientas con garantía oficial de fábrica y despacho en Managua.
          </p>
        </div>
      </div>

      <CatalogoClient
        productosIniciales={productosData.resultados}
        categorias={categorias}
        marcas={marcas}
        categoriaInicial={slug}
      />
    </div>
  );
}
