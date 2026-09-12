import { Categoria, Marca, ProductoDetalle, ProductoResumen } from '@/types/api';

/**
 * Datos simulados (Mocks) que cumplen estrictamente con el contrato de API
 * (api_contract_construyeweb.md).
 * Permiten desarrollar la UI del e-commerce ferretero antes de conectar con Django.
 */

export const MOCK_CATEGORIAS: Categoria[] = [
  {
    id: 1,
    nombre: 'Ferretería general',
    slug: 'ferreteria-general',
    nivel: 0,
    hijas: [
      {
        id: 2,
        nombre: 'Tornillería y Fijación',
        slug: 'tornilleria',
        nivel: 1,
        hijas: [],
      },
      {
        id: 3,
        nombre: 'Cerraduras y Candados',
        slug: 'cerraduras-candados',
        nivel: 1,
        hijas: [],
      },
    ],
  },
  {
    id: 8,
    nombre: 'Herramientas manuales',
    slug: 'herramientas-manuales',
    nivel: 0,
    hijas: [
      {
        id: 9,
        nombre: 'Martillos y Mazas',
        slug: 'martillos-mazas',
        nivel: 1,
        hijas: [],
      },
      {
        id: 10,
        nombre: 'Alicates y Pinzas',
        slug: 'alicates-pinzas',
        nivel: 1,
        hijas: [],
      },
      {
        id: 11,
        nombre: 'Destornilladores y Llaves',
        slug: 'destornilladores-llaves',
        nivel: 1,
        hijas: [],
      },
    ],
  },
  {
    id: 12,
    nombre: 'Herramientas eléctricas',
    slug: 'herramientas-electricas',
    nivel: 0,
    hijas: [
      {
        id: 13,
        nombre: 'Taladros y Rotomartillos',
        slug: 'taladros-rotomartillos',
        nivel: 1,
        hijas: [],
      },
      {
        id: 14,
        nombre: 'Sierras y Amoladoras',
        slug: 'sierras-amoladoras',
        nivel: 1,
        hijas: [],
      },
    ],
  },
  {
    id: 15,
    nombre: 'Plomería y Tuberías',
    slug: 'plomeria-tuberias',
    nivel: 0,
    hijas: [],
  },
  {
    id: 16,
    nombre: 'Pinturas y Acabados',
    slug: 'pinturas-acabados',
    nivel: 0,
    hijas: [],
  },
];

export const MOCK_MARCAS: Marca[] = [
  {
    id: 4,
    nombre: 'Stanley',
    slug: 'stanley',
    logo_url: 'https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 5,
    nombre: 'DeWalt',
    slug: 'dewalt',
    logo_url: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 6,
    nombre: 'Truper',
    slug: 'truper',
    logo_url: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=120&auto=format&fit=crop&q=80',
  },
  {
    id: 7,
    nombre: 'Bosch',
    slug: 'bosch',
    logo_url: 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=120&auto=format&fit=crop&q=80',
  },
];

