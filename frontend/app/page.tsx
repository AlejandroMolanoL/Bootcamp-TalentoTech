'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { user, logout } = useAuth();

  return (
    <div className="bg-background text-on-surface antialiased font-body-md text-body-md min-h-screen flex flex-col selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* TopNavBar (Adapted for Landing/Welcome) */}
      <header className="flex justify-between items-center w-full px-space-lg h-16 border-b border-outline-variant/40 bg-surface-container-lowest sticky top-0 z-50 shadow-sm backdrop-blur-md bg-opacity-95">
        <div className="flex items-center gap-space-lg">
          <Link className="flex items-center gap-space-sm group" href="/">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm group-hover:scale-105 transition-transform duration-150">
              <span className="material-symbols-outlined text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                terminal
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-semibold text-primary tracking-tight">
              TaskPulse
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-space-md ml-4 text-label-md font-label-md">
            <a
              className="text-secondary hover:text-on-surface px-space-sm py-1.5 transition-colors duration-150 rounded-lg hover:bg-surface-container-low"
              href="#caracteristicas"
            >
              Características
            </a>
            <a
              className="text-secondary hover:text-on-surface px-space-sm py-1.5 transition-colors duration-150 rounded-lg hover:bg-surface-container-low"
              href="#arquitectura"
            >
              Arquitectura (NestJS/Redis)
            </a>
            <a
              className="text-secondary hover:text-on-surface px-space-sm py-1.5 transition-colors duration-150 rounded-lg hover:bg-surface-container-low"
              href="#mockup-kanban"
            >
              Tablero en Vivo
            </a>
            <a
              className="text-secondary hover:text-on-surface px-space-sm py-1.5 transition-colors duration-150 rounded-lg hover:bg-surface-container-low"
              href="#metricas"
            >
              Métricas
            </a>
          </nav>
        </div>

        {/* Actions: Iniciar Sesión / Registrarse / Usuario */}
        <div className="flex items-center gap-space-sm">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/40 text-on-surface-variant font-label-sm text-label-sm mr-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Redis Node Activo</span>
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-space-md py-1.5 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
              >
                <span className="material-symbols-outlined text-[18px]">dashboard</span>
                <span>Ir al Panel</span>
              </Link>
              <button
                onClick={() => logout()}
                className="px-space-md py-1.5 text-label-md font-label-md text-secondary hover:text-rose-600 hover:bg-surface-container-low rounded-lg transition-colors duration-150"
                title="Cerrar sesión"
              >
                Salir
              </button>
            </div>
          ) : (
            <>
              <Link
                className="px-space-md py-1.5 text-label-md font-label-md text-secondary hover:text-on-surface hover:bg-surface-container-low rounded-lg transition-colors duration-150"
                href="/login"
              >
                Iniciar Sesión
              </Link>
              <Link
                className="flex items-center gap-1.5 px-space-md py-1.5 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md rounded-lg shadow-sm hover:shadow transition-all duration-150 active:scale-[0.98]"
                href="/register"
              >
                <span className="material-symbols-outlined text-[18px]">person_add</span>
                <span>Registrarse</span>
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 md:pt-20 md:pb-24 overflow-hidden border-b border-outline-variant/30">
        <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_40%,#000_70%,transparent_100%)]"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Live status badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/60 border border-outline-variant/50 text-on-secondary-fixed-variant font-label-sm text-label-sm mb-6 shadow-sm">
              <span className="material-symbols-outlined text-primary text-[16px]">sync_alt</span>
              <span>Sincronización milimétrica con TTL &amp; WebSockets</span>
              <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
              <span className="text-primary font-semibold">JWT v4.0</span>
            </div>

            <h1 className="font-headline-xl md:font-display-lg text-headline-xl md:text-display-lg font-bold text-on-background tracking-tight">
              Gestión y Control de Tareas Inteligente para Equipos
            </h1>

            <p className="mt-4 text-on-surface-variant font-body-lg text-body-lg leading-relaxed max-w-2xl mx-auto">
              Coordina tareas complejas con asignación estricta creador/asignado, persistencia en memoria ultra veloz con{' '}
              <span className="font-semibold text-primary">Redis</span>, estados dinámicos y tokens criptográficos JWT.
            </p>

            {/* CTA Cluster */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-space-sm sm:gap-space-md">
              {user ? (
                <Link
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                  href="/dashboard"
                >
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  <span>Ir al Tablero Principal</span>
                </Link>
              ) : (
                <Link
                  className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-md hover:shadow-lg transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                  href="/register"
                >
                  <span className="material-symbols-outlined text-[20px]">rocket_launch</span>
                  <span>Comenzar Ahora - Acceso Gratis</span>
                </Link>
              )}
              <a
                className="w-full sm:w-auto px-6 py-3 rounded-lg bg-surface-container-lowest border border-outline-variant/60 text-secondary hover:text-on-surface hover:bg-surface-container-low font-label-md text-label-md shadow-sm transition-all duration-150 flex items-center justify-center gap-2"
                href="#arquitectura"
              >
                <span className="material-symbols-outlined text-[20px]">database</span>
                <span>Ver Arquitectura Redis</span>
              </a>
            </div>

            {/* Tech badges sub-bar */}
            <div className="mt-10 flex flex-wrap justify-center items-center gap-6 text-on-surface-variant font-label-sm text-label-sm opacity-80">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-emerald-600 text-[18px]">verified</span>
                <span>NestJS Microservicios</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-primary text-[18px]">memory</span>
                <span>Redis 7.2 Cluster</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-indigo-600 text-[18px]">lock</span>
                <span>Auth JWT &amp; RBAC</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">timer</span>
                <span>Sesiones con TTL</span>
              </div>
            </div>
          </div>

          {/* Mockup del Tablero Kanban Interactivo (Preview) */}
          <div className="mt-12 lg:mt-16 rounded-xl border border-outline-variant/60 bg-surface-container-lowest shadow-2xl p-4 md:p-6 overflow-hidden" id="mockup-kanban">
            {/* Mockup Top bar with controls */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-outline-variant/40">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block"></span>
                </div>
                <div className="h-4 w-px bg-outline-variant/60"></div>
                <span className="font-headline-md text-headline-md font-semibold text-on-surface">Tablero Principal de Sprint</span>
                <span className="px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm">En Vivo</span>
              </div>
              {/* Mock search & filter bar */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-2 text-outline text-[18px]">search</span>
                  <input
                    className="pl-8 pr-3 py-1 text-body-sm font-body-sm rounded-lg border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:border-primary w-40 sm:w-56"
                    placeholder="Filtrar tareas..."
                    type="text"
                    defaultValue="Sprint #14"
                  />
                </div>
                <button className="px-3 py-1 bg-surface-container rounded-lg border border-outline-variant/50 text-secondary hover:text-on-surface text-label-md font-label-md flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px]">filter_list</span>
                  <span>Filtros</span>
                </button>
              </div>
            </div>

            {/* Kanban Columns Container */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mt-6 overflow-x-auto custom-scroll pb-2">
              {/* Column 1: Por Hacer */}
              <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/40 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                    <span className="font-headline-md text-headline-md font-semibold text-on-surface">Por Hacer</span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-secondary-fixed-variant text-label-sm font-label-sm font-bold">2</span>
                  </div>
                  <button className="text-secondary hover:text-on-surface">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
                {/* Cards */}
                <div className="space-y-3">
                  {/* Task Card 1 */}
                  <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-amber-500 rounded-r"></div>
                    <div className="flex items-center justify-between mb-1 pl-1">
                      <span className="font-label-sm text-label-sm text-secondary font-mono">TASK-1082</span>
                      <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-label-sm font-label-sm font-semibold">Media</span>
                    </div>
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface pl-1">Configurar Cluster Redis Sentinel</h4>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 pl-1 line-clamp-2">
                      Habilitar tolerancia a fallos y failover automático en la persistencia del laboratorio.
                    </p>
                    <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-body-sm font-body-sm text-secondary pl-1">
                      <div className="flex items-center gap-1 text-label-sm font-label-sm text-secondary">
                        <span className="material-symbols-outlined text-[15px]">schedule</span>
                        <span>Asignada hace 45m</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-primary-fixed text-primary font-bold text-[10px] flex items-center justify-center">RC</span>
                      </div>
                    </div>
                  </div>
                  {/* Task Card 2 */}
                  <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/50 shadow-sm hover:shadow-md transition-shadow relative">
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-secondary rounded-r"></div>
                    <div className="flex items-center justify-between mb-1 pl-1">
                      <span className="font-label-sm text-label-sm text-secondary font-mono">TASK-1085</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container-highest text-on-surface-variant text-label-sm font-label-sm font-semibold">Baja</span>
                    </div>
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface pl-1">Documentar Endpoints OpenAPI</h4>
                    <p className="text-body-sm font-body-sm text-on-surface-variant mt-1 pl-1">
                      Generar Swagger con especificación de headers Bearer para JWT.
                    </p>
                    <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-body-sm font-body-sm text-secondary pl-1">
                      <div className="flex items-center gap-1 text-label-sm font-label-sm text-secondary">
                        <span className="material-symbols-outlined text-[15px]">schedule</span>
                        <span>Asignada hace 1h</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container font-bold text-[10px] flex items-center justify-center">MG</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 2: En Progreso */}
              <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/40 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary-container"></span>
                    <span className="font-headline-md text-headline-md font-semibold text-on-surface">En Progreso</span>
                    <span className="px-2 py-0.5 rounded-full bg-secondary-container text-primary text-label-sm font-label-sm font-bold">1</span>
                  </div>
                  <button className="text-secondary hover:text-on-surface">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
                {/* Card activa destacada con Badge de tiempo exacto */}
                <div className="bg-surface-container-lowest p-3.5 rounded-lg border-2 border-primary-container/40 shadow-md relative">
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary-container rounded-r"></div>
                  <div className="flex items-center justify-between mb-1.5 pl-1">
                    <span className="font-label-sm text-label-sm text-primary font-mono font-semibold">TASK-1077</span>
                    <span className="px-2 py-0.5 rounded bg-error-container text-on-error-container text-label-sm font-label-sm font-semibold">Crítica</span>
                  </div>
                  <h4 className="font-label-md text-label-md font-semibold text-on-surface pl-1">Validación de Expiración TTL en Sesión</h4>
                  {/* Badge destacado de tiempo transcurrido */}
                  <div className="mt-2 pl-1 flex items-center gap-1.5">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-primary-fixed text-primary font-semibold text-label-sm font-label-sm">
                      <span className="material-symbols-outlined text-[14px]">history_toggle_off</span>
                      <span>Asignada hace 2h 15m</span>
                    </span>
                  </div>
                  <div className="mt-3 p-2 bg-surface-container-low rounded border border-outline-variant/30 text-body-sm font-body-sm">
                    <div className="flex items-center justify-between text-secondary mb-1">
                      <span className="font-semibold text-on-surface flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-tertiary">chat</span>
                        <span>Último Comentario</span>
                      </span>
                      <span className="text-[10px]">14:32:05 UTC</span>
                    </div>
                    <p className="text-on-surface-variant text-[11px] leading-tight italic">
                      &quot;Prueba de revocación ejecutada, Redis limpió la clave con éxito tras 900s.&quot;
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-body-sm font-body-sm text-secondary pl-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-primary text-on-primary font-bold text-[10px] flex items-center justify-center">AL</span>
                      <span className="text-label-sm font-label-sm text-on-surface">Alex López (Asignado)</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined text-[16px]">sync</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Column 3: Finalizada */}
              <div className="bg-surface-container-low rounded-xl p-4 border border-outline-variant/40 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="font-headline-md text-headline-md font-semibold text-on-surface">Finalizada</span>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary text-label-sm font-label-sm font-bold">1</span>
                  </div>
                  <button className="text-secondary hover:text-on-surface">
                    <span className="material-symbols-outlined text-[20px]">add</span>
                  </button>
                </div>
                {/* Finished card */}
                <div className="bg-surface-container-lowest p-3.5 rounded-lg border border-outline-variant/40 shadow-sm opacity-90 relative">
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-r"></div>
                  <div className="flex items-center justify-between mb-1 pl-1">
                    <span className="font-label-sm text-label-sm text-secondary font-mono">TASK-1064</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-label-sm font-label-sm font-semibold">Resuelta</span>
                  </div>
                  <h4 className="font-label-md text-label-md font-semibold text-on-surface pl-1 line-through text-outline">
                    Implementación de Hash Bcrypt en BD
                  </h4>
                  <p className="text-body-sm font-body-sm text-outline mt-1 pl-1">
                    Cifrado de credenciales de usuario con salt rounds 12 en base de datos PostgreSQL.
                  </p>
                  <div className="mt-3 pt-2 border-t border-outline-variant/30 flex items-center justify-between text-body-sm font-body-sm text-secondary pl-1">
                    <div className="flex items-center gap-1 text-label-sm font-label-sm text-emerald-700">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      <span>Completada ayer</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px] flex items-center justify-center">JP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Métricas en Vivo del Laboratorio */}
      <section className="py-12 bg-surface-container-lowest border-b border-outline-variant/30" id="metricas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1: Estado del Servidor */}
            <div className="p-6 rounded-xl border border-outline-variant/50 bg-surface-container-low shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md font-medium text-secondary">Estado del Servidor</span>
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <span className="material-symbols-outlined text-[20px]">dns</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display-lg text-on-surface">ONLINE</span>
                <span className="text-label-sm font-label-sm text-emerald-600 font-semibold">99.98% Uptime</span>
              </div>
              <p className="mt-2 text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>NestJS API Gateway • Sincronización continua</span>
              </p>
            </div>

            {/* Metric 2: Tiempo de respuesta Redis */}
            <div className="p-6 rounded-xl border border-outline-variant/50 bg-surface-container-low shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md font-medium text-secondary">Latencia Redis En Memoria</span>
                <div className="p-2 rounded-lg bg-primary-fixed text-primary">
                  <span className="material-symbols-outlined text-[20px]">bolt</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display-lg text-primary">&lt; 0.85 ms</span>
                <span className="text-label-sm font-label-sm text-secondary font-medium">p99 &lt; 1.2ms</span>
              </div>
              <p className="mt-2 text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-tertiary">speed</span>
                <span>Lecturas sub-milisegundo garantizadas por caché</span>
              </p>
            </div>

            {/* Metric 3: Usuarios y Conexiones Activas */}
            <div className="p-6 rounded-xl border border-outline-variant/50 bg-surface-container-low shadow-sm hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="font-label-md text-label-md font-medium text-secondary">Usuarios Activos en Sesión</span>
                <div className="p-2 rounded-lg bg-secondary-container text-on-secondary-fixed">
                  <span className="material-symbols-outlined text-[20px]">group</span>
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold font-display-lg text-on-surface">1,428</span>
                <span className="text-label-sm font-label-sm text-primary font-semibold">+18% hoy</span>
              </div>
              <p className="mt-2 text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-primary">security</span>
                <span>Tokens JWT verificados y vigentes</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Características Clave del Laboratorio (Bento Grid) */}
      <section className="py-16 md:py-24 bg-background" id="caracteristicas">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-primary font-label-md text-label-md uppercase tracking-wider font-semibold">
              Arquitectura &amp; Funcionalidades
            </span>
            <h2 className="mt-2 font-headline-xl text-headline-xl font-bold text-on-surface">
              Diseñado con Estándares de Producción
            </h2>
            <p className="mt-3 text-secondary font-body-md text-body-md">
              Cada componente está optimizado para dar claridad a los desarrolladores y control a los líderes de proyecto.
            </p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Item 1: Autenticación Segura y Cifrada */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary-container text-on-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[26px]">key</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                  Autenticación Segura &amp; Encriptada
                </h3>
                <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                  Cifrado unidireccional de contraseñas con salado criptográfico bcrypt. Firmado asimétrico de tokens JWT para autenticar cada micro-petición en el backend.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-label-sm font-label-sm text-secondary">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                <span>Algoritmo RS256 / HS256 configurable</span>
              </div>
            </div>

            {/* Bento Item 2: Sesiones Redis con TTL */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[26px]">timer_10</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                  Sesiones en Redis con TTL
                </h3>
                <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                  Control de expiración automática mediante Time-To-Live (TTL). Cierre de sesión instantáneo con invalidación de llaves en memoria sin sobrecargar la base de datos relacional.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-label-sm font-label-sm text-secondary">
                <span className="material-symbols-outlined text-[16px] text-tertiary">memory</span>
                <span>Gestión en O(1) con llaves estructuradas</span>
              </div>
            </div>

            {/* Bento Item 3: Creador vs Asignado */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-secondary-container text-on-secondary-fixed flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[26px]">assignment_ind</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                  Control Asignador vs Asignado
                </h3>
                <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                  Lógica granular de propiedad: solo el creador puede reclasificar prioridades, mientras que el asignado reporta progresos, horas y bloqueos técnicos.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-label-sm font-label-sm text-secondary">
                <span className="material-symbols-outlined text-[16px] text-primary">verified_user</span>
                <span>Permisos RBAC integrados</span>
              </div>
            </div>

            {/* Bento Item 4: Estados Dinámicos y Comentarios con Timestamp (Span 2) */}
            <div className="md:col-span-2 p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between hover:shadow-md transition-shadow">
              <div className="flex-1">
                <div className="w-12 h-12 rounded-xl bg-surface-container-highest text-primary flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[26px]">forum</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                  Estados Dinámicos &amp; Comentarios con Timestamp
                </h3>
                <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                  Historial cronológico inmutable. Cada cambio de estado genera un log temporal indexado, garantizando trazabilidad completa sobre cuellos de botella en el flujo de trabajo.
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant font-mono text-label-sm">
                    Por Hacer
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-secondary-container text-primary font-mono text-label-sm">
                    En Progreso
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-tertiary-container/30 text-tertiary font-mono text-label-sm">
                    En Revisión
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-mono text-label-sm">
                    Finalizada
                  </span>
                </div>
              </div>
              <div className="w-full md:w-64 bg-surface-container-low p-4 rounded-xl border border-outline-variant/40 text-body-sm font-body-sm">
                <div className="flex items-center gap-2 text-primary font-semibold mb-2">
                  <span className="material-symbols-outlined text-[18px]">history</span>
                  <span>Registro de Evento</span>
                </div>
                <div className="space-y-2 text-[11px] font-mono text-secondary">
                  <div className="pb-1 border-b border-outline-variant/30">
                    <span className="text-on-surface font-semibold">14:10:02</span> • Estado → En Progreso
                  </div>
                  <div className="pb-1 border-b border-outline-variant/30">
                    <span className="text-on-surface font-semibold">14:15:30</span> • Comentario agregado
                  </div>
                  <div>
                    <span className="text-on-surface font-semibold">16:45:12</span> • TTL extendido (+3600s)
                  </div>
                </div>
              </div>
            </div>

            {/* Bento Item 5: Persistencia Híbrida */}
            <div className="p-6 md:p-8 rounded-2xl bg-surface-container-lowest border border-outline-variant/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <div className="w-12 h-12 rounded-xl bg-outline-variant/40 text-on-surface flex items-center justify-center mb-6">
                  <span className="material-symbols-outlined text-[26px]">schema</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
                  Doble Capa de Persistencia
                </h3>
                <p className="text-on-surface-variant text-body-md font-body-md leading-relaxed">
                  Consistencia ACID en la base de datos relacional para entidades principales unida al poder volátil y caching de Redis para el flujo de tareas activas.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center gap-2 text-label-sm font-label-sm text-secondary">
                <span className="material-symbols-outlined text-[16px] text-primary">sync_saved_locally</span>
                <span>Write-Through Cache Pattern</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sección Arquitectura Técnica: NestJS + Redis + PostgreSQL/DB */}
      <section className="py-16 bg-surface-container-low border-y border-outline-variant/40" id="arquitectura">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="lg:w-1/2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm mb-4">
                <span className="material-symbols-outlined text-[16px]">code_blocks</span>
                <span>Stack Tecnológico de Vanguardia</span>
              </div>
              <h2 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
                Arquitectura Robusta y Desacoplada
              </h2>
              <p className="mt-4 text-on-surface-variant font-body-lg text-body-lg leading-relaxed">
                TaskPulse integra un backend modular con NestJS que desacopla la autenticación JWT y las operaciones CRUD de la capa de transacciones en tiempo real gestionada por Redis.
              </p>
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-primary">
                    <span className="material-symbols-outlined text-[22px]">developer_board</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">NestJS Framework Modular</h4>
                    <p className="text-body-sm font-body-sm text-secondary">
                      Inyección de dependencias estricta, DTOs con validación estricta y controladores REST optimizados.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-rose-600">
                    <span className="material-symbols-outlined text-[22px]">database</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">Redis Cache &amp; Session Store</h4>
                    <p className="text-body-sm font-body-sm text-secondary">
                      Estructuras clave-valor y hashes para almacenar estados transitorios, contadores y tokens con TTL configurable.
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-surface-container-lowest border border-outline-variant/40 text-tertiary">
                    <span className="material-symbols-outlined text-[22px]">shield</span>
                  </div>
                  <div>
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface">Estrategia JWT con Refresh Tokens</h4>
                    <p className="text-body-sm font-body-sm text-secondary">
                      Seguridad multinivel para revocar sesiones inmediatamente sin esperar a la expiración del Access Token.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Terminal / Architecture Diagram Card */}
            <div className="lg:w-1/2 w-full">
              <div className="rounded-xl border border-inverse-surface/80 bg-inverse-surface text-inverse-on-surface shadow-2xl p-5 font-mono text-body-sm overflow-hidden">
                <div className="flex items-center justify-between pb-3 mb-4 border-b border-outline/30">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    <span className="text-xs text-outline ml-2">redis-cli --cluster -p 6379</span>
                  </div>
                  <span className="text-xs px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-sans font-semibold">
                    CONNECTED
                  </span>
                </div>
                <div className="space-y-2 text-xs leading-relaxed">
                  <p className="text-outline-variant"># 1. Autenticación y Asignación de Tarea</p>
                  <p className="text-inverse-primary">&gt; AUTH_REQ {`{"user": "analista@taskpulse.io", "role": "DEV"}`}</p>
                  <p className="text-on-tertiary-container">&lt; JWT_SIGN: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... [TTL: 3600s]</p>
                  <div className="my-3 py-2 border-y border-outline/20">
                    <p className="text-outline-variant"># 2. Persistencia en Cache Redis</p>
                    <p className="text-inverse-primary">&gt; HSET task:1077 title &quot;Validación TTL&quot; creator &quot;admin&quot; assignee &quot;alopez&quot; status &quot;IN_PROGRESS&quot;</p>
                    <p className="text-tertiary-fixed">&lt; OK (0.34ms)</p>
                    <p className="text-inverse-primary">&gt; EXPIRE task:1077 86400</p>
                    <p className="text-tertiary-fixed">&lt; (integer) 1</p>
                  </div>
                  <p className="text-outline-variant"># 3. Log de Comentario con Timestamp</p>
                  <p className="text-inverse-primary">&gt; LPUSH task:1077:comments {`'{"author":"alopez","msg":"Validado","timestamp":1710945125}'`}</p>
                  <p className="text-on-tertiary-container">&lt; (integer) 4 (Transmisión instantánea por WebSockets)</p>
                </div>
                <div className="mt-4 pt-3 border-t border-outline/30 flex items-center justify-between text-[11px] text-outline">
                  <span>Host: redis.internal.taskpulse.lan</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                    <span>Replica sync 0 lag</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call To Action Final (Invitación a Iniciar Sesión / Registro) */}
      <section className="py-16 md:py-24 bg-surface-container-lowest relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-secondary-container text-primary flex items-center justify-center mx-auto mb-6 shadow-sm">
            <span className="material-symbols-outlined text-[32px]">task_alt</span>
          </div>
          <h2 className="font-headline-xl md:font-display-lg text-headline-xl md:text-display-lg font-bold text-on-surface tracking-tight">
            Lleva el control de tareas de tu equipo al siguiente nivel
          </h2>
          <p className="mt-4 text-on-surface-variant font-body-lg text-body-lg max-w-2xl mx-auto">
            Comienza a asignar proyectos con trazabilidad rigurosa, persistencia en memoria y la solidez técnica que exige tu infraestructura.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                href="/dashboard"
              >
                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                <span>Ir a Mis Tareas en el Panel</span>
              </Link>
            ) : (
              <>
                <Link
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-lg hover:shadow-xl transition-all duration-150 flex items-center justify-center gap-2 active:scale-[0.98]"
                  href="/register"
                >
                  <span className="material-symbols-outlined text-[20px]">person_add</span>
                  <span>Crear Cuenta en TaskPulse</span>
                </Link>
                <Link
                  className="w-full sm:w-auto px-8 py-3.5 rounded-lg bg-surface-container-low border border-outline-variant text-on-surface hover:bg-surface-container font-label-md text-label-md transition-all duration-150 flex items-center justify-center gap-2"
                  href="/login"
                >
                  <span className="material-symbols-outlined text-[20px]">login</span>
                  <span>Iniciar Sesión en el Panel</span>
                </Link>
              </>
            )}
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-body-sm font-body-sm text-secondary">
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">lock</span>
              <span>Cifrado SSL / TLS</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-primary">bolt</span>
              <span>Respuesta inmediata</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
              <span>Compatible con Docker</span>
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-outline-variant/40 bg-surface py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-md bg-primary-container flex items-center justify-center text-on-primary">
                <span className="material-symbols-outlined text-[18px]">terminal</span>
              </div>
              <span className="font-headline-md text-headline-md font-semibold text-primary">TaskPulse</span>
              <span className="text-secondary text-body-sm font-body-sm">| Sistema de Gestión y Control de Tareas</span>
            </div>
            <div className="flex flex-wrap items-center gap-6 text-label-md font-label-md text-secondary">
              <a className="hover:text-primary transition-colors" href="#caracteristicas">
                Características
              </a>
              <a className="hover:text-primary transition-colors" href="#arquitectura">
                Arquitectura
              </a>
              <a className="hover:text-primary transition-colors" href="#metricas">
                Métricas del Sistema
              </a>
              <a className="hover:text-primary transition-colors" href="#">
                API Docs (Swagger)
              </a>
            </div>
            <div className="text-body-sm font-body-sm text-outline">
              © 2025 TaskPulse Core. NestJS + Redis Persistence.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
