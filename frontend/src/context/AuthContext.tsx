'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Cliente, Direccion, EstadoPedido } from '@/types/api';

export interface ItemPedidoHistorial {
  producto_id: number;
  nombre: string;
  slug?: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
  imagen_principal?: string;
}

export interface PedidoCompleto {
  numero_pedido: string;
  fecha: string;
  estado: EstadoPedido;
  metodo_pago: string;
  modalidad_entrega: 'sucursal' | 'domicilio';
  destino_entrega: string;
  referencia_entrega?: string;
  subtotal: number;
  iva_total: number;
  total: number;
  items: ItemPedidoHistorial[];
}

interface AuthContextType {
  cliente: Cliente | null;
  isAuthenticated: boolean;
  direcciones: Direccion[];
  pedidos: PedidoCompleto[];
  login: (email: string, password?: string) => Promise<boolean>;
  register: (nombre: string, email: string, password?: string, telefono?: string) => Promise<boolean>;
  logout: () => void;
  actualizarPerfil: (datos: Partial<Cliente>) => void;
  agregarDireccion: (dir: Omit<Direccion, 'id'>) => void;
  eliminarDireccion: (id: number) => void;
  setDireccionPredeterminada: (id: number) => void;
  guardarPedido: (pedido: PedidoCompleto) => void;
  obtenerPedido: (numeroPedido: string) => PedidoCompleto | undefined;
}

const CLIENTE_DEMO_INICIAL: Cliente = {
  id: 1,
  nombre: 'Jonathan Manzanares',
  email: 'cliente@construyeweb.com',
  telefono: '+505 8888-0000',
  codigo_fiscal: 'J031000000123',
};

const DIRECCIONES_DEMO_INICIALES: Direccion[] = [
  {
    id: 1,
    alias: 'Casa / Taller Principal',
    direccion: 'De la rotonda El Güegüense 2c abajo, 1c al lago',
    ciudad: 'Managua',
    referencia: 'Portón negro con cerca eléctrica frente a pulpería La Bendición',
    predeterminada: true,
  },
  {
    id: 2,
    alias: 'Obra Carretera Sur',
    direccion: 'Km 13.5 Carretera Sur, Entrada a Chiquilistagua 400m al sur',
    ciudad: 'Managua',
    referencia: 'Lote esquinero con rótulo de madera Construcción en Progreso',
    predeterminada: false,
  },
];

