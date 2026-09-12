import {
  Categoria,
  Marca,
  ProductosPaginados,
  ProductoDetalle,
  FiltrosProductos,
  Carrito,
} from '@/types/api';
import {
  MOCK_CATEGORIAS,
  MOCK_MARCAS,
  MOCK_PRODUCTOS_DETALLE,
  MOCK_PRODUCTOS_RESUMEN,
} from './mocks';

/**
 * Cliente de API para ConstruyeWeb
 * Diseñado según api_contract_construyeweb.md
 *
 * Estrategia de desarrollo:
 * Intenta conectar con el backend de Django (http://localhost:8000/api).
 * Si el backend de Elizabeth aún no está encendido o devuelve error de conexión,
 * utiliza los datos simulados (mocks) para que la tienda sea 100% navegable.
 */

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

/**
 * Helper para realizar peticiones HTTP con manejo de errores y fallback
 */
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit,
  fallbackData?: T
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(options?.headers || {}),
      },
      ...options,
    });

    if (!res.ok) {
      throw new Error(`Error HTTP: ${res.status} ${res.statusText}`);
    }

    return (await res.json()) as T;
  } catch (error) {
    if (fallbackData !== undefined) {
      // Mensaje discreto en consola informando del modo mock
      if (process.env.NODE_ENV === 'development') {
        console.info(
          `[ConstruyeWeb API] Backend no disponible en ${url}. Usando datos simulados (Mocks).`
        );
      }
      return fallbackData;
    }
    throw error;
  }
}

// ==========================================
// 1. Catálogo
// ==========================================

/**
 * GET /api/categorias/
 * Obtiene el árbol completo de categorías anidadas
 */
export async function obtenerCategorias(): Promise<Categoria[]> {
  return fetchApi<Categoria[]>('/categorias/', {}, MOCK_CATEGORIAS);
}

/**
 * GET /api/marcas/
 * Obtiene la lista de marcas
 */
export async function obtenerMarcas(): Promise<Marca[]> {
  return fetchApi<Marca[]>('/marcas/', {}, MOCK_MARCAS);
}

/**
 * GET /api/productos/?categoria=...&marca=...&buscar=...&pagina=1&por_pagina=24
 * Obtiene el listado paginado de productos con filtros
 */
export async function obtenerProductos(
  filtros: FiltrosProductos = {}
): Promise<ProductosPaginados> {
  const params = new URLSearchParams();
  if (filtros.categoria) params.append('categoria', filtros.categoria);
  if (filtros.marca) params.append('marca', filtros.marca);
  if (filtros.buscar) params.append('buscar', filtros.buscar);
  if (filtros.pagina) params.append('pagina', filtros.pagina.toString());
  if (filtros.por_pagina) params.append('por_pagina', filtros.por_pagina.toString());

  const queryString = params.toString() ? `?${params.toString()}` : '';

  // Filtrado local para los Mocks en desarrollo
  let filtrados = [...MOCK_PRODUCTOS_RESUMEN];

  if (filtros.buscar) {
    const q = filtros.buscar.toLowerCase();
    filtrados = filtrados.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        p.marca.toLowerCase().includes(q) ||
        p.codigo_producto.toLowerCase().includes(q)
    );
  }

  if (filtros.marca) {
    filtrados = filtrados.filter(
      (p) => p.marca.toLowerCase() === filtros.marca?.toLowerCase()
    );
  }

  if (filtros.categoria) {
    filtrados = filtrados.filter(
      (p) => p.categoria.toLowerCase().includes(filtros.categoria?.toLowerCase() || '')
    );
  }

  const pagina = filtros.pagina || 1;
  const por_pagina = filtros.por_pagina || 24;
  const inicio = (pagina - 1) * por_pagina;
  const fin = inicio + por_pagina;

  const mockResponse: ProductosPaginados = {
    total: filtrados.length,
    pagina,
    por_pagina,
    resultados: filtrados.slice(inicio, fin),
  };

  return fetchApi<ProductosPaginados>(`/productos/${queryString}`, {}, mockResponse);
}

/**
 * GET /api/productos/{slug}/
 * Obtiene el detalle completo de un producto por su slug
 */
export async function obtenerProductoPorSlug(
  slug: string
): Promise<ProductoDetalle | null> {
  const fallback =
    MOCK_PRODUCTOS_DETALLE.find(
      (p) =>
        p.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') === slug ||
        p.codigo_producto.toLowerCase() === slug.toLowerCase()
    ) || null;

  return fetchApi<ProductoDetalle | null>(`/productos/${slug}/`, {}, fallback);
}

// ==========================================
// 2. Carrito (con soporte para invitado o cliente)
// ==========================================

export async function obtenerCarrito(
  sessionId?: string,
  token?: string
): Promise<Carrito> {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (sessionId) headers['X-Session-Id'] = sessionId;

  const mockCarrito: Carrito = {
    id: 900,
    items: [],
    total: 0,
  };

  return fetchApi<Carrito>('/carrito/', { headers }, mockCarrito);
}
