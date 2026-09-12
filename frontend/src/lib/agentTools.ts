import { MOCK_PRODUCTOS_DETALLE } from './mocks';

export interface ToolMaterialItem {
  id: number;
  codigo_producto: string;
  nombre: string;
  marca: string;
  categoria: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
  imagen_principal?: string;
  slug: string;
}

export interface CalculationResult {
  proyecto: string;
  dimensiones: string;
  explicacion: string;
  items: ToolMaterialItem[];
  totalEstimado: number;
}

/**
 * Herramienta: Calcular Materiales de Construcción
 */
export function toolCalcularMateriales(
  tipoProyecto: string,
  params: {
    largo?: number;
    alto?: number;
    ancho?: number;
    area?: number;
  } = {}
): CalculationResult {
  const tipo = tipoProyecto.toLowerCase();

  // 1. Caso: Pared de Bloques de Concreto
  if (tipo.includes('pared') || tipo.includes('bloque') || tipo.includes('muro')) {
    const largo = params.largo || 4;
    const alto = params.alto || 2.5;
    const area = params.area || Number((largo * alto).toFixed(2));

    // Rendimiento estándar ferretero: 12.5 bloques por m² + 5% de merma
    const cantidadBloques = Math.ceil(area * 12.5 * 1.05);
    // Mortero de pega: 1 saco de 42.5kg por cada ~35 bloques
    const sacosCemento = Math.max(1, Math.ceil(cantidadBloques / 35));

    const prodBloque = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 510)!;
    const prodCemento = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 509)!;

    const items: ToolMaterialItem[] = [
      {
        id: prodBloque.id,
        codigo_producto: prodBloque.codigo_producto,
        nombre: prodBloque.nombre,
        marca: prodBloque.marca.nombre,
        categoria: prodBloque.categoria.nombre,
        precio_unitario: prodBloque.precio.precio_con_iva,
        cantidad: cantidadBloques,
        subtotal: Number((cantidadBloques * prodBloque.precio.precio_con_iva).toFixed(2)),
        imagen_principal: prodBloque.imagenes[0],
        slug: prodBloque.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      },
      {
        id: prodCemento.id,
        codigo_producto: prodCemento.codigo_producto,
        nombre: prodCemento.nombre,
        marca: prodCemento.marca.nombre,
        categoria: prodCemento.categoria.nombre,
        precio_unitario: prodCemento.precio.precio_con_iva,
        cantidad: sacosCemento,
        subtotal: Number((sacosCemento * prodCemento.precio.precio_con_iva).toFixed(2)),
        imagen_principal: prodCemento.imagenes[0],
        slug: prodCemento.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      },
    ];

    const totalEstimado = Number(items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));

    return {
      proyecto: 'Construcción de Pared de Mampostería',
      dimensiones: `${area} m² (${largo}m de largo x ${alto}m de alto)`,
      explicacion: `Para levantar una pared de ${area} m², calculamos 12.5 bloques por m² con un factor de seguridad del 5% por cortes o quiebres (${cantidadBloques} bloques). Para la mezcla de pega, requieres aproximadamente 1 saco de cemento por cada 35 bloques (${sacosCemento} sacos de Cemento Holcim de 42.5kg).`,
      items,
      totalEstimado,
    };
  }

  // 2. Caso: Pintura de Cuarto o Superficie
  if (tipo.includes('pint') || tipo.includes('cuarto') || tipo.includes('habitacion')) {
    const largo = params.largo || 4;
    const ancho = params.ancho || 4;
    const alto = params.alto || 2.6;
    // Perímetro x altura menos puertas/ventanas aprox
    const area = params.area || Number(((largo + ancho) * 2 * alto - 5).toFixed(2));

    const prodPintura = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 511)!;
    const prodRodillo = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 512)!;
    const prodCinta = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 513)!;

    const items: ToolMaterialItem[] = [
      {
        id: prodPintura.id,
        codigo_producto: prodPintura.codigo_producto,
        nombre: prodPintura.nombre,
        marca: prodPintura.marca.nombre,
        categoria: prodPintura.categoria.nombre,
        precio_unitario: prodPintura.precio.precio_con_iva,
        cantidad: 1,
        subtotal: prodPintura.precio.precio_con_iva,
        imagen_principal: prodPintura.imagenes[0],
        slug: prodPintura.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      },
      {
        id: prodRodillo.id,
        codigo_producto: prodRodillo.codigo_producto,
        nombre: prodRodillo.nombre,
        marca: prodRodillo.marca.nombre,
        categoria: prodRodillo.categoria.nombre,
        precio_unitario: prodRodillo.precio.precio_con_iva,
        cantidad: 1,
        subtotal: prodRodillo.precio.precio_con_iva,
        imagen_principal: prodRodillo.imagenes[0],
        slug: prodRodillo.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      },
      {
        id: prodCinta.id,
        codigo_producto: prodCinta.codigo_producto,
        nombre: prodCinta.nombre,
        marca: prodCinta.marca.nombre,
        categoria: prodCinta.categoria.nombre,
        precio_unitario: prodCinta.precio.precio_con_iva,
        cantidad: 2,
        subtotal: Number((2 * prodCinta.precio.precio_con_iva).toFixed(2)),
        imagen_principal: prodCinta.imagenes[0],
        slug: prodCinta.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      },
    ];

    const totalEstimado = Number(items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));

    return {
      proyecto: 'Pintura de Habitación / Paredes Interiores',
      dimensiones: `Aprox. ${area} m² de superficie neta de pared`,
      explicacion: `Para cubrir ${area} m² a dos manos de pintura látex de alta calidad, una cubeta de 5 galones de Corona cubre hasta 150 m², garantizando suficiente pintura para retoques. He añadido el rodillo profesional antigoteo y 2 rollos de masking tape para proteger zócalos e interruptores.`,
      items,
      totalEstimado,
    };
  }

  // 3. Caso: Kit Básico de Herramientas para el Hogar
  const prodMartillo = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 501)!;
  const prodCintaMetrica = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 506)!;
  const prodAlicate = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 505)!;
  const prodTornillos = MOCK_PRODUCTOS_DETALLE.find((p) => p.id === 508)!;

  const items: ToolMaterialItem[] = [
    {
      id: prodMartillo.id,
      codigo_producto: prodMartillo.codigo_producto,
      nombre: prodMartillo.nombre,
      marca: prodMartillo.marca.nombre,
      categoria: prodMartillo.categoria.nombre,
      precio_unitario: prodMartillo.precio.precio_con_iva,
      cantidad: 1,
      subtotal: prodMartillo.precio.precio_con_iva,
      imagen_principal: prodMartillo.imagenes[0],
      slug: prodMartillo.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    },
    {
      id: prodCintaMetrica.id,
      codigo_producto: prodCintaMetrica.codigo_producto,
      nombre: prodCintaMetrica.nombre,
      marca: prodCintaMetrica.marca.nombre,
      categoria: prodCintaMetrica.categoria.nombre,
      precio_unitario: prodCintaMetrica.precio.precio_con_iva,
      cantidad: 1,
      subtotal: prodCintaMetrica.precio.precio_con_iva,
      imagen_principal: prodCintaMetrica.imagenes[0],
      slug: prodCintaMetrica.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    },
    {
      id: prodAlicate.id,
      codigo_producto: prodAlicate.codigo_producto,
      nombre: prodAlicate.nombre,
      marca: prodAlicate.marca.nombre,
      categoria: prodAlicate.categoria.nombre,
      precio_unitario: prodAlicate.precio.precio_con_iva,
      cantidad: 1,
      subtotal: prodAlicate.precio.precio_con_iva,
      imagen_principal: prodAlicate.imagenes[0],
      slug: prodAlicate.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    },
    {
      id: prodTornillos.id,
      codigo_producto: prodTornillos.codigo_producto,
      nombre: prodTornillos.nombre,
      marca: prodTornillos.marca.nombre,
      categoria: prodTornillos.categoria.nombre,
      precio_unitario: prodTornillos.precio.precio_con_iva,
      cantidad: 1,
      subtotal: prodTornillos.precio.precio_con_iva,
      imagen_principal: prodTornillos.imagenes[0],
      slug: prodTornillos.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    },
  ];

  const totalEstimado = Number(items.reduce((acc, i) => acc + i.subtotal, 0).toFixed(2));

  return {
    proyecto: 'Kit Básico de Mantenimiento y Herramientas',
    dimensiones: 'Combo esencial de 4 herramientas',
    explicacion: `He armado el combo imprescindible para reparaciones domésticas: un Martillo Stanley de 16oz con mango ergonómico, Cinta Métrica de 8m, Alicate Universal Truper y una caja surtida de 100 tornillos para madera y yeso.`,
    items,
    totalEstimado,
  };
}

/**
 * Herramienta: Buscar productos en el catálogo
 */
export function toolBuscarCatalogo(query: string) {
  const q = query.toLowerCase();
  const encontrados = MOCK_PRODUCTOS_DETALLE.filter(
    (p) =>
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q) ||
      p.marca.nombre.toLowerCase().includes(q) ||
      p.categoria.nombre.toLowerCase().includes(q)
  );

  return encontrados.map((p) => ({
    id: p.id,
    codigo_producto: p.codigo_producto,
    nombre: p.nombre,
    marca: p.marca.nombre,
    precio_con_iva: p.precio.precio_con_iva,
    stock: p.stock_disponible,
    imagen: p.imagenes[0],
    slug: p.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  }));
}
