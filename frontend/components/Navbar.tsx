'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard, LogIn, UserPlus } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <nav className="bg-surface-container-lowest border-b border-outline-variant/30 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2.5 font-bold text-xl hover:opacity-90 transition">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]" data-icon="terminal">
                  terminal
                </span>
              </div>
              <span className="font-headline-md text-headline-md font-semibold text-primary tracking-tight">
                TaskPulse
              </span>
            </Link>

            <div className="hidden sm:ml-8 sm:flex sm:space-x-4">
              <Link
                href="/"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  pathname === '/'
                    ? 'text-primary bg-surface-container-low font-semibold'
                    : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                }`}
              >
                Inicio
              </Link>
              {user && (
                <Link
                  href="/dashboard"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                    pathname === '/dashboard'
                      ? 'text-primary bg-surface-container-low font-semibold'
                      : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Mis Tareas</span>
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 bg-surface-container-low px-3 py-1.5 rounded-full border border-outline-variant/40">
                  <div className="w-7 h-7 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold uppercase">
                    {user.name.charAt(0)}
                  </div>
                  <span className="text-sm font-medium text-on-surface hidden md:inline">
                    {user.name}
                  </span>
                </div>
                <button
                  onClick={() => logout()}
                  className="inline-flex items-center space-x-1 px-3 py-2 border border-outline-variant/50 text-sm font-medium rounded-lg text-secondary bg-surface-container-lowest hover:bg-surface-container-low hover:text-rose-600 transition cursor-pointer"
                  title="Cerrar sesión"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Salir</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-secondary hover:text-primary hover:bg-surface-container-low rounded-lg transition"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center space-x-1.5 px-4 py-2 text-sm font-medium text-on-primary bg-primary-container hover:bg-primary rounded-lg shadow-sm shadow-primary/20 transition"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registrarse</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
