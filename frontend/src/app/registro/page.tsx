'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Wrench, Lock, Mail, User, Phone, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegistroPage() {
  const router = useRouter();
  const { register, isAuthenticated } = useAuth();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/cuenta');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre || !email || !password) {
      setError('Por favor completa los campos requeridos');
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await register(nombre, email, password, telefono);
      router.push('/cuenta');
    } catch {
      setError('Error al registrar usuario. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-200 shadow-sm">
        {/* Cabecera */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 group mb-4">
            <div className="bg-amber-500 text-slate-950 p-2 rounded-lg group-hover:bg-amber-400 transition-colors">
              <Wrench className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              CONSTRUYE<span className="text-amber-600">WEB</span>
            </span>
          </Link>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Crear Cuenta de Cliente
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Regístrate para comprar más rápido, guardar direcciones y dar seguimiento a tus materiales.
          </p>
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
              Nombre Completo *
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej. Jonathan Manzanares"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Correo Electrónico *
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
              Teléfono de Contacto (Opcional)
            </label>
            <div className="relative">
              <input
                type="tel"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="+505 8888-0000"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Contraseña *
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all"
              />
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-tight">
            Al registrarte aceptas las políticas de privacidad y términos de venta ferretera de ConstruyeWeb.
          </p>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-lg text-sm transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              'Creando cuenta...'
            ) : (
              <>
                Registrarme en ConstruyeWeb <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="pt-4 border-t border-slate-200 text-center">
          <p className="text-xs text-slate-600">
            ¿Ya tienes una cuenta registrada?{' '}
            <Link href="/login" className="text-amber-600 hover:text-amber-700 font-bold">
              Iniciar Sesión
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Datos resguardados con cifrado seguro</span>
        </div>
      </div>
    </div>
  );
}
