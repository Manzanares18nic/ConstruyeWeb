import { obtenerProductoPorSlug } from '@/lib/api';
import ProductDetailClient from './ProductDetailClient';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);

  if (!producto) {
    return {
      title: 'Producto no encontrado — ConstruyeWeb',
    };
  }

  return {
    title: `${producto.nombre} — ConstruyeWeb`,
    description: producto.descripcion,
  };
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const producto = await obtenerProductoPorSlug(slug);

  if (!producto) {
    notFound();
  }

  return <ProductDetailClient producto={producto} />;
}
