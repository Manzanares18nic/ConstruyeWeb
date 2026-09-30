'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutGrid,
  ShoppingCart,
  CreditCard,
  Box,
  Truck,
  FileText,
  Users,
  BarChart3,
  Lock,
  ChevronDown,
  UserCheck,
} from 'lucide-react';
import { usePOS } from '@/context/POSContext';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  module: 'panel' | 'pos' | 'caja' | 'inventario' | 'compras' | 'facturacion' | 'personal' | 'reportes';
}

const NAV_ITEMS: NavItem[] = [
  { name: 'Panel general', href: '/', icon: LayoutGrid, module: 'panel' },
  { name: 'Punto de venta', href: '/pos', icon: ShoppingCart, module: 'pos' },
  { name: 'Caja', href: '/caja', icon: CreditCard, module: 'caja' },
  { name: 'Inventario', href: '/inventario', icon: Box, module: 'inventario' },
  { name: 'Compras', href: '/compras', icon: Truck, module: 'compras' },
  { name: 'Facturación', href: '/facturacion', icon: FileText, module: 'facturacion' },
  { name: 'Personal y roles', href: '/personal', icon: Users, module: 'personal' },
  { name: 'Reportes', href: '/reportes', icon: BarChart3, module: 'reportes' },
];

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { currentUser, staffList, setCurrentUser, canAccess } = usePOS();
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-[#F3ECE6] flex flex-col justify-between py-6 px-4 shrink-0 select-none">
      <div>
        {/* Brand Header */}
        <Link href="/" className="flex items-center gap-3 px-3 mb-8 group">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#FF6A1A] to-[#FF8C38] flex items-center justify-center text-white font-black text-sm tracking-tighter shadow-sm group-hover:scale-105 transition-transform">
            FC
          </div>
          <div className="flex items-baseline">
            <span className="text-xl font-black text-[#1E293B] tracking-tight">Construye</span>
            <span className="text-xl font-black text-[#FF6A1A] tracking-tight">Web</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {NAV_ITEMS.map((item) => {
            const hasPermission = canAccess(item.module);
            const isActive =
              item.href === '/'
                ? pathname === '/' || pathname === '/panel'
                : pathname.startsWith(item.href);

            const Icon = item.icon;

            return (
              <div key={item.name} className="relative">
                <Link
                  href={hasPermission ? item.href : '#'}
                  onClick={(e) => {
                    if (!hasPermission) {
                      e.preventDefault();
                    }
                  }}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#FF6A1A] to-[#FF8438] text-white shadow-md shadow-orange-500/25'
                      : hasPermission
                      ? 'text-[#5A6A80] hover:bg-[#FFF4EC] hover:text-[#FF6A1A]'
                      : 'text-[#94A3B8] opacity-60 cursor-not-allowed hover:bg-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : ''}`} />
                    <span>{item.name}</span>
                  </div>

                  {!hasPermission && (
                    <Lock className="w-3.5 h-3.5 text-[#94A3B8]" />
                  )}
                </Link>
              </div>
            );
          })}
        </nav>
      </div>

      {/* User Info / Role Switcher Card */}
      <div className="relative pt-4 border-t border-[#F3ECE6]">
        <div
          onClick={() => setShowUserDropdown(!showUserDropdown)}
          className="flex items-center justify-between p-2.5 rounded-2xl bg-[#FFF6D6] hover:bg-[#FFEFC0] cursor-pointer transition-colors"
          title="Haz clic para cambiar de empleado / rol de prueba"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFD15C] text-[#855B00] font-black text-sm flex items-center justify-center">
              {currentUser.avatar}
            </div>
            <div>
              <p className="text-xs font-bold text-[#1E293B] leading-tight line-clamp-1">
                {currentUser.nombre}
              </p>
              <p className="text-[11px] text-[#64748B] font-medium leading-tight">
                {currentUser.cargo}
              </p>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-[#855B00]" />
        </div>

        {/* Dropdown to switch user role */}
        {showUserDropdown && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-2 bg-white rounded-2xl shadow-xl border border-[#F3ECE6] z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
            <div className="px-2 py-1.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-wider flex items-center gap-1">
              <UserCheck className="w-3.5 h-3.5 text-[#FF6A1A]" />
              Cambiar usuario activo:
            </div>
            <div className="space-y-1 mt-1">
              {staffList.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setCurrentUser(user);
                    setShowUserDropdown(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                    currentUser.id === user.id
                      ? 'bg-[#FFF4EC] text-[#FF6A1A] font-bold'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#FFF0D4] text-[#A66C00] font-bold text-[10px] flex items-center justify-center">
                      {user.avatar}
                    </span>
                    <div>
                      <p className="leading-tight">{user.nombre}</p>
                      <p className="text-[10px] text-slate-400">{user.cargo}</p>
                    </div>
                  </div>
                  {currentUser.id === user.id && (
                    <span className="w-2 h-2 rounded-full bg-[#FF6A1A]"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