const PEDIDOS_DEMO_INICIALES: PedidoCompleto[] = [
  {
    numero_pedido: 'CW-742910',
    fecha: '11 de Septiembre 2026, 03:45 PM',
    estado: 'en_preparacion',
    metodo_pago: 'Tarjeta (Stripe Test)',
    modalidad_entrega: 'domicilio',
    destino_entrega: 'De la rotonda El Güegüense 2c abajo, 1c al lago, Managua',
    referencia_entrega: 'Portón negro frente a pulpería La Bendición',
    subtotal: 3930.43,
    iva_total: 589.57,
    total: 4520.0,
    items: [
      {
        producto_id: 1,
        nombre: 'Taladro Percutor Inalámbrico 20V Max Brushless',
        slug: 'taladro-percutor-20v-dewalt',
        cantidad: 1,
        precio_unitario: 3499.0,
        subtotal: 3499.0,
        imagen_principal: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      },
      {
        producto_id: 3,
        nombre: 'Juego de Brocas para Concreto y Mampostería 15 pzas',
        slug: 'juego-brocas-concreto-stanley',
        cantidad: 2,
        precio_unitario: 510.5,
        subtotal: 1021.0,
        imagen_principal: 'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
  {
    numero_pedido: 'CW-619024',
    fecha: '02 de Septiembre 2026, 10:15 AM',
    estado: 'entregado',
    metodo_pago: 'Efectivo contraentrega',
    modalidad_entrega: 'sucursal',
    destino_entrega: 'Sucursal Central (Km 4.5 Carretera Norte, Managua)',
    subtotal: 1840.0,
    iva_total: 276.0,
    total: 2116.0,
    items: [
      {
        producto_id: 2,
        nombre: 'Esmeriladora Angular 4-1/2 Pulg 850W',
        slug: 'esmeriladora-angular-bosch',
        cantidad: 1,
        precio_unitario: 1840.0,
        subtotal: 1840.0,
        imagen_principal: 'https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?auto=format&fit=crop&w=600&q=80',
      },
    ],
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [direcciones, setDirecciones] = useState<Direccion[]>([]);
  const [pedidos, setPedidos] = useState<PedidoCompleto[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Cargar estado persistente desde localStorage al montar
  useEffect(() => {
    try {
      const savedCliente = localStorage.getItem('cw_auth_cliente');
      const savedDirecciones = localStorage.getItem('cw_auth_direcciones');
      const savedPedidos = localStorage.getItem('cw_auth_pedidos');

      if (savedCliente) {
        setCliente(JSON.parse(savedCliente));
      } else {
        // Inicializar con cliente demo por defecto para que la prueba sea inmediata
        setCliente(CLIENTE_DEMO_INICIAL);
        localStorage.setItem('cw_auth_cliente', JSON.stringify(CLIENTE_DEMO_INICIAL));
      }

      if (savedDirecciones) {
        setDirecciones(JSON.parse(savedDirecciones));
      } else {
        setDirecciones(DIRECCIONES_DEMO_INICIALES);
        localStorage.setItem('cw_auth_direcciones', JSON.stringify(DIRECCIONES_DEMO_INICIALES));
      }

      if (savedPedidos) {
        setPedidos(JSON.parse(savedPedidos));
      } else {
        setPedidos(PEDIDOS_DEMO_INICIALES);
        localStorage.setItem('cw_auth_pedidos', JSON.stringify(PEDIDOS_DEMO_INICIALES));
      }
    } catch (e) {
      console.warn('Error leyendo autenticación desde localStorage:', e);
      setCliente(CLIENTE_DEMO_INICIAL);
      setDirecciones(DIRECCIONES_DEMO_INICIALES);
      setPedidos(PEDIDOS_DEMO_INICIALES);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Guardar en localStorage ante cambios
  useEffect(() => {
    if (!isLoaded) return;
    if (cliente) {
      localStorage.setItem('cw_auth_cliente', JSON.stringify(cliente));
    } else {
      localStorage.removeItem('cw_auth_cliente');
    }
  }, [cliente, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('cw_auth_direcciones', JSON.stringify(direcciones));
  }, [direcciones, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem('cw_auth_pedidos', JSON.stringify(pedidos));
  }, [pedidos, isLoaded]);

  const login = async (email: string): Promise<boolean> => {
    const usuarioAutenticado: Cliente = {
      id: cliente?.id || 1,
      nombre: email.split('@')[0].replace('.', ' ').toUpperCase(),
      email,
      telefono: cliente?.telefono || '+505 8888-0000',
      codigo_fiscal: cliente?.codigo_fiscal || 'J031000000123',
    };
    setCliente(usuarioAutenticado);
    return true;
  };

  const register = async (nombre: string, email: string, _password?: string, telefono?: string): Promise<boolean> => {
    const nuevoUsuario: Cliente = {
      id: Date.now(),
      nombre,
      email,
      telefono: telefono || '+505 8888-0000',
    };
    setCliente(nuevoUsuario);
    return true;
  };

  const logout = () => {
    setCliente(null);
  };

  const actualizarPerfil = (datos: Partial<Cliente>) => {
    setCliente((prev) => (prev ? { ...prev, ...datos } : null));
  };

  const agregarDireccion = (dir: Omit<Direccion, 'id'>) => {
    const nueva: Direccion = {
      ...dir,
      id: Date.now(),
    };
    if (nueva.predeterminada) {
      setDirecciones((prev) => prev.map((d) => ({ ...d, predeterminada: false })).concat(nueva));
    } else {
      setDirecciones((prev) => [...prev, nueva]);
    }
  };

  const eliminarDireccion = (id: number) => {
    setDirecciones((prev) => prev.filter((d) => d.id !== id));
  };

  const setDireccionPredeterminada = (id: number) => {
    setDirecciones((prev) =>
      prev.map((d) => ({
        ...d,
        predeterminada: d.id === id,
      }))
    );
  };

  const guardarPedido = (nuevoPedido: PedidoCompleto) => {
    setPedidos((prev) => [nuevoPedido, ...prev]);
  };

  const obtenerPedido = (numeroPedido: string): PedidoCompleto | undefined => {
    return pedidos.find((p) => p.numero_pedido.toLowerCase() === numeroPedido.toLowerCase());
  };

  return (
    <AuthContext.Provider
      value={{
        cliente,
        isAuthenticated: Boolean(cliente),
        direcciones,
        pedidos,
        login,
        register,
        logout,
        actualizarPerfil,
        agregarDireccion,
        eliminarDireccion,
        setDireccionPredeterminada,
        guardarPedido,
        obtenerPedido,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe utilizarse dentro de un AuthProvider');
  }
  return context;
}
