import React from 'react';
import { Metadata } from 'next';
import CatalogoClient from './CatalogoClient';
import { obtenerProductos, obtenerCategorias, obtenerMarcas } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Catálogo General de Herramientas y Materiales — ConstruyeWeb',
  description:
    'Explora nuestro catálogo completo de herramientas eléctricas, manuales, fijaciones y acabados ferreteros con inventario en tiempo real.',
};

interface CatalogoPageProps {
  searchParams: Promise<{
    categoria?: string;
    marca?: string;
    buscar?: string;
  }>;
}

export default async function CatalogoPage({ searchParams }: CatalogoPageProps) {
  const resolvedParams = await searchParams;

  const [productosData, categorias, marcas] = await Promise.all([
    obtenerProductos({
      por_pagina: 50,
    }),
    obtenerCategorias(),
    obtenerMarcas(),
  ]);

  return (
    <CatalogoClient
      productosIniciales={productosData.resultados}
      categorias={categorias}
      marcas={marcas}
      categoriaInicial={resolvedParams.categoria}
      marcaInicial={resolvedParams.marca}
      busquedaInicial={resolvedParams.buscar}
    />
  );
}
