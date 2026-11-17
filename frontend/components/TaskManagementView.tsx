'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { fetchApi } from '../lib/api';

interface UserDirectoryItem {
  id?: number;
  name: string;
  role: string;
  email?: string;
  avatar?: string;
}

interface CommentData {
  id: number | string;
  authorName: string;
  authorRole: string;
  authorRoleBadge: string;
  avatarUrl: string;
  timestamp: string;
  content: string;
  commitTag?: string;
}

interface ChecklistItem {
  id: number;
  text: string;
  codeSnippet?: string;
  completed: boolean;
}

interface ActivityLogItem {
  id: number;
  icon: string;
  iconColor: string;
  title: string;
  description: string;
  timeAgo: string;
}

const DEFAULT_USERS_DIRECTORY: Record<string, UserDirectoryItem> = {
  sofia: {
    id: 1,
    name: 'Sofía Romero',
    role: 'Fullstack Dev',
    email: 'sofia@taskpulse.io',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBN4WvF0DcOtNZDLwaj_-CTFpcpGaMZjMC7VfyaaKFuNkler2pnKqanMG-X9sPvZ0tFqXSOv02Q2NpJLco31mANbmhv36cj8LNwRhxY_6ActqGJqw1fjPIKYKE_INmB4DkKAsciXOboXo4DiZhnCyfnocdaveJy2ZGzNHN2AJ2JBG50Qd8LcgcU7ESE7L4D5sMDZmXz-MFb2iTbiUSOW9CT02GqeGRyZK7SgpW5ErtH',
  },
  carlos: {
    id: 2,
    name: 'Carlos Mendoza',
    role: 'DevOps Lead',
    email: 'carlos@taskpulse.io',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDR9fOx7X7SPVVCbJTbfCcMAMsKh3GZ_4LsPVsIEqtV-gP3S90kxK3hWkkF1ibzQ0O3IQ5tFLSvwJfpgDJBKpaohp5paBGqgehdPWVDw1TzMcvIS3OSZOIuiz2kfszpxytxare_DLTdOT5JM7BB1oSLJz_IaUrWMDDVPTvHIb6420nylS9-K79z_XzgeZB7wnECBdAbNzamm4FWmyI_LRSgoL0-dVM4htlCF_I49k3O',
  },
  mariana: {
    id: 3,
    name: 'Mariana Silva',
    role: 'Frontend Architect',
    email: 'mariana@taskpulse.io',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuC0_VpXJcCVtkZuk7dvs6qEJ4SwrnQdEQLFhbqykoKLrFuBWs6smZQ4NOBsN1PiynSwD8kj_TrOYnaqwDihXdrZbPdeGW9rBbhR7ThFtvpOtY6OY1Yvzhtfs2ewL1PePrNB1sMmVx29LBWtALpSFXWMrq_RH4DeYYVBVzjo3rFWdzqnu2opz_yNl2QLH4AIJ8FN4EAhDRYpdtZNF5ocQSUtxashq60q6zFltAOyDFSL',
  },
  diego: {
    id: 4,
    name: 'Diego Torres',
    role: 'QA Automation',
    email: 'diego@taskpulse.io',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAIeBfNi6VkuaEUPARmIlM-wJ-VwPRNMaij1aRHh_MQNJWxZraPt_D_CoBL_NcLVDY6aAzO2YjH7X_tc8vutHoj3aawi8R7gGd7nG78uRx9R2u9o6xR2QGLDHoCTlyVzbSRQLpCfdSDTtqtggkpc7eM-iUnCHBDgD14jQcgDfhZdOPdVPrA68pIkg6Nc5IwQZm2c773BZg24Iv1mB4-kHAg4zvJPBM7k6DlQylhMBST',
  },
  juan: {
    id: 5,
    name: 'Juan Pérez',
    role: 'Lead Backend',
    email: 'juan@taskpulse.io',
    avatar:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCWZRngIaIdAICAtsPy1Uz4bF8Ig3SaPyMRJvUB361T2VLNrRKmjpnHl_fhdLhHTlPbhjIyOUhseZH2uo7opBV9vLP0-7_Z9qILVc8Gozf7nYzYdzg5xmPbj2ob1G4GxF58ervZaWtWVL63GzHIAPR6s0t9x_lyv5fbI88WUN_gXFXRVd1AvgDbZxPmH9s5xat3MtBlSICdFREbzIexhe4tSmOBXKQL2nFb-SnfcLmj',
  },
};

export default function TaskManagementView({ taskIdParam }: { taskIdParam?: string }) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center text-primary font-body-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            <span>Cargando interfaz de gestión de tarea...</span>
          </div>
        </div>
      }
    >
      <TaskManagementContent taskIdParam={taskIdParam} />
    </React.Suspense>
  );
}