export const MOCK_PRODUCTOS_DETALLE: ProductoDetalle[] = [
  {
    id: 501,
    codigo_producto: 'FC-00501',
    nombre: 'Martillo Stanley 16oz',
    descripcion: 'Martillo de uña curva Stanley de 16 onzas con mango de fibra de vidrio de alta resistencia y empuñadura ergonómica antideslizante. Ideal para trabajos de carpintería y construcción ligera.',
    marca: { id: 4, nombre: 'Stanley' },
    categoria: { id: 8, nombre: 'Herramientas manuales', slug: 'herramientas-manuales' },
    precio: {
      precio_sin_iva: 246.12,
      porcentaje_iva: 15,
      precio_con_iva: 283.04,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1508873535684-277a3cbcc4e8?w=600&auto=format&fit=crop&q=80',
    ],
    disponible: true,
    stock_disponible: 12,
  },
  {
    id: 502,
    codigo_producto: 'FC-00502',
    nombre: 'Taladro Percutor DeWalt 20V MAX',
    descripcion: 'Taladro rotomartillo inalámbrico DeWalt con motor sin escobillas (Brushless). Incluye 2 baterías de iones de litio de 2.0Ah, cargador rápido y maletín de transporte rígido.',
    marca: { id: 5, nombre: 'DeWalt' },
    categoria: { id: 12, nombre: 'Herramientas eléctricas', slug: 'herramientas-electricas' },
    precio: {
      precio_sin_iva: 3913.04,
      porcentaje_iva: 15,
      precio_con_iva: 4500.00,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    ],
    disponible: true,
    stock_disponible: 8,
  },
  {
    id: 503,
    codigo_producto: 'FC-00503',
    nombre: 'Juego de Destornilladores Stanley 6 Pzas',
    descripcion: 'Juego de 6 destornilladores Pro Stanley (planos y de estrella Phillips) con puntas magnéticas fosfatadas para mejor agarre y mangos bimaterial ergonómicos.',
    marca: { id: 4, nombre: 'Stanley' },
    categoria: { id: 8, nombre: 'Herramientas manuales', slug: 'herramientas-manuales' },
    precio: {
      precio_sin_iva: 365.22,
      porcentaje_iva: 15,
      precio_con_iva: 420.00,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=600&auto=format&fit=crop&q=80',
    ],
    disponible: true,
    stock_disponible: 24,
  },
  {
    id: 504,
    codigo_producto: 'FC-00504',
    nombre: 'Sierra Circular Bosch 7-1/4 Pulgadas 1400W',
    descripcion: 'Sierra circular profesional Bosch con motor de 1400W, disco de 24 dientes de carburo de tungsteno, guía paralela y adaptador para aspiración de polvo.',
    marca: { id: 7, nombre: 'Bosch' },
    categoria: { id: 12, nombre: 'Herramientas eléctricas', slug: 'herramientas-electricas' },
    precio: {
      precio_sin_iva: 3348.26,
      porcentaje_iva: 15,
      precio_con_iva: 3850.50,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?w=600&auto=format&fit=crop&q=80',
    ],
    disponible: true,
    stock_disponible: 5,
  },
  {
    id: 505,
    codigo_producto: 'FC-00505',
    nombre: 'Alicate Universal Truper Pro 8 Pulgadas',
    descripcion: 'Alicate universal de 8 pulgadas forjado en acero al cromo vanadio, doble mango aislante de alta comodidad y cuchillas tratadas térmicamente para corte de alambre duro.',
    marca: { id: 6, nombre: 'Truper' },
    categoria: { id: 8, nombre: 'Herramientas manuales', slug: 'herramientas-manuales' },
    precio: {
      precio_sin_iva: 160.87,
      porcentaje_iva: 15,
      precio_con_iva: 185.00,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1586864387967-d02ef85d93e8?w=600&auto=format&fit=crop&q=80',
    ],
    disponible: true,
    stock_disponible: 35,
  },
  {
    id: 506,
    codigo_producto: 'FC-00506',
    nombre: 'Cinta Métrica Stanley PowerLock 8 Metros',
    descripcion: 'Cinta métrica clásica Stanley con recubrimiento Mylar para proteger la hoja contra abrasiones y gancho Tru-Zero con tres remaches para mediciones precisas.',
    marca: { id: 4, nombre: 'Stanley' },
    categoria: { id: 8, nombre: 'Herramientas manuales', slug: 'herramientas-manuales' },
    precio: {
      precio_sin_iva: 256.52,
      porcentaje_iva: 15,
      precio_con_iva: 295.00,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
    ],
    disponible: true,
    stock_disponible: 40,
  },
  {
    id: 507,
    codigo_producto: 'FC-00507',
    nombre: 'Amoladora Angular DeWalt 4-1/2 Pulgadas 850W',
    descripcion: 'Esmeriladora angular de 850W con sistema de expulsión de polvo para proteger el motor de partículas abrasivas y guarda de ajuste rápido sin herramientas.',
    marca: { id: 5, nombre: 'DeWalt' },
    categoria: { id: 12, nombre: 'Herramientas eléctricas', slug: 'herramientas-electricas' },
    precio: {
      precio_sin_iva: 1869.57,
      porcentaje_iva: 15,
      precio_con_iva: 2150.00,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=600&auto=format&fit=crop&q=80',
    ],
    disponible: true,
    stock_disponible: 10,
  },
  {
    id: 508,
    codigo_producto: 'FC-00508',
    nombre: 'Caja de Tornillos para Madera Truper 100 Uds',
    descripcion: 'Tornillos autorroscantes cabeza Phillips para madera y yeso, tratados contra corrosión. Medida standard 1-1/2 pulgada.',
    marca: { id: 6, nombre: 'Truper' },
    categoria: { id: 1, nombre: 'Ferretería general', slug: 'ferreteria-general' },
    precio: {
      precio_sin_iva: 82.61,
      porcentaje_iva: 15,
      precio_con_iva: 95.00,
    },
    imagenes: [
      'https://images.unsplash.com/photo-1581147036324-c17ac41dfa6c?w=600&auto=format&fit=crop&q=80',
    ],
    disponible: true,
    stock_disponible: 150,
  },
];

// Convertimos los productos detallados al formato de resumen para listados
export const MOCK_PRODUCTOS_RESUMEN: ProductoResumen[] = MOCK_PRODUCTOS_DETALLE.map((p) => ({
  id: p.id,
  codigo_producto: p.codigo_producto,
  slug: p.nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  nombre: p.nombre,
  marca: p.marca.nombre,
  categoria: p.categoria.nombre,
  precio_con_iva: p.precio.precio_con_iva,
  imagen_principal: p.imagenes[0] || '',
  disponible: p.disponible,
}));
