'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search,
  ShoppingCart,
  User,
  Wrench,
  Menu,
  X,
  Phone,
  MapPin,
} from 'lucide-react';

export default function Navbar() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [menuMovilAbierto, setMenuMovilAbierto] = useState(false);

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault();
    if (busqueda.trim()) {
      router.push(`/?buscar=${encodeURIComponent(busqueda.trim())}`);
    } else {
      router.push('/');
    }
  };

  return (
    <header className="w-full sticky top-0 z-50 bg-white border-b border-gray-200 shadow-xs">
      {/* Barra superior de anuncios */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-1">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Managua, Nicaragua
            </span>
            <span className="flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-amber-400" /> Atención: +505 2222-3333
            </span>
          </div>
          <div className="text-amber-400 font-medium tracking-wide">
            Ferretería Construye — Venta al detalle y por mayor
          </div>
        </div>
      </div>

      {/* Barra principal de navegación */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4 md:gap-8">
          {/* Logotipo */}
          <Link href="/" className="flex items-center gap-2 shrink-0 group">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg group-hover:bg-amber-400 transition-colors">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900">
                CONSTRUYE<span className="text-amber-600">WEB</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                Ferretería & POS
              </span>
            </div>
          </Link>

          {/* Buscador de productos */}
          <form
            onSubmit={handleBuscar}
            className="hidden md:flex flex-1 max-w-2xl relative"
          >
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar martillos, taladros, tornillos, marcas..."
              className="w-full pl-4 pr-12 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              aria-label="Buscar"
              className="absolute right-1 top-1 bottom-1 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md transition-colors flex items-center justify-center"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Acciones de usuario y Carrito */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Enlace Cuenta */}
            <Link
              href="/cuenta"
              className="flex items-center gap-2 text-slate-700 hover:text-amber-600 transition-colors text-sm font-medium"
            >
              <div className="p-2 rounded-full bg-slate-100 hover:bg-slate-200">
                <User className="w-5 h-5 text-slate-700" />
              </div>
              <span className="hidden lg:inline">Mi Cuenta</span>
            </Link>

            {/* Carrito */}
            <Link
              href="/carrito"
              className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-lg transition-colors text-sm font-semibold relative group"
            >
              <ShoppingCart className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Carrito</span>
              <span className="bg-amber-500 text-slate-950 text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </Link>

            {/* Botón Menú Móvil */}
            <button
              onClick={() => setMenuMovilAbierto(!menuMovilAbierto)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-900"
              aria-label="Alternar menú"
            >
              {menuMovilAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Buscador en móviles */}
        <form onSubmit={handleBuscar} className="mt-3 md:hidden relative">
          <input
            type="text"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar productos..."
            className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900"
          />
          <button
            type="submit"
            aria-label="Buscar"
            className="absolute right-1 top-1 bottom-1 px-3 bg-amber-500 text-slate-950 rounded-md"
          >
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* Sub-barra de categorías rápidas */}
      <nav className="bg-slate-100 border-t border-slate-200 hidden sm:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ul className="flex items-center gap-6 py-2.5 text-xs font-semibold text-slate-700 uppercase tracking-wider overflow-x-auto">
            <li>
              <Link href="/" className="hover:text-amber-600 transition-colors">
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="/?categoria=herramientas-manuales"
                className="hover:text-amber-600 transition-colors whitespace-nowrap"
              >
                Herramientas Manuales
              </Link>
            </li>
            <li>
              <Link
                href="/?categoria=herramientas-electricas"
                className="hover:text-amber-600 transition-colors whitespace-nowrap"
              >
                Herramientas Eléctricas
              </Link>
            </li>
            <li>
              <Link
                href="/?categoria=tornilleria"
                className="hover:text-amber-600 transition-colors whitespace-nowrap"
              >
                Tornillería & Fijación
              </Link>
            </li>
            <li>
              <Link
                href="/?categoria=pinturas-acabados"
                className="hover:text-amber-600 transition-colors whitespace-nowrap"
              >
                Pinturas & Acabados
              </Link>
            </li>
            <li>
              <Link
                href="/?categoria=plomeria-tuberias"
                className="hover:text-amber-600 transition-colors whitespace-nowrap"
              >
                Plomería
              </Link>
            </li>
          </ul>
        </div>
      </nav>

      {/* Menú desplegable móvil */}
      {menuMovilAbierto && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-3 space-y-2">
          <Link
            href="/"
            onClick={() => setMenuMovilAbierto(false)}
            className="block py-2 text-sm font-semibold text-slate-800 hover:text-amber-600"
          >
            Inicio
          </Link>
          <Link
            href="/?categoria=herramientas-manuales"
            onClick={() => setMenuMovilAbierto(false)}
            className="block py-2 text-sm text-slate-700 hover:text-amber-600"
          >
            Herramientas Manuales
          </Link>
          <Link
            href="/?categoria=herramientas-electricas"
            onClick={() => setMenuMovilAbierto(false)}
            className="block py-2 text-sm text-slate-700 hover:text-amber-600"
          >
            Herramientas Eléctricas
          </Link>
          <Link
            href="/?categoria=tornilleria"
            onClick={() => setMenuMovilAbierto(false)}
            className="block py-2 text-sm text-slate-700 hover:text-amber-600"
          >
            Tornillería & Fijación
          </Link>
          <Link
            href="/cuenta"
            onClick={() => setMenuMovilAbierto(false)}
            className="block py-2 text-sm font-semibold text-amber-600"
          >
            Mi Cuenta / Iniciar Sesión
          </Link>
        </div>
      )}
    </header>
  );
}
