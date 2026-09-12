import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, CreditCard, Clock, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-950 text-slate-400 mt-auto border-t border-slate-800 text-sm">
      {/* Franja de beneficios / confianza */}
      <div className="border-b border-slate-800 py-8 bg-slate-900/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center md:text-left">
            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Envíos Rápidos</h4>
                <p className="text-xs text-slate-400">Entrega garantizada en Managua y departamentos</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Garantía Ferretera</h4>
                <p className="text-xs text-slate-400">Productos originales Stanley, DeWalt, Truper y Bosch</p>
              </div>
            </div>

            <div className="flex items-center gap-4 justify-center md:justify-start">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg border border-amber-500/20">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold">Pagos Seguros</h4>
                <p className="text-xs text-slate-400">Pasarela integrada con Stripe y tarjetas de crédito</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal del footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Columna 1: Marca */}
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="inline-block bg-white px-3 py-2 rounded-xl shadow-xs">
                <Image
                  src="/logo.png"
                  alt="Ferretería Construye — Ferretería y más..."
                  width={530}
                  height={361}
                  className="h-11 w-auto object-contain"
                />
              </div>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Solución integral de inventario, punto de venta y tienda en línea para la construcción, remodelación y mantenimiento.
            </p>
            <div className="text-xs flex items-center gap-1.5 text-slate-500">
              <MapPin className="w-4 h-4 text-amber-500" />
              <span>Sucursal Central y Bodega E-Commerce, Managua</span>
            </div>
          </div>

          {/* Columna 2: Catálogo */}
          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Departamentos
            </h5>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/catalogo" className="text-amber-400 font-semibold hover:text-amber-300 transition-colors">
                  Catálogo Completo
                </Link>
              </li>
              <li>
                <Link href="/categorias/herramientas-manuales" className="hover:text-amber-400 transition-colors">
                  Herramientas Manuales
                </Link>
              </li>
              <li>
                <Link href="/categorias/herramientas-electricas" className="hover:text-amber-400 transition-colors">
                  Herramientas Eléctricas
                </Link>
              </li>
              <li>
                <Link href="/categorias/tornilleria" className="hover:text-amber-400 transition-colors">
                  Tornillería y Fijación
                </Link>
              </li>
              <li>
                <Link href="/categorias/pinturas-acabados" className="hover:text-amber-400 transition-colors">
                  Pinturas y Brochas
                </Link>
              </li>
            </ul>
          </div>

          {/* Columna 3: Atención al Cliente */}
          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Atención y Horarios
            </h5>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Lunes a Viernes: 7:30 AM – 5:30 PM</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Sábados: 8:00 AM – 2:00 PM</span>
              </li>
              <li className="text-slate-500">Domingos: Cerrado</li>
              <li className="pt-2 text-amber-400 font-medium">PBX: (505) 2222-3333</li>
            </ul>
          </div>

          {/* Columna 4: Clientes y Pasarela */}
          <div>
            <h5 className="text-white font-semibold text-xs uppercase tracking-wider mb-4">
              Portal del Cliente
            </h5>
            <ul className="space-y-2 text-xs mb-4">
              <li>
                <Link href="/cuenta" className="hover:text-amber-400 transition-colors">
                  Mi Cuenta y Pedidos
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition-colors">
                  Acceso a Clientes
                </Link>
              </li>
              <li>
                <Link href="/checkout" className="hover:text-amber-400 transition-colors">
                  Caja y Facturación
                </Link>
              </li>
            </ul>
            <div className="inline-block bg-slate-900 border border-slate-800 rounded-md px-3 py-1.5 text-[11px] text-slate-300">
              🔒 Stripe Payments Verified
            </div>
          </div>
        </div>

        {/* Derechos de autor */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} Ferretería Construye (ConstruyeWeb). Todos los derechos reservados.</p>
          <p>Desarrollo desacoplado Next.js + Django REST Framework</p>
        </div>
      </div>
    </footer>
  );
}
