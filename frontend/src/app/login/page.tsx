'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('cliente@construyeweb.com');
  const [password, setPassword] = useState('ferreteria2026');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/cuenta');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Por favor ingresa tu correo y contraseña');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      router.push('/cuenta');
    } catch {
      setError('Credenciales inválidas. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('cliente@construyeweb.com');
    setPassword('ferreteria2026');
    setLoading(true);
    await login('cliente@construyeweb.com', 'ferreteria2026');
    router.push('/cuenta');
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
        {/* Cabecera */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-3 group mb-4">
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-slate-200 bg-white shadow-2xs group-hover:border-amber-500 transition-all shrink-0">
              <Image
                src="/logo.jpeg"
                alt="Ferretería Construye Logo"
                fill
                priority
                className="object-contain p-1"
              />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-slate-900 block">
                CONSTRUYE<span className="text-amber-600">WEB</span>
              </span>
              <span className="block text-[10px] uppercase font-bold tracking-widest text-slate-500 -mt-1">
                Ferretería y más...
              </span>
            </div>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Iniciar Sesión
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Accede a tu cuenta de cliente para ver tus pedidos, facturas y direcciones guardadas.
          </p>
        </div>

        {/* Botón de Acceso Demo Inmediato */}
        <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-700 shrink-0" />
              <div className="text-xs">
                <p className="font-bold text-amber-950">Acceso Rápido para Pruebas</p>
                <p className="text-amber-800">Cuenta de demostración precargada</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-lg transition-colors shrink-0 cursor-pointer"
            >
              Ingresar Demo
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                defaultChecked
                className="rounded text-amber-600 focus:ring-amber-500 border-slate-300"
              />
              <span className="text-slate-600">Recordarme en este dispositivo</span>
            </label>
            <a href="#" className="text-amber-600 hover:text-amber-700 font-semibold">
              ¿Olvidaste tu contraseña?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              'Verificando credenciales...'
            ) : (
              <>
                Entrar a Mi Cuenta <ArrowRight className="w-4 h-4 text-amber-400" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            ¿Aún no tienes una cuenta ferretera?{' '}
            <Link href="/registro" className="text-amber-600 hover:text-amber-700 font-bold">
              Crear cuenta nueva
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Autenticación segura desacoplada de Django Auth</span>
        </div>
      </div>
    </div>
  );
}
