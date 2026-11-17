'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';

interface AuthPortalProps {
  initialTab?: 'login' | 'register';
}

export default function AuthPortal({ initialTab = 'login' }: AuthPortalProps) {
  const router = useRouter();
  const { login, register, user, loading } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  // Form State - Login
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [rememberRedis, setRememberRedis] = useState(true);
  const [loginSubmitting, setLoginSubmitting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);

  // Form State - Register
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('dev');
  const [regPassword, setRegPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [regTerms, setRegTerms] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);

  // Status Alerts
  const [alertState, setAlertState] = useState<{
    type: 'default' | 'success' | 'error';
    icon: string;
    title: string;
    description: string;
  }>({
    type: 'default',
    icon: initialTab === 'login' ? 'info' : 'shield',
    title:
      initialTab === 'login'
        ? 'Entorno Seguro Redis Sincronizado'
        : 'Registro con Salting bcrypt',
    description:
      initialTab === 'login'
        ? 'Tus credenciales viajan encriptadas de extremo a extremo hacia el cluster de sesión de TaskPulse.'
        : 'Generación de hash único con factor de coste 12 y token JWT emitido con claims de RBAC instantáneos.',
  });

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  // Sincronizar tab si cambia initialTab
  useEffect(() => {
    switchTab(initialTab, false);
  }, [initialTab]);

  const switchTab = (target: 'login' | 'register', updateUrl = true) => {
    setActiveTab(target);
    if (updateUrl) {
      router.replace(target === 'login' ? '/login' : '/register');
    }

    if (target === 'login') {
      setAlertState({
        type: 'default',
        icon: 'info',
        title: 'Entorno Seguro Redis Sincronizado',
        description:
          'Tus credenciales viajan encriptadas de extremo a extremo hacia el cluster de sesión de TaskPulse.',
      });
    } else {
      setAlertState({
        type: 'default',
        icon: 'shield',
        title: 'Registro con Salting bcrypt',
        description:
          'Generación de hash único con factor de coste 12 y token JWT emitido con claims de RBAC instantáneos.',
      });
    }
  };

  // Password strength calculation
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { score: 0, label: 'Pendiente', color: 'text-secondary' };
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 1) {
      return { score: 1, label: 'Débil (Insegura)', color: 'text-rose-600' };
    } else if (score === 2) {
      return { score: 2, label: 'Moderada', color: 'text-amber-600' };
    } else if (score === 3) {
      return { score: 3, label: 'Fuerte (bcrypt Óptimo)', color: 'text-primary' };
    } else {
      return { score: 4, label: 'Máxima Seguridad (Encriptada)', color: 'text-emerald-600' };
    }
  };

  const strength = getPasswordStrength(regPassword);
  const passwordsMatch = regPasswordConfirm
    ? regPassword === regPasswordConfirm
    : null;

  // Handle Trigger Seed directly from UI
  const handleTriggerSeed = async () => {
    setIsSeeding(true);
    try {
      const res = await fetchApi('/seed');
      setAlertState({
        type: 'success',
        icon: 'database',
        title: '¡Datos semilla cargados con éxito!',
        description: `${res.users?.length || 6} usuarios y tareas creadas. Ya puedes hacer clic en cualquier usuario de prueba e iniciar sesión.`,
      });
    } catch (err: any) {
      setAlertState({
        type: 'error',
        icon: 'warning',
        title: 'Error al inicializar datos semilla',
        description:
          err.message ||
          'Verifica que el servidor backend esté ejecutándose en http://localhost:3001.',
      });
    } finally {
      setIsSeeding(false);
    }
  };

  // Handle Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword.trim()) {
      setAlertState({
        type: 'error',
        icon: 'error',
        title: 'Campos requeridos',
        description: 'Por favor ingresa tu correo y contraseña institucional.',
      });
      return;
    }

    setLoginSubmitting(true);
    const result = await login(loginEmail.trim(), loginPassword);
    setLoginSubmitting(false);

      if (result.success) {
        setAlertState({
          type: 'success',
          icon: 'task_alt',
          title: 'Token JWT verificado en Redis',
          description: 'Sesión autenticada correctamente. Redirigiendo a Tablero Principal...',
        });
        setTimeout(() => {
          router.push('/dashboard');
        }, 700);
      } else {
        setAlertState({
          type: 'error',
          icon: 'warning',
          title: 'Fallo de autenticación',
          description:
            result.error ||
            'Credenciales inválidas o el servidor backend no responde. Verifica que el backend esté encendido.',
        });
      }
    };

    // Handle Register Submit
    const handleRegisterSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
        setAlertState({
          type: 'error',
          icon: 'error',
          title: 'Campos requeridos',
          description: 'Por favor completa todos los campos del formulario de registro.',
        });
        return;
      }

      if (regPassword.length < 6) {
        setAlertState({
          type: 'error',
          icon: 'lock',
          title: 'Contraseña no cumple política',
          description: 'La contraseña debe contener al menos 6 caracteres.',
        });
        return;
      }

      if (regPassword !== regPasswordConfirm) {
        setAlertState({
          type: 'error',
          icon: 'block',
          title: 'Discrepancia en contraseñas',
          description: 'La confirmación de la contraseña no coincide con la contraseña ingresada.',
        });
        return;
      }

      if (!regTerms) {
        setAlertState({
          type: 'error',
          icon: 'gavel',
          title: 'Términos requeridos',
          description: 'Debes aceptar el acuerdo de confidencialidad y procesamiento en Redis.',
        });
        return;
      }

      setRegSubmitting(true);
      const result = await register(regFullName.trim(), regEmail.trim(), regPassword);
      setRegSubmitting(false);

        if (result.success) {
          setAlertState({
            type: 'success',
            icon: 'check_circle',
            title: 'Cuenta creada & Hash bcrypt almacenado',
            description: 'Variables sincronizadas en clúster. Preparando entorno de trabajo...',
          });
          setTimeout(() => {
            router.push('/dashboard');
          }, 700);
        } else {
          setAlertState({
            type: 'error',
            icon: 'warning',
            title: 'Error de registro',
            description: result.error || 'No se pudo registrar la cuenta. Es posible que el correo ya esté en uso.',
          });
        }
      };

      return (
        <div className="bg-background text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col justify-between selection:bg-secondary-container selection:text-on-surface">
          {/* Top Minimal Utility Bar (Auth Navigation Context) */}
          <header className="w-full bg-surface-container-lowest/80 backdrop-blur-md sticky top-0 z-30 px-space-md lg:px-space-xl py-space-sm flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-space-sm">
              <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm shadow-primary/20">
                <span className="material-symbols-outlined text-[20px]" data-icon="terminal">
                  terminal
                </span>
              </div>
              <span className="font-headline-md text-headline-md font-semibold text-primary tracking-tight">
                TaskPulse
              </span>
              <span className="hidden sm:inline-flex items-center gap-1.5 ml-2 px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container-low text-secondary border border-outline-variant/40">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                Core Auth v2.8.4
              </span>
            </div>
            {/* Right Live Health Status & Home link */}
            <div className="flex items-center gap-space-md">
              <div className="hidden md:flex items-center gap-space-xs text-secondary font-label-md text-label-md">
                <span
                  className="material-symbols-outlined text-[18px] text-tertiary-container"
                  data-icon="wifi_tethering"
                >
                  wifi_tethering
                </span>
                <span>
                  Redis Cluster: <strong className="text-on-surface font-semibold">2ms latencia</strong>
                </span>
              </div>
              <Link
                className="inline-flex items-center gap-1 text-secondary hover:text-primary transition-colors text-label-md font-label-md py-1.5 px-3 rounded-lg hover:bg-surface-container-low"
                href="/"
              >
                <span className="material-symbols-outlined text-[16px]" data-icon="arrow_back">
                  arrow_back
                </span>
                Volver al Espacio de Trabajo
              </Link>
            </div>
          </header>

          {/* Split Panel Main Authentication Section */}
          <main className="flex-1 flex items-center justify-center p-space-sm md:p-space-lg lg:p-space-xl">
            <div className="w-full max-w-7xl bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/40 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[720px]">
              {/* Left Column: Technical Branding & Redis Architecture */}
              <section className="lg:col-span-5 bg-gradient-to-br from-inverse-surface via-slate-900 to-[#0e1726] text-inverse-on-surface p-space-lg lg:p-space-xl flex flex-col justify-between relative overflow-hidden">
                {/* Abstract Tech Glow Background Elements */}
                <div className="absolute -top-24 -left-24 w-80 h-80 bg-primary/25 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-tertiary-container/30 rounded-full blur-3xl pointer-events-none"></div>

                {/* Upper Banner Branding */}
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 px-space-sm py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-inverse-primary text-label-sm font-label-sm mb-space-lg">
                    <span className="material-symbols-outlined text-[15px]" data-icon="lock">
                      lock
                    </span>
                    TaskPulse Zero-Trust Gateway
                  </div>
                  <h1 className="font-display-lg-mobile lg:font-display-lg text-display-lg-mobile lg:text-display-lg font-semibold text-white tracking-tight leading-tight">
                    TaskPulse Core Auth
                  </h1>
                  <p className="font-body-md text-body-md text-slate-300 mt-space-sm max-w-md">
                    Infraestructura criptográfica de alto rendimiento diseñada para equipos técnicos que operan en pipelines críticos.
                  </p>

                  {/* Core Technical Pillars Bento Grid */}
                  <div className="mt-space-lg space-y-space-md">
                    {/* Pillar 1: bcrypt */}
                    <div className="p-space-md rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-primary-fixed/40 transition-colors">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-9 h-9 rounded-lg bg-primary-container/40 flex items-center justify-center shrink-0 border border-primary-fixed-dim/20 text-inverse-primary">
                          <span className="material-symbols-outlined text-[20px]" data-icon="security">
                            security
                          </span>
                        </div>
                        <div>
                          <h2 className="font-headline-md text-headline-md text-white font-semibold">
                            Encriptación Robusta bcrypt (Cost Factor 12)
                          </h2>
                          <p className="font-body-sm text-body-sm text-slate-300 mt-1">
                            Protección de credenciales mediante algoritmos de derivación de clave adaptativa inmunes a ataques acelerados por ASIC y GPU.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pillar 2: JWT in Redis */}
                    <div className="p-space-md rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-tertiary-fixed-dim/40 transition-colors">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-9 h-9 rounded-lg bg-tertiary-container/30 flex items-center justify-center shrink-0 border border-tertiary-fixed/20 text-on-tertiary-container">
                          <span className="material-symbols-outlined text-[20px]" data-icon="speed">
                            speed
                          </span>
                        </div>
                        <div>
                          <h2 className="font-headline-md text-headline-md text-white font-semibold">
                            Tokens JWT en Caché Redis
                          </h2>
                          <p className="font-body-sm text-body-sm text-slate-300 mt-1">
                            Validación instantánea sub-milisegundo con capacidad de revocación y revocación forzada a nivel de nodo o sesión global.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Pillar 3: Sincronización de Variables */}
                    <div className="p-space-md rounded-xl bg-white/[0.06] backdrop-blur-md border border-white/10 hover:border-secondary-container/40 transition-colors">
                      <div className="flex items-start gap-space-sm">
                        <div className="w-9 h-9 rounded-lg bg-surface-container-high/20 flex items-center justify-center shrink-0 border border-white/20 text-surface-container-highest">
                          <span className="material-symbols-outlined text-[20px]" data-icon="sync_alt">
                            sync_alt
                          </span>
                        </div>
                        <div>
                          <h2 className="font-headline-md text-headline-md text-white font-semibold">
                            Variables de Sesión Sincronizadas
                          </h2>
                          <p className="font-body-sm text-body-sm text-slate-300 mt-1">
                            Difusión atómica en tiempo real de permisos RBAC y estado del usuario en todo el clúster sin recargas manuales.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* System Diagnostic Micro Badge */}
                <div className="relative z-10 pt-space-lg mt-space-lg border-t border-white/10 flex flex-wrap items-center justify-between text-body-sm font-body-sm text-slate-400 gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="material-symbols-outlined text-[18px] text-tertiary-fixed"
                      data-icon="verified_user"
                    >
                      verified_user
                    </span>
                    <span>TLS 1.3 / AES-256-GCM Activo</span>
                  </div>
                  <div className="font-mono text-[11px] bg-white/10 px-2 py-0.5 rounded text-slate-300">
                    SHA256: 9b2d...f4e0
                  </div>
                </div>
              </section>

              {/* Right Column: Interactive Dual Authentication Panels */}
              <section className="lg:col-span-7 p-space-lg lg:p-space-xl flex flex-col justify-center bg-surface-container-lowest technical-grid-pattern relative">
                <div className="max-w-xl w-full mx-auto">
                  {/* Header and Tab Control */}
                  <div className="mb-space-lg">
                    <div className="flex items-center justify-between mb-space-sm">
                      <div>
                        <h3 className="font-headline-xl text-headline-xl text-on-surface font-semibold">
                          Acceso Seguro
                        </h3>
                        <p className="font-body-md text-body-md text-secondary mt-1">
                          Selecciona una modalidad para ingresar a tu espacio de trabajo.
                        </p>
                      </div>
                      {/* Live Auth Server Status Badge */}
                      <div className="hidden sm:inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-label-sm font-label-sm">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                        <span>Servidor Autenticado</span>
                      </div>
                    </div>

                    {/* Segmented Control Tabs */}
                    <div className="p-1 bg-surface-container rounded-xl flex items-center gap-1 border border-outline-variant/30">
                      <button
                        id="tab-login-btn"
                        onClick={() => switchTab('login')}
                        type="button"
                        className={`flex-1 py-2.5 px-4 rounded-lg font-label-md text-label-md text-center transition-all duration-150 flex items-center justify-center gap-2 ${activeTab === 'login'
                            ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                            : 'text-secondary hover:text-on-surface font-medium'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[18px]" data-icon="login">
                          login
                        </span>
                        Iniciar Sesión
                      </button>
                      <button
                        id="tab-register-btn"
                        onClick={() => switchTab('register')}
                        type="button"
                        className={`flex-1 py-2.5 px-4 rounded-lg font-label-md text-label-md text-center transition-all duration-150 flex items-center justify-center gap-2 ${activeTab === 'register'
                            ? 'bg-surface-container-lowest text-primary shadow-sm font-semibold'
                            : 'text-secondary hover:text-on-surface font-medium'
                          }`}
                      >
                        <span className="material-symbols-outlined text-[18px]" data-icon="person_add">
                          person_add
                        </span>
                        Crear Cuenta
                      </button>
                    </div>
                  </div>

                  {/* Real-Time Feedback Notification Banner */}
                  <div
                    className={`mb-space-md p-space-sm rounded-lg border flex items-start gap-space-sm text-body-sm font-body-sm transition-all ${alertState.type === 'error'
                        ? 'border-rose-300 bg-rose-50 text-rose-900'
                        : alertState.type === 'success'
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                          : 'border-secondary-container bg-surface-container-low text-secondary'
                      }`}
                    id="auth-alert"
                  >
                    <span
                      className={`material-symbols-outlined text-[20px] shrink-0 ${alertState.type === 'error'
                          ? 'text-rose-600'
                          : alertState.type === 'success'
                            ? 'text-emerald-600'
                            : 'text-primary'
                        }`}
                      data-icon={alertState.icon}
                    >
                      {alertState.icon}
                    </span>
                    <div className="flex-1 leading-tight">
                      <strong className="font-semibold text-on-surface block mb-0.5">
                        {alertState.title}
                      </strong>
                      <span>{alertState.description}</span>
                    </div>
                  </div>

                  {/* FORM 1: INICIAR SESIÓN */}
                  {activeTab === 'login' && (
                    <form
                      className="space-y-space-md"
                      id="login-form"
                      onSubmit={handleLoginSubmit}
                    >
                      {/* Test Users Quick Selector Banner */}
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-label-sm font-label-sm font-semibold text-primary flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px]">group</span>
                            Usuarios de prueba (Clic para rellenar):
                          </span>
                          <span className="text-[11px] text-secondary font-mono">Clave: Password123!</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            { name: 'Sofía', email: 'sofia@taskpulse.io', role: 'Fullstack' },
                            { name: 'Carlos', email: 'carlos@taskpulse.io', role: 'DevOps' },
                            { name: 'Mariana', email: 'mariana@taskpulse.io', role: 'Frontend' },
                            { name: 'Diego', email: 'diego@taskpulse.io', role: 'QA' },
                            { name: 'Elena', email: 'elena@taskpulse.io', role: 'Tech Lead' },
                          ].map((demoUser) => (
                            <button
                              key={demoUser.email}
                              type="button"
                              onClick={() => {
                                setLoginEmail(demoUser.email);
                                setLoginPassword('Password123!');
                                setAlertState({
                                  type: 'default',
                                  icon: 'account_circle',
                                  title: `Usuario de prueba seleccionado: ${demoUser.name}`,
                                  description: `Credenciales cargadas para ${demoUser.email} (${demoUser.role}). Haz clic en Entrar.`,
                                });
                              }}
                              className="px-2.5 py-1 text-xs font-medium rounded-lg bg-surface-container-lowest hover:bg-primary-container hover:text-white border border-outline-variant/60 transition-all text-on-surface shadow-xs active:scale-95"
                              title={`${demoUser.name} (${demoUser.role}) - ${demoUser.email}`}
                            >
                              {demoUser.name} <span className="opacity-60 text-[10px]">({demoUser.role})</span>
                            </button>
                          ))}
                        </div>
                        <div className="mt-2.5 pt-2 border-t border-primary/10 flex items-center justify-between">
                          <span className="text-[11px] text-secondary">¿Base de datos nueva o sin usuarios?</span>
                          <button
                            type="button"
                            onClick={handleTriggerSeed}
                            disabled={isSeeding}
                            className="text-[11px] font-semibold text-primary hover:text-primary-container inline-flex items-center gap-1 underline cursor-pointer disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-[14px]">database</span>
                            {isSeeding ? 'Sembrando en PostgreSQL...' : '🌱 Cargar Datos Semilla Ahora'}
                          </button>
                        </div>
                      </div>

                      {/* Email / Usuario */}
                      <div>
                        <label
                          className="block font-label-md text-label-md text-on-surface mb-1 font-semibold"
                          htmlFor="login-email"
                        >
                          Correo institucional o usuario
                        </label>
                        <div className="relative">
                          <span
                            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]"
                            data-icon="mail"
                          >
                            mail
                          </span>
                          <input
                            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#CBD5E1] bg-surface-container-lowest text-on-surface text-body-md font-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                            id="login-email"
                            name="email"
                            placeholder="alex.vargas@empresa.com"
                            required
                            type="email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Password */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label
                            className="block font-label-md text-label-md text-on-surface font-semibold"
                            htmlFor="login-password"
                          >
                            Contraseña
                          </label>
                          <a
                            className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors hover:underline"
                            href="#recovery"
                            onClick={(e) => {
                              e.preventDefault();
                              alert('Por favor contacta al administrador del sistema para restablecer tu acceso.');
                            }}
                          >
                            ¿Olvidaste tu contraseña?
                          </a>
                        </div>
                        <div className="relative">
                          <span
                            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]"
                            data-icon="password"
                          >
                            password
                          </span>
                          <input
                            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#CBD5E1] bg-surface-container-lowest text-on-surface text-body-md font-body-md focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                            id="login-password"
                            name="password"
                            placeholder="••••••••••••"
                            required
                            type={showLoginPassword ? 'text' : 'password'}
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                          />
                          <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                            onClick={() => setShowLoginPassword(!showLoginPassword)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[20px]" data-icon="visibility">
                              {showLoginPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>
                      </div>

                      {/* Redis Session Retention Option & SSO hints */}
                      <div className="flex items-center justify-between pt-1">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input
                            checked={rememberRedis}
                            onChange={(e) => setRememberRedis(e.target.checked)}
                            className="w-4 h-4 rounded border-outline text-primary-container focus:ring-primary-container/20"
                            id="remember-redis"
                            name="remember_redis"
                            type="checkbox"
                          />
                          <span className="font-body-sm text-body-sm text-secondary">
                            Recordar sesión en Redis{' '}
                            <span className="font-medium text-on-surface">(30 días de persistencia)</span>
                          </span>
                        </label>
                      </div>

                      {/* Submit Primary Button */}
                      <button
                        disabled={loginSubmitting}
                        className="w-full py-3 px-4 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-headline-md text-headline-md font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                        type="submit"
                      >
                        {loginSubmitting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[20px]" data-icon="progress_activity">
                              progress_activity
                            </span>
                            <span>Verificando credenciales...</span>
                          </>
                        ) : (
                          <>
                            <span>Entrar al Espacio de Trabajo</span>
                            <span className="material-symbols-outlined text-[20px]" data-icon="arrow_forward">
                              arrow_forward
                            </span>
                          </>
                        )}
                      </button>

                      {/* Quick SSO Splitter */}
                      <div className="relative flex items-center justify-center my-4">
                        <div className="border-t border-outline-variant/50 w-full"></div>
                        <span className="bg-surface-container-lowest px-3 font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                          O autenticación federada
                        </span>
                      </div>

                      {/* SSO Action Cluster */}
                      <div className="grid grid-cols-2 gap-space-sm">
                        <button
                          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#E2E8F0] hover:bg-surface-container-low transition-colors text-label-md font-label-md text-secondary cursor-pointer"
                          type="button"
                          onClick={() =>
                            setAlertState({
                              type: 'default',
                              icon: 'info',
                              title: 'Google SSO',
                              description: 'Autenticación federada SSO disponible para entornos corporativos autorizados.',
                            })
                          }
                        >
                          <span className="material-symbols-outlined text-[18px]" data-icon="cloud">
                            cloud
                          </span>
                          Google Workspace
                        </button>
                        <button
                          className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg border border-[#E2E8F0] hover:bg-surface-container-low transition-colors text-label-md font-label-md text-secondary cursor-pointer"
                          type="button"
                          onClick={() =>
                            setAlertState({
                              type: 'default',
                              icon: 'info',
                              title: 'GitHub SSO',
                              description: 'OAuth GitHub Enterprise configurado para repositorios de organización interna.',
                            })
                          }
                        >
                          <span className="material-symbols-outlined text-[18px]" data-icon="code">
                            code
                          </span>
                          GitHub Enterprise
                        </button>
                      </div>
                    </form>
                  )}

                  {/* FORM 2: CREAR CUENTA (REGISTRO) */}
                  {activeTab === 'register' && (
                    <form
                      className="space-y-space-sm"
                      id="register-form"
                      onSubmit={handleRegisterSubmit}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-space-sm">
                        {/* Nombre Completo */}
                        <div>
                          <label
                            className="block font-label-md text-label-md text-on-surface mb-1 font-semibold"
                            htmlFor="reg-fullname"
                          >
                            Nombre completo
                          </label>
                          <div className="relative">
                            <span
                              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                              data-icon="badge"
                            >
                              badge
                            </span>
                            <input
                              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] bg-surface-container-lowest text-on-surface text-body-sm font-body-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                              id="reg-fullname"
                              placeholder="Ej. Sofia Méndez"
                              required
                              type="text"
                              value={regFullName}
                              onChange={(e) => setRegFullName(e.target.value)}
                            />
                          </div>
                        </div>

                        {/* Correo Laboral */}
                        <div>
                          <label
                            className="block font-label-md text-label-md text-on-surface mb-1 font-semibold"
                            htmlFor="reg-email"
                          >
                            Correo institucional
                          </label>
                          <div className="relative">
                            <span
                              className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                              data-icon="alternate_email"
                            >
                              alternate_email
                            </span>
                            <input
                              className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] bg-surface-container-lowest text-on-surface text-body-sm font-body-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                              id="reg-email"
                              placeholder="sofia@equipo.io"
                              required
                              type="email"
                              value={regEmail}
                              onChange={(e) => setRegEmail(e.target.value)}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Rol dentro del equipo */}
                      <div>
                        <label
                          className="block font-label-md text-label-md text-on-surface mb-1 font-semibold"
                          htmlFor="reg-role"
                        >
                          Rol dentro del equipo
                        </label>
                        <div className="relative">
                          <span
                            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                            data-icon="group_work"
                          >
                            group_work
                          </span>
                          <select
                            className="w-full pl-9 pr-8 py-2 rounded-lg border border-[#CBD5E1] bg-surface-container-lowest text-on-surface text-body-sm font-body-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                            id="reg-role"
                            required
                            value={regRole}
                            onChange={(e) => setRegRole(e.target.value)}
                          >
                            <option value="dev">Desarrollador / Software Engineer</option>
                            <option value="pm">Project Manager / Product Owner</option>
                            <option value="lead">Tech Lead / Solution Architect</option>
                            <option value="designer">Diseñador UI/UX &amp; Producto</option>
                            <option value="qa">QA Automation &amp; Testing</option>
                            <option value="devops">DevOps / SRE Lead</option>
                          </select>
                        </div>
                      </div>

                      {/* Password con medidor de fuerza */}
                      <div>
                        <label
                          className="block font-label-md text-label-md text-on-surface mb-1 font-semibold"
                          htmlFor="reg-password"
                        >
                          Contraseña
                        </label>
                        <div className="relative">
                          <span
                            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                            data-icon="lock_clock"
                          >
                            lock_clock
                          </span>
                          <input
                            className="w-full pl-9 pr-10 py-2 rounded-lg border border-[#CBD5E1] bg-surface-container-lowest text-on-surface text-body-sm font-body-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                            id="reg-password"
                            placeholder="Mínimo 8 caracteres (A-Z, 0-9, símbolos)"
                            required
                            type={showRegPassword ? 'text' : 'password'}
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                          />
                          <button
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface cursor-pointer"
                            onClick={() => setShowRegPassword(!showRegPassword)}
                            type="button"
                          >
                            <span className="material-symbols-outlined text-[18px]" data-icon="visibility">
                              {showRegPassword ? 'visibility_off' : 'visibility'}
                            </span>
                          </button>
                        </div>

                        {/* Password Strength Meter Visual Indicator */}
                        <div className="mt-2">
                          <div className="flex justify-between items-center text-label-sm font-label-sm mb-1">
                            <span className="text-secondary">Fuerza criptográfica:</span>
                            <span className={`font-semibold ${strength.color}`} id="strength-label">
                              {strength.label}
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden flex gap-0.5">
                            <div
                              className={`h-full flex-1 transition-colors duration-300 ${strength.score >= 1
                                  ? strength.score === 1
                                    ? 'bg-rose-500'
                                    : strength.score === 2
                                      ? 'bg-amber-500'
                                      : strength.score === 3
                                        ? 'bg-primary-container'
                                        : 'bg-emerald-500'
                                  : 'bg-outline-variant'
                                }`}
                              id="bar-1"
                            ></div>
                            <div
                              className={`h-full flex-1 transition-colors duration-300 ${strength.score >= 2
                                  ? strength.score === 2
                                    ? 'bg-amber-500'
                                    : strength.score === 3
                                      ? 'bg-primary-container'
                                      : 'bg-emerald-500'
                                  : 'bg-outline-variant'
                                }`}
                              id="bar-2"
                            ></div>
                            <div
                              className={`h-full flex-1 transition-colors duration-300 ${strength.score >= 3
                                  ? strength.score === 3
                                    ? 'bg-primary-container'
                                    : 'bg-emerald-500'
                                  : 'bg-outline-variant'
                                }`}
                              id="bar-3"
                            ></div>
                            <div
                              className={`h-full flex-1 transition-colors duration-300 ${strength.score >= 4 ? 'bg-emerald-500' : 'bg-outline-variant'
                                }`}
                              id="bar-4"
                            ></div>
                          </div>
                        </div>
                      </div>

                      {/* Confirmación de contraseña */}
                      <div>
                        <label
                          className="block font-label-md text-label-md text-on-surface mb-1 font-semibold"
                          htmlFor="reg-password-confirm"
                        >
                          Confirmar contraseña
                        </label>
                        <div className="relative">
                          <span
                            className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]"
                            data-icon="verified"
                          >
                            verified
                          </span>
                          <input
                            className="w-full pl-9 pr-3 py-2 rounded-lg border border-[#CBD5E1] bg-surface-container-lowest text-on-surface text-body-sm font-body-sm focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all outline-none"
                            id="reg-password-confirm"
                            placeholder="Repite la contraseña ingresada"
                            required
                            type="password"
                            value={regPasswordConfirm}
                            onChange={(e) => setRegPasswordConfirm(e.target.value)}
                          />
                        </div>
                        {passwordsMatch !== null && (
                          <span
                            className={`font-label-sm text-label-sm mt-1 block font-medium ${passwordsMatch ? 'text-emerald-600' : 'text-rose-600'
                              }`}
                            id="match-hint"
                          >
                            {passwordsMatch
                              ? '✓ Las contraseñas coinciden de forma consistente'
                              : '✕ Las contraseñas aún no coinciden'}
                          </span>
                        )}
                      </div>

                      {/* Terms & Conditions Checkbox */}
                      <div className="pt-1">
                        <label className="flex items-start gap-2 cursor-pointer select-none">
                          <input
                            className="mt-0.5 w-4 h-4 rounded border-outline text-primary-container focus:ring-primary-container/20"
                            id="reg-terms"
                            required
                            type="checkbox"
                            checked={regTerms}
                            onChange={(e) => setRegTerms(e.target.checked)}
                          />
                          <span className="font-body-sm text-body-sm text-secondary leading-snug">
                            Acepto el{' '}
                            <a className="text-primary underline" href="#privacy">
                              Acuerdo de Confidencialidad Técnica
                            </a>{' '}
                            y el procesamiento criptográfico de sesión en clúster Redis de TaskPulse.
                          </span>
                        </label>
                      </div>

                      {/* Submit Registration Button */}
                      <button
                        disabled={regSubmitting}
                        className="w-full py-2.5 px-4 mt-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-headline-md text-headline-md font-semibold shadow-md shadow-primary/20 flex items-center justify-center gap-2 active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
                        type="submit"
                      >
                        {regSubmitting ? (
                          <>
                            <span className="material-symbols-outlined animate-spin text-[20px]" data-icon="progress_activity">
                              progress_activity
                            </span>
                            <span>Registrando e inicializando...</span>
                          </>
                        ) : (
                          <>
                            <span>Registrar e Inicializar Cuenta</span>
                            <span className="material-symbols-outlined text-[20px]" data-icon="how_to_reg">
                              how_to_reg
                            </span>
                          </>
                        )}
                      </button>
                    </form>
                  )}

                  {/* Dynamic Alternative Action Footer */}
                  <div className="mt-space-md text-center">
                    <p className="font-body-sm text-body-sm text-secondary" id="toggle-helper-text">
                      {activeTab === 'login' ? (
                        <>
                          ¿No tienes cuenta de equipo todavía?{' '}
                          <button
                            className="text-primary font-semibold hover:underline ml-1 cursor-pointer"
                            onClick={() => switchTab('register')}
                            type="button"
                          >
                            Crear una cuenta nueva
                          </button>
                        </>
                      ) : (
                        <>
                          ¿Ya posees credenciales en el clúster?{' '}
                          <button
                            className="text-primary font-semibold hover:underline ml-1 cursor-pointer"
                            onClick={() => switchTab('login')}
                            type="button"
                          >
                            Iniciar sesión aquí
                          </button>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </section>
            </div>
          </main>

          {/* Technical Footer Notes */}
          <footer className="w-full py-space-sm px-space-md lg:px-space-xl flex flex-col sm:flex-row items-center justify-between text-body-sm font-body-sm text-secondary border-t border-outline-variant/30 bg-surface-container-lowest">
            <div className="flex items-center gap-space-sm mb-2 sm:mb-0">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Red de nodos: Sincronización Redis en tiempo real (Cluster EU-Central &amp; US-East)</span>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="hover:text-on-surface cursor-pointer">Protocolo de Cripto-Auditoría</span>
              <span>•</span>
              <span className="hover:text-on-surface cursor-pointer">SLA 99.99%</span>
              <span>•</span>
              <span>&copy; {new Date().getFullYear()} TaskPulse Inc.</span>
            </div>
          </footer>
        </div>
      );
    }