function TaskManagementContent({ taskIdParam }: { taskIdParam?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const currentTaskId = taskIdParam || searchParams.get('id') || '1042';
  const taskCode = `#TP-${currentTaskId}`;

  // Task Main Data State
  const [taskTitle, setTaskTitle] = useState(
    'Implementar servicio de caché con Redis para cálculo de tiempos de asignación'
  );
  const [status, setStatus] = useState<'Pendiente' | 'En Proceso' | 'Finalizada'>('En Proceso');
  const [statusTimestampNote, setStatusTimestampNote] = useState('hace 45m por Carlos M.');
  const [selectedAssigneeKey, setSelectedAssigneeKey] = useState('sofia');
  const [assignedUser, setAssignedUser] = useState<UserDirectoryItem>(DEFAULT_USERS_DIRECTORY.sofia);
  const [creatorUser] = useState<UserDirectoryItem>(DEFAULT_USERS_DIRECTORY.juan);
  const [priority] = useState<'Alta' | 'Media' | 'Baja'>('Alta');

  // Checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 1,
      text: 'Instanciar contenedor Docker de Redis Alpine con autenticación de token rotativo.',
      completed: true,
    },
    {
      id: 2,
      text: 'Crear módulo TypeScript',
      codeSnippet: 'redisAssignmentTimer.service.ts',
      completed: true,
    },
    {
      id: 3,
      text: 'Implementar cálculo de delta tiempo de asignación en vivo y persistencia de reconexión.',
      completed: false,
    },
    {
      id: 4,
      text: 'Pruebas unitarias de carga de 5,000 llaves concurrentes bajo Jest con mock de sesión.',
      completed: false,
    },
  ]);

  // Comments Stream
  const [comments, setComments] = useState<CommentData[]>([
    {
      id: 1,
      authorName: 'Juan Pérez',
      authorRole: 'Lead Backend',
      authorRoleBadge: 'Lead Backend (Creador)',
      avatarUrl: DEFAULT_USERS_DIRECTORY.juan.avatar || '',
      timestamp: 'Ayer a las 04:45 PM',
      content:
        '@Sofía Romero, ya dejé desplegado el nodo de pruebas en el clúster staging. Recuerda utilizar la clave canónica task:ttl:{taskId} para sincronizar automáticamente el TTL cuando el usuario cambie el estado a "En Proceso". ¿Pudiste validar la latencia de respuesta?',
    },
    {
      id: 2,
      authorName: 'Sofía Romero',
      authorRole: 'Fullstack Dev',
      authorRoleBadge: 'Fullstack Dev (Asignada)',
      avatarUrl: DEFAULT_USERS_DIRECTORY.sofia.avatar || '',
      timestamp: 'Hoy a las 11:20 AM',
      content:
        '¡Hola Juan! Sí, la latencia promedio bajó de 180ms a 3.4ms consumiendo directamente desde la memoria de Redis. Acabo de subir el commit con el pipeline reactivo y dejé activo el contador que se visualiza en este panel lateral. En cuanto pasemos la suite de integración cerramos el ticket.',
      commitTag: 'commit: 8a93fe2 (feat: redis pipeline live stream)',
    },
  ]);
  const [newCommentInput, setNewCommentInput] = useState('');

  // Activity Logs
  const [activityLogs, setActivityLogs] = useState<ActivityLogItem[]>([
    {
      id: 1,
      icon: 'cached',
      iconColor: 'text-primary',
      title: 'Redis Key Expire recalculado por webhook a 43200s.',
      description: '',
      timeAgo: 'Hace 12 min',
    },
    {
      id: 2,
      icon: 'update',
      iconColor: 'text-tertiary',
      title: 'Sofía Romero actualizó el checklist (2/4 completados).',
      description: '',
      timeAgo: 'Hace 28 min',
    },
    {
      id: 3,
      icon: 'person',
      iconColor: 'text-secondary',
      title: 'Carlos M. cambió el estado a "En Proceso".',
      description: '',
      timeAgo: 'Hace 45 min',
    },
  ]);

  // Real-time ticking Clock backed by Redis TTL
  const [secondsElapsed, setSecondsElapsed] = useState(3 * 86400 + 4 * 3600 + 12 * 60 + 34);
  const [redisTTL, setRedisTTL] = useState(1420);

  // Modal: Crear Tarea
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalDesc, setModalDesc] = useState('');
  const [modalAssignee, setModalAssignee] = useState('sofia');
  const [modalPriority, setModalPriority] = useState('Media');
  const [isSavingTask, setIsSavingTask] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState('Operación realizada con éxito');
  const [showToast, setShowToast] = useState(false);

  const showToastNotification = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3500);
  }, []);

  // Timer Tick
  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsElapsed((prev) => prev + 1);
      setRedisTTL((prev) => (prev > 10 ? prev - 1 : 1420));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Format Elapsed Time
  const formattedElapsedTime = () => {
    const days = Math.floor(secondsElapsed / 86400);
    const hours = Math.floor((secondsElapsed % 86400) / 3600);
    const mins = Math.floor((secondsElapsed % 3600) / 60);
    const secs = secondsElapsed % 60;
    return `${days} días, ${hours} horas, ${mins} min, ${secs < 10 ? '0' : ''}${secs}s`;
  };

  // Status Change Handler
  const handleStatusChange = async (newVal: 'Pendiente' | 'En Proceso' | 'Finalizada') => {
    setStatus(newVal);
    setStatusTimestampNote(`hace un momento por ${user?.name || 'Usuario actual'}`);
    showToastNotification(`Estado actualizado a: ${newVal} (Evento emitido a Redis)`);

    // Optional backend sync if live task
    const numId = parseInt(currentTaskId, 10);
    if (!isNaN(numId)) {
      try {
        const statusMap: Record<string, number> = { Pendiente: 1, 'En Proceso': 2, Finalizada: 3 };
        await fetchApi(`/tasks/${numId}/status`, {
          method: 'PATCH',
          body: JSON.stringify({ statusId: statusMap[newVal] || 2 }),
        }).catch(() => null);
      } catch (e) {
        // quiet fallback
      }
    }
  };

  // Reassignment Handler
  const handleReassign = async (key: string) => {
    setSelectedAssigneeKey(key);
    const targetUser = DEFAULT_USERS_DIRECTORY[key];
    if (targetUser) {
      setAssignedUser(targetUser);
      showToastNotification(`Tarea reasignada a: ${targetUser.name} (Notificación enviada)`);

      // Add to activity log
      setActivityLogs((prev) => [
        {
          id: Date.now(),
          icon: 'swap_horiz',
          iconColor: 'text-primary',
          title: `Reasignado a ${targetUser.name} por ${user?.name || 'Admin'}.`,
          description: '',
          timeAgo: 'Justo ahora',
        },
        ...prev,
      ]);

      const numId = parseInt(currentTaskId, 10);
      if (!isNaN(numId) && targetUser.id) {
        try {
          await fetchApi(`/tasks/${numId}/assign`, {
            method: 'PATCH',
            body: JSON.stringify({ assignedToId: targetUser.id }),
          }).catch(() => null);
        } catch (e) {
          // fallback
        }
      }
    }
  };

  // Toggle Checklist item
  const handleToggleChecklist = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item))
    );
    const updatedCount = checklist.filter((i) => (i.id === id ? !i.completed : i.completed)).length;
    showToastNotification(`Criterio de aceptación actualizado (${updatedCount}/${checklist.length})`);
  };

  // Submit Comment
  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentInput.trim()) return;

    const newCommentObj: CommentData = {
      id: Date.now(),
      authorName: user?.name || 'Tú (Sesión Actual)',
      authorRole: user?.role || 'Colaborador',
      authorRoleBadge: 'Colaborador',
      avatarUrl:
        'https://lh3.googleusercontent.com/aida-public/AB6AXuAQbsykE8UfGtNnJHCr0g2c-BjJsa2iTuELBT6s91KU-ieSgod4PCtQVGk3GxOK0-kRZF58r0czaAli174Zkr1Xnt7M4J2nSbJfiAok5f_y9s-egtJZ0v_SxWEMRf-n0Gkp8RXrsiSIqWrX9MNXiJbvfaSij8JAOQmYIxwUwdGc5S0gFnBRZLWq3fjgrA10WxuM0C8IJCs3t1L_QT2YkR51Epb-zPOKix-WTYnjJbwB',
      timestamp: 'Justo ahora',
      content: newCommentInput.trim(),
    };

    setComments((prev) => [...prev, newCommentObj]);
    setNewCommentInput('');
    showToastNotification('Comentario publicado en el hilo (Persistido en PostgreSQL y Redis)');

    const numId = parseInt(currentTaskId, 10);
    if (!isNaN(numId)) {
      try {
        await fetchApi(`/tasks/${numId}/comments`, {
          method: 'POST',
          body: JSON.stringify({ content: newCommentObj.content }),
        }).catch(() => null);
      } catch (e) {
        // silent fallback
      }
    }
  };

  // Create Task Modal Submit
  const handleModalCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalTitle.trim()) return;

    setIsSavingTask(true);
    const assigneeObj = DEFAULT_USERS_DIRECTORY[modalAssignee] || DEFAULT_USERS_DIRECTORY.sofia;

    try {
      if (assigneeObj.id) {
        await fetchApi('/tasks', {
          method: 'POST',
          body: JSON.stringify({
            title: modalTitle.trim(),
            description: modalDesc.trim() || undefined,
            assignedToId: assigneeObj.id,
            statusId: 1, // Pendiente
          }),
        }).catch(() => null);
      }

      setIsCreateModalOpen(false);
      showToastNotification(`Tarea "${modalTitle.substring(0, 25)}..." asignada a ${assigneeObj.name} (${modalPriority})`);
      setModalTitle('');
      setModalDesc('');
    } catch (err) {
      showToastNotification('Error al crear tarea');
    } finally {
      setIsSavingTask(false);
    }
  };

  return (
    <div className="h-full bg-background text-on-surface font-body-md text-body-md antialiased overflow-x-hidden min-h-screen flex selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* =========================================================================
          1. SideNavBar Anchor Component
          ========================================================================= */}
      <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col justify-between p-space-md border-r border-outline-variant/40 bg-surface z-30 shadow-none">
        <div className="flex flex-col gap-space-md">
          {/* Header Workspace */}
          <div className="flex items-center gap-space-sm px-space-xs pb-space-sm border-b border-outline-variant/30">
            <div className="w-9 h-9 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[20px]" data-icon="terminal">
                terminal
              </span>
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="font-headline-md text-headline-md font-semibold text-primary truncate tracking-tight">
                TaskPulse Workspace
              </span>
              <span className="font-label-sm text-label-sm text-secondary truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sesión activa Redis sincronizada
              </span>
            </div>
          </div>

          {/* CTA Crear Tarea Rápida */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full flex items-center justify-center gap-space-xs bg-primary-container text-on-primary py-space-sm px-space-md rounded-lg font-label-md text-label-md font-medium shadow-sm hover:opacity-95 active:scale-[0.99] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]" data-icon="add">
              add
            </span>
            <span>Crear Tarea Rápida</span>
          </button>

          {/* Navigation Tabs */}
          <nav className="flex flex-col gap-1 mt-space-xs">
            {/* Tablero Principal (Link to Kanban Dashboard) */}
            <Link
              href="/dashboard"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="dashboard">
                dashboard
              </span>
              <span className="font-label-md text-label-md">Tablero Principal</span>
            </Link>

            {/* Mis Tareas Asignadas (ACTIVE - Contextual Intent in this Task Management View) */}
            <Link
              href="/management"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg bg-secondary-container text-on-secondary-container font-semibold transition-colors duration-150 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="assignment_ind">
                assignment_ind
              </span>
              <span className="font-label-md text-label-md">Mis Tareas Asignadas</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-primary-container text-on-primary font-bold">
                1
              </span>
            </Link>

            {/* Tareas Asignadas por Mí */}
            <Link
              href="/dashboard"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="assignment_turned_in">
                assignment_turned_in
              </span>
              <span className="font-label-md text-label-md">Tareas Asignadas por Mí</span>
            </Link>

            {/* Estados de Tareas */}
            <Link
              href="/dashboard"
              className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 active:scale-[0.99]"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="view_kanban">
                view_kanban
              </span>
              <span className="font-label-md text-label-md">Estados de Tareas</span>
            </Link>

            {/* Registro de Actividad */}
            <button
              onClick={() => showToastNotification('Feed histórico de auditoría cargado')}
              className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="history">
                history
              </span>
              <span className="font-label-md text-label-md">Registro de Actividad</span>
            </button>

            {/* Logs de Caché y Sesión */}
            <button
              onClick={() => showToastNotification('Redis Stream activo: latencia 3.4ms, 0 frames perdidos')}
              className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="terminal">
                terminal
              </span>
              <span className="font-label-md text-label-md">Logs de Caché y Sesión</span>
            </button>
          </nav>
        </div>

        {/* Footer SideNav Tabs */}
        <div className="pt-space-md border-t border-outline-variant/30 flex flex-col gap-1">
          <button
            onClick={() => showToastNotification('Ajustes del workspace sincronizados')}
            className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="settings">
              settings
            </span>
            <span className="font-label-md text-label-md">Configuración</span>
          </button>
          <button
            onClick={() => router.push('/login')}
            className="flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-error hover:bg-error-container/30 transition-colors duration-150 text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="logout">
              logout
            </span>
            <span className="font-label-md text-label-md">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* =========================================================================
          2. Main Content Container
          ========================================================================= */}
      <div className="flex-1 flex flex-col pl-64 min-w-0">
        {/* TopNavBar */}
        <header className="flex justify-between items-center w-full px-space-lg h-16 border-b border-outline-variant/40 bg-surface-container-lowest sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-space-md flex-1 max-w-xl">
            <Link href="/dashboard" className="font-headline-md text-headline-md font-semibold text-primary tracking-tight hover:opacity-90 transition-opacity">
              TaskPulse
            </Link>
            <span className="text-outline-variant/80">/</span>
            {/* Search Bar */}
            <div className="relative w-full max-w-md">
              <span
                className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]"
                data-icon="search"
              >
                search
              </span>
              <input
                className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg pl-9 pr-4 py-1.5 font-body-sm text-body-sm text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                placeholder="Buscar tareas, sprints, logs o usuarios (Ctrl + K)..."
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-space-sm">
            {/* Trailing Icon Actions */}
            <button
              onClick={() => showToastNotification('Sin nuevas alertas de asignación')}
              className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors relative cursor-pointer"
              title="Notificaciones"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="notifications">
                notifications
              </span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error"></span>
            </button>
            <button
              onClick={() => showToastNotification(`Redis Sync Health: 3.4ms latencia | Conexión WebSocket OK`)}
              className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              title="Redis Sync Health"
            >
              <span className="material-symbols-outlined text-[20px] text-tertiary-container" data-icon="wifi_tethering">
                wifi_tethering
              </span>
            </button>
            <button
              onClick={() => showToastNotification('Guía técnica de endpoints y comandos Redis abierta')}
              className="p-2 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors cursor-pointer"
              title="Ayuda y Docs"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="help">
                help
              </span>
            </button>
            <div className="h-6 w-px bg-outline-variant/50 mx-1"></div>

            {/* Trailing Primary Action 'Nueva Tarea' */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center gap-space-xs bg-primary-container text-on-primary px-space-md py-1.5 rounded-lg font-label-md text-label-md font-semibold shadow-xs hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]" data-icon="add_circle">
                add_circle
              </span>
              <span>Nueva Tarea</span>
            </button>

            {/* Avatar del usuario actual */}
            <div className="flex items-center gap-2 pl-2">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-bold text-xs shadow-xs border border-outline-variant/70">
                {user?.name ? user.name.slice(0, 2).toUpperCase() : 'SR'}
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================================
            3. Main Canvas: Task Detail Split Pane
            ========================================================================= */}
        <main className="flex-1 p-space-lg max-w-[1600px] w-full mx-auto">
          {/* Breadcrumbs & Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-space-md pb-space-sm border-b border-outline-variant/30">
            <div className="flex items-center gap-2 text-secondary font-label-md text-label-md">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Workspace
              </Link>
              <span>/</span>
              <span className="hover:text-primary transition-colors cursor-pointer">Sprint Backend 42</span>
              <span>/</span>
              <span className="font-semibold text-primary px-2 py-0.5 rounded bg-secondary-container">
                {taskCode}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container text-on-surface font-label-sm text-label-sm border border-outline-variant/50">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Redis TTL Sync: {redisTTL}s
              </span>
              <button
                onClick={() => showToastNotification('Enlace directo copiado al portapapeles')}
                className="inline-flex items-center gap-1 text-secondary hover:text-on-surface p-1.5 rounded hover:bg-surface-container-low transition-colors cursor-pointer"
                title="Compartir tarea"
              >
                <span className="material-symbols-outlined text-[18px]" data-icon="share">
                  share
                </span>
              </button>
              <button
                onClick={() => showToastNotification('Opciones avanzadas de tarea')}
                className="inline-flex items-center gap-1 text-secondary hover:text-on-surface p-1.5 rounded hover:bg-surface-container-low transition-colors cursor-pointer"
                title="Más acciones"
              >
                <span className="material-symbols-outlined text-[18px]" data-icon="more_vert">
                  more_vert
                </span>
              </button>
            </div>
          </div>

          {/* Bento Grid Layout: 12-Column Responsive Model */}
          <div className="grid grid-cols-12 gap-space-lg items-start">
            {/* ===================================================================
                LEFT 8 COLUMNS: Main Task Focus & Conversation Thread
                =================================================================== */}
            <div className="col-span-12 lg:col-span-8 flex flex-col gap-space-lg">
              {/* Card 1: Task Header & Description */}
              <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-space-lg shadow-xs">
                {/* Top Badges & Status Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-space-md">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-xs font-mono font-bold bg-surface-container text-primary rounded border border-outline-variant/30">
                      {taskCode}
                    </span>
                    {/* Priority Badge */}
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-error-container text-on-error-container border border-error/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-error"></span>
                      Prioridad: {priority}
                    </span>
                  </div>

                  {/* Interactive Status Dropdown */}
                  <div className="relative inline-block text-left" id="status-container">
                    <div className="flex items-center gap-2">
                      <label className="font-label-sm text-label-sm text-secondary">Estado actual:</label>
                      <div className="relative">
                        <select
                          className="appearance-none bg-secondary-container text-on-secondary-container font-semibold font-label-md text-label-md py-1.5 pl-3 pr-8 rounded-lg border border-outline-variant/40 cursor-pointer focus:ring-2 focus:ring-primary focus:outline-none transition-all"
                          value={status}
                          onChange={(e) => handleStatusChange(e.target.value as any)}
                        >
                          <option value="Pendiente">Pendiente</option>
                          <option value="En Proceso">En Proceso</option>
                          <option value="Finalizada">Finalizada</option>
                        </select>
                        <span
                          className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[18px] text-secondary"
                          data-icon="expand_more"
                        >
                          expand_more
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Status timestamp note */}
                <div className="mb-space-md flex items-center gap-2 px-3 py-1.5 bg-surface-container-low rounded-lg border border-outline-variant/20">
                  <span className="material-symbols-outlined text-[16px] text-primary" data-icon="schedule">
                    schedule
                  </span>
                  <p className="font-body-sm text-body-sm text-secondary" id="status-timestamp">
                    Cambiado a <span className="font-semibold text-on-surface">{status}</span> {statusTimestampNote}
                  </p>
                </div>

                {/* Editable Task Title */}
                <div className="group relative mb-space-md">
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="text"
                      value={taskTitle}
                      onChange={(e) => setTaskTitle(e.target.value)}
                      onBlur={() => showToastNotification('Título de la tarea guardado en la base de datos')}
                      className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight hover:bg-surface-container-low/50 px-2 py-1 -ml-2 rounded-lg transition-colors border border-transparent hover:border-outline-variant/40 focus:bg-white focus:border-primary-container focus:outline-none w-full"
                    />
                    <span
                      className="material-symbols-outlined text-secondary opacity-0 group-hover:opacity-100 transition-opacity text-[20px] mt-2 flex-shrink-0"
                      data-icon="edit"
                      title="Haz clic para editar título"
                    >
                      edit
                    </span>
                  </div>
                  <p className="font-label-sm text-label-sm text-secondary mt-1">
                    Presiona Enter o haz clic fuera para guardar cambios de título
                  </p>
                </div>

                {/* Detailed Description & Requirements Checklist */}
                <div className="border-t border-outline-variant/30 pt-space-md">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-space-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]" data-icon="description">
                      description
                    </span>
                    <span>Especificación de Requerimientos</span>
                  </h3>
                  <p className="font-body-md text-body-md text-secondary leading-relaxed mb-space-md">
                    Configurar la capa de almacenamiento en memoria de alta velocidad mediante Redis v7.x dentro del
                    clúster de backend. El objetivo es persistir timestamps de asignación de tareas con TTL variable y
                    evitar llamadas redundantes a la base de datos principal PostgreSQL al consultar métricas de
                    asignación en tiempo real.
                  </p>

                  {/* Checklists with Interactive Controls */}
                  <div className="bg-surface-container-low/70 border border-outline-variant/30 rounded-lg p-space-md flex flex-col gap-2.5">
                    <span className="font-label-md text-label-md font-semibold text-on-surface mb-1">
                      Checklist de Criterios de Aceptación:
                    </span>
                    {checklist.map((item) => (
                      <label key={item.id} className="flex items-start gap-3 cursor-pointer group select-none">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => handleToggleChecklist(item.id)}
                          className="mt-0.5 rounded text-primary-container focus:ring-primary-container border-outline cursor-pointer"
                        />
                        <span
                          className={`font-body-sm text-body-sm transition-colors ${
                            item.completed
                              ? 'text-on-surface line-through opacity-80'
                              : 'text-on-surface group-hover:text-primary'
                          }`}
                        >
                          {item.text}{' '}
                          {item.codeSnippet && (
                            <code className="px-1.5 py-0.5 bg-surface-container rounded font-mono text-xs text-primary">
                              {item.codeSnippet}
                            </code>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </section>

              {/* Card 2: Comments Thread (Parte 2 Requisito Explícito) */}
              <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-space-lg shadow-xs">
                <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 mb-space-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]" data-icon="forum">
                      forum
                    </span>
                    <h2 className="font-headline-md text-headline-md font-semibold text-on-surface">
                      Hilo de Comentarios y Avances
                    </h2>
                  </div>
                  <span
                    className="font-label-sm text-label-sm px-2.5 py-0.5 bg-surface-container text-primary font-bold rounded-full"
                    id="comment-counter"
                  >
                    {comments.length} comentarios
                  </span>
                </div>

                {/* Chronological Comments Stream */}
                <div className="flex flex-col gap-space-md mb-space-lg" id="comments-container">
                  {comments.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start gap-space-sm bg-surface-container-low/40 p-space-md rounded-xl border border-outline-variant/20 transition-all"
                    >
                      <img
                        alt={`Avatar ${c.authorName}`}
                        className="w-10 h-10 rounded-full object-cover border border-outline-variant/70 flex-shrink-0"
                        src={c.avatarUrl}
                      />
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-2">
                            <span className="font-label-md text-label-md font-semibold text-on-surface">
                              {c.authorName}
                            </span>
                            <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-primary-fixed text-on-primary-fixed font-medium">
                              {c.authorRoleBadge}
                            </span>
                          </div>
                          <span className="font-label-sm text-label-sm text-secondary">{c.timestamp}</span>
                        </div>
                        <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                          {c.content}
                        </p>
                        {c.commitTag && (
                          <div className="mt-2 flex items-center gap-2 text-xs font-mono text-primary bg-surface-container-low px-2 py-1 rounded w-fit border border-outline-variant/30">
                            <span className="material-symbols-outlined text-[14px]" data-icon="commit">
                              commit
                            </span>
                            {c.commitTag}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Comment Input Box */}
                <form
                  className="flex flex-col gap-space-sm bg-surface-container-low p-space-md rounded-xl border border-outline-variant/40"
                  onSubmit={handlePostComment}
                >
                  <div className="flex items-center gap-2">
                    <img
                      alt="Usuario actual"
                      className="w-7 h-7 rounded-full object-cover"
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQbsykE8UfGtNnJHCr0g2c-BjJsa2iTuELBT6s91KU-ieSgod4PCtQVGk3GxOK0-kRZF58r0czaAli174Zkr1Xnt7M4J2nSbJfiAok5f_y9s-egtJZ0v_SxWEMRf-n0Gkp8RXrsiSIqWrX9MNXiJbvfaSij8JAOQmYIxwUwdGc5S0gFnBRZLWq3fjgrA10WxuM0C8IJCs3t1L_QT2YkR51Epb-zPOKix-WTYnjJbwB"
                    />
                    <span className="font-label-md text-label-md font-medium text-on-surface">
                      Escribir un comentario...
                    </span>
                  </div>
                  <div className="relative">
                    <textarea
                      className="w-full bg-white border border-outline-variant/60 rounded-lg p-3 font-body-md text-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all resize-y custom-scrollbar"
                      id="comment-textarea"
                      placeholder="Añadir notas técnicas, dudas o actualización de progreso sobre esta tarea..."
                      rows={3}
                      value={newCommentInput}
                      onChange={(e) => setNewCommentInput(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center gap-2 text-secondary">
                      <button
                        onClick={() => setNewCommentInput((prev) => prev + ' @Juan Pérez ')}
                        className="p-1 rounded hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                        title="Mencionar usuario"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]" data-icon="alternate_email">
                          alternate_email
                        </span>
                      </button>
                      <button
                        onClick={() => setNewCommentInput((prev) => prev + ' ```typescript\n// código\n``` ')}
                        className="p-1 rounded hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                        title="Adjuntar fragmento de código"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]" data-icon="code">
                          code
                        </span>
                      </button>
                      <button
                        onClick={() => showToastNotification('Log de eventos adjuntado al buffer')}
                        className="p-1 rounded hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
                        title="Adjuntar log"
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]" data-icon="attachment">
                          attachment
                        </span>
                      </button>
                    </div>
                    <button
                      className="flex items-center gap-space-xs bg-primary-container text-on-primary px-space-md py-2 rounded-lg font-label-md text-label-md font-semibold shadow-xs hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer"
                      type="submit"
                    >
                      <span className="material-symbols-outlined text-[18px]" data-icon="send">
                        send
                      </span>
                      <span>Enviar Comentario</span>
                    </button>
                  </div>
                </form>
              </section>
            </div>

            {/* ===================================================================
                RIGHT 4 COLUMNS: Metadata, Redis Real-Time Tracker, Reassignment
                =================================================================== */}
            <div className="col-span-12 lg:col-span-4 flex flex-col gap-space-lg">
              {/* Real-time Assignment Timer (Redis TTL Backed) */}
              <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-space-md shadow-xs relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-24 h-24 bg-primary/5 rounded-full blur-2xl pointer-events-none"></div>
                <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/30 mb-space-sm">
                  <span className="font-label-md text-label-md font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-primary text-[18px]" data-icon="timer">
                      timer
                    </span>
                    <span>Cálculo de Tiempos (Redis)</span>
                  </span>
                  <span className="inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded bg-tertiary-container text-on-tertiary-container font-bold">
                    TTL ACTIVO
                  </span>
                </div>

                {/* Main Realtime Clock Display */}
                <div className="bg-surface-container-low rounded-lg p-space-md border border-outline-variant/30 mb-space-sm text-center">
                  <p className="font-label-sm text-label-sm text-secondary mb-1">
                    Tiempo transcurrido desde asignación:
                  </p>
                  <div
                    className="font-headline-md text-headline-md font-bold text-primary tracking-tight font-mono"
                    id="realtime-clock"
                  >
                    {formattedElapsedTime()}
                  </div>
                  <p className="font-label-sm text-label-sm text-secondary mt-1 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Respaldado por Redis TTL en microsegundos</span>
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2 rounded bg-surface border border-outline-variant/20">
                    <span className="text-secondary block">KEY:</span>
                    <span className="text-on-surface font-semibold truncate block">task:{currentTaskId}:assign</span>
                  </div>
                  <div className="p-2 rounded bg-surface border border-outline-variant/20">
                    <span className="text-secondary block">MEMORY OVERHEAD:</span>
                    <span className="text-on-surface font-semibold block">48 bytes</span>
                  </div>
                </div>
              </section>

              {/* Metadata Details: Creado Por, Asignado A, Reasignación */}
              <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-space-md shadow-xs">
                <h3 className="font-label-md text-label-md font-semibold text-on-surface pb-space-sm border-b border-outline-variant/30 mb-space-md">
                  Metadatos de Asignación
                </h3>
                <div className="flex flex-col gap-space-md">
                  {/* Creado Por */}
                  <div className="flex flex-col gap-1">
                    <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                      Creado por
                    </span>
                    <div className="flex items-center gap-3 p-2 rounded-lg bg-surface-container-low/50 border border-outline-variant/20">
                      <img
                        alt={`Avatar ${creatorUser.name}`}
                        className="w-9 h-9 rounded-full object-cover border border-outline-variant/50"
                        src={creatorUser.avatar}
                      />
                      <div className="flex flex-col">
                        <span className="font-label-md text-label-md font-semibold text-on-surface">
                          {creatorUser.name}
                        </span>
                        <span className="font-body-sm text-body-sm text-secondary">{creatorUser.role}</span>
                        <span className="font-label-sm text-label-sm text-secondary/80 mt-0.5">
                          24 Oct, 2024 - 09:30 AM
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Asignado A & Reasignar Selector */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-secondary uppercase tracking-wider">
                        Asignado a
                      </span>
                      <span className="font-label-sm text-label-sm text-primary font-medium">Reasignar usuario</span>
                    </div>

                    <div className="p-2.5 rounded-lg bg-surface-container-low border border-outline-variant/40 flex flex-col gap-2">
                      <div className="flex items-center gap-3">
                        <img
                          alt={`Avatar ${assignedUser.name}`}
                          className="w-9 h-9 rounded-full object-cover border border-primary-container"
                          src={assignedUser.avatar}
                        />
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md font-semibold text-on-surface">
                            {assignedUser.name}
                          </span>
                          <span className="font-body-sm text-body-sm text-secondary">{assignedUser.role}</span>
                        </div>
                      </div>

                      {/* Dropdown selector para reasignar a otro usuario registrado */}
                      <div className="pt-2 border-t border-outline-variant/30">
                        <label className="font-label-sm text-label-sm text-secondary block mb-1">
                          Cambiar asignación:
                        </label>
                        <div className="relative">
                          <select
                            className="w-full appearance-none bg-white text-on-surface text-xs font-medium py-1.5 pl-2.5 pr-8 rounded border border-outline-variant/60 focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                            value={selectedAssigneeKey}
                            onChange={(e) => handleReassign(e.target.value)}
                          >
                            <option value="sofia">Sofía Romero (Fullstack Dev)</option>
                            <option value="carlos">Carlos Mendoza (DevOps Lead)</option>
                            <option value="mariana">Mariana Silva (Frontend Architect)</option>
                            <option value="diego">Diego Torres (QA Automation)</option>
                            <option value="juan">Juan Pérez (Lead Backend)</option>
                          </select>
                          <span
                            className="material-symbols-outlined pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-secondary"
                            data-icon="swap_horiz"
                          >
                            swap_horiz
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sprint and Tag Info */}
                  <div className="pt-space-sm border-t border-outline-variant/30 flex flex-col gap-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary font-medium">Sprint Activo:</span>
                      <span className="font-semibold text-on-surface">Sprint 42 (Q4-Backend)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary font-medium">Fecha Límite:</span>
                      <span className="font-semibold text-error">30 Oct, 2024 (en 3 días)</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-secondary font-medium">Estimación:</span>
                      <span className="font-mono bg-surface-container px-1.5 py-0.5 rounded font-semibold text-primary">
                        5 Story Points
                      </span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Activity Logs Mini Feed */}
              <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-space-md shadow-xs">
                <span className="font-label-md text-label-md font-semibold text-on-surface block mb-space-sm">
                  Registro Reciente de la Tarea
                </span>
                <ul className="flex flex-col gap-2.5 text-xs text-secondary font-body-sm">
                  {activityLogs.map((log) => (
                    <li key={log.id} className="flex items-start gap-2">
                      <span className={`material-symbols-outlined text-[16px] ${log.iconColor} mt-0.5`}>
                        {log.icon}
                      </span>
                      <div>
                        <span className="font-medium text-on-surface">{log.title}</span>
                        <span className="block text-[10px] text-secondary">{log.timeAgo}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </main>
      </div>

      {/* =========================================================================
          4. MODAL DE CREAR NUEVA TAREA (Verbatim from management/code.html)
          ========================================================================= */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
          id="modal-create-task"
        >
          <div className="relative w-full max-w-xl bg-surface-container-lowest border border-outline-variant/60 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-space-lg py-space-md border-b border-outline-variant/40 bg-surface">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]" data-icon="add_task">
                    add_task
                  </span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">
                    Crear y Asignar Nueva Tarea
                  </h3>
                  <p className="font-label-sm text-label-sm text-secondary">
                    Registra la tarea en la base de datos e inicializa el TTL en Redis
                  </p>
                </div>
              </div>
              <button
                className="p-1 rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]" data-icon="close">
                  close
                </span>
              </button>
            </div>

            {/* Modal Form */}
            <form
              className="p-space-lg flex flex-col gap-space-md max-h-[85vh] overflow-y-auto custom-scrollbar"
              onSubmit={handleModalCreateTask}
            >
              {/* Título Field */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="new-task-title">
                  Título de la Tarea *
                </label>
                <input
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface placeholder:text-secondary focus:bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
                  id="new-task-title"
                  placeholder="Ej. Optimizar índices de consultas en PostgreSQL para analítica..."
                  required
                  type="text"
                  value={modalTitle}
                  onChange={(e) => setModalTitle(e.target.value)}
                />
              </div>

              {/* Descripción Field */}
              <div className="flex flex-col gap-1">
                <label className="font-label-md text-label-md font-semibold text-on-surface" htmlFor="new-task-desc">
                  Descripción detallada *
                </label>
                <textarea
                  className="w-full bg-surface-container-low border border-outline-variant/60 rounded-lg p-3 font-body-md text-body-md text-on-surface placeholder:text-secondary focus:bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all resize-y custom-scrollbar"
                  id="new-task-desc"
                  placeholder="Describe el alcance técnico, criterios de aceptación o dependencias..."
                  required
                  rows={3}
                  value={modalDesc}
                  onChange={(e) => setModalDesc(e.target.value)}
                ></textarea>
              </div>

              {/* Two Column: Asignado A & Prioridad */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
                {/* Selector de Usuario Asignado */}
                <div className="flex flex-col gap-1">
                  <label
                    className="font-label-md text-label-md font-semibold text-on-surface"
                    htmlFor="new-task-assignee"
                  >
                    Usuario Asignado *
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container cursor-pointer transition-all"
                      id="new-task-assignee"
                      required
                      value={modalAssignee}
                      onChange={(e) => setModalAssignee(e.target.value)}
                    >
                      <option value="sofia">Sofía Romero (Fullstack Dev)</option>
                      <option value="carlos">Carlos Mendoza (DevOps Lead)</option>
                      <option value="mariana">Mariana Silva (Frontend Architect)</option>
                      <option value="diego">Diego Torres (QA Automation)</option>
                      <option value="juan">Juan Pérez (Lead Backend)</option>
                    </select>
                    <span
                      className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-secondary"
                      data-icon="person_search"
                    >
                      person_search
                    </span>
                  </div>
                  <span className="font-label-sm text-label-sm text-secondary">Usuarios activos en la DB</span>
                </div>

                {/* Selector de Prioridad */}
                <div className="flex flex-col gap-1">
                  <label
                    className="font-label-md text-label-md font-semibold text-on-surface"
                    htmlFor="new-task-priority"
                  >
                    Nivel de Prioridad *
                  </label>
                  <div className="relative">
                    <select
                      className="w-full appearance-none bg-surface-container-low border border-outline-variant/60 rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface focus:bg-white focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container cursor-pointer transition-all"
                      id="new-task-priority"
                      value={modalPriority}
                      onChange={(e) => setModalPriority(e.target.value)}
                    >
                      <option value="Alta">Alta (Crítica)</option>
                      <option value="Media">Media (Normal)</option>
                      <option value="Baja">Baja</option>
                    </select>
                    <span
                      className="material-symbols-outlined pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-[18px] text-secondary"
                      data-icon="flag"
                    >
                      flag
                    </span>
                  </div>
                </div>
              </div>

              {/* Estado Inicial: Fijo en 'Pendiente' según especificación */}
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[20px]" data-icon="info">
                    info
                  </span>
                  <div>
                    <span className="font-label-md text-label-md font-semibold text-on-surface block">
                      Estado Inicial
                    </span>
                    <span className="font-label-sm text-label-sm text-secondary">
                      Toda nueva tarea ingresa como &apos;Pendiente&apos; en el tablero
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded bg-white text-secondary font-label-sm text-label-sm font-semibold border border-outline-variant/40">
                  Pendiente
                </span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-space-sm pt-space-sm border-t border-outline-variant/30 mt-2">
                <button
                  className="px-space-md py-2 rounded-lg font-label-md text-label-md font-medium text-secondary hover:text-on-surface hover:bg-surface-container transition-all cursor-pointer"
                  onClick={() => setIsCreateModalOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  disabled={isSavingTask}
                  className="flex items-center gap-space-xs bg-primary-container text-on-primary px-space-lg py-2 rounded-lg font-label-md text-label-md font-semibold shadow-xs hover:opacity-95 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50"
                  type="submit"
                >
                  <span className="material-symbols-outlined text-[18px]" data-icon="save">
                    save
                  </span>
                  <span>{isSavingTask ? 'Guardando...' : 'Guardar y Asignar Tarea'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. Notification Toast Container (Verbatim from management/code.html)
          ========================================================================= */}
      <div
        className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-lg shadow-xl border border-outline-variant/30 text-body-sm font-body-sm transition-all duration-300 ${
          showToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'
        }`}
        id="toast"
      >
        <span
          className="material-symbols-outlined text-emerald-400 text-[20px]"
          data-icon="check_circle"
        >
          check_circle
        </span>
        <span id="toast-message">{toastMessage}</span>
      </div>
    </div>
  );
}
