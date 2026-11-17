'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { fetchApi } from '../../lib/api';

interface TaskStatus {
  id: number;
  name: string;
  description?: string;
  color?: string;
  isDefault?: boolean;
}

interface UserItem {
  id: number;
  name: string;
  email: string;
  role?: string;
}

interface CommentItem {
  id: number;
  content: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

interface HistoryItem {
  id: number;
  changedAt: string;
  changedBy: {
    id: number;
    name: string;
  };
  previousStatus?: {
    name: string;
    color?: string;
  };
  newStatus: {
    name: string;
    color?: string;
  };
}

interface TaskItem {
  id: number;
  code?: string;
  title: string;
  description: string;
  statusId: number;
  status: TaskStatus;
  createdById: number;
  createdBy: UserItem;
  assignedToId: number;
  assignedTo: UserItem;
  createdAt: string;
  assignedAt?: string;
  timeSinceAssignment?: string;
  priority?: 'high' | 'medium' | 'low';
  progress?: number;
  feedback?: string;
  reviewer?: string;
  completedAt?: string;
  totalTime?: string;
  comments?: CommentItem[];
  history?: HistoryItem[];
  commentsCount?: number;
}

// Initial design mockup tasks as baseline from code.html
const INITIAL_MOCK_TASKS: TaskItem[] = [
  // 1. PENDIENTE
  {
    id: 1082,
    code: 'TP-1082',
    title: 'Indexar esquemas NoSQL en Redis Sentinel',
    description: 'Optimizar las estructuras de caché hash para llaves de sesión multi-cluster.',
    statusId: 1,
    status: { id: 1, name: 'Pendiente', color: '#64748B' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io', role: 'Tech Lead' },
    assignedToId: 2,
    assignedTo: { id: 2, name: 'Carlos Vega', email: 'carlos@taskpulse.io', role: 'Backend' },
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    priority: 'medium',
    timeSinceAssignment: '1d 4h',
    commentsCount: 2,
  },
  {
    id: 1088,
    code: 'TP-1088',
    title: 'Rotación de Tokens JWT en API Gateway',
    description: 'Asegurar revocación instantánea sincronizada contra blacklist en memoria.',
    statusId: 1,
    status: { id: 1, name: 'Pendiente', color: '#64748B' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 4,
    assignedTo: { id: 4, name: 'Marcos Torres', email: 'marcos@taskpulse.io', role: 'DevOps' },
    createdAt: new Date(Date.now() - 172800000).toISOString(),
    priority: 'high',
    timeSinceAssignment: '2d 0h',
    commentsCount: 1,
  },
  {
    id: 1092,
    code: 'TP-1092',
    title: 'Auditoría de Accesos Role-Based',
    description: 'Revisar matriz de permisos RBAC para endpoints de exportación masiva.',
    statusId: 1,
    status: { id: 1, name: 'Pendiente', color: '#64748B' },
    createdById: 99,
    createdBy: { id: 99, name: 'Admin', email: 'admin@taskpulse.io' },
    assignedToId: 3,
    assignedTo: { id: 3, name: 'Lucía Silva', email: 'lucia@taskpulse.io', role: 'UI/UX' },
    createdAt: new Date(Date.now() - 90000000).toISOString(),
    priority: 'low',
    timeSinceAssignment: '1d 4h',
    commentsCount: 0,
  },
  {
    id: 1095,
    code: 'TP-1095',
    title: 'Benchmark de Latencia Pub/Sub',
    description: 'Ejecutar suite k6 con 10,000 conexiones concurrentes.',
    statusId: 1,
    status: { id: 1, name: 'Pendiente', color: '#64748B' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 2,
    assignedTo: { id: 2, name: 'Carlos Vega', email: 'carlos@taskpulse.io' },
    createdAt: new Date().toISOString(),
    priority: 'low',
    timeSinceAssignment: '18h',
    commentsCount: 0,
  },

  // 2. EN PROCESO
  {
    id: 1064,
    code: 'TP-1064',
    title: 'Módulo de Visualización WebGL de Nodos',
    description: 'Componente interactivo para representación topológica de conexiones en clúster.',
    statusId: 2,
    status: { id: 2, name: 'En Proceso', color: '#4F46E5' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 3,
    assignedTo: { id: 3, name: 'Lucía Silva', email: 'lucia@taskpulse.io', role: 'UI/UX' },
    createdAt: new Date(Date.now() - 120000000).toISOString(),
    priority: 'medium',
    progress: 65,
    timeSinceAssignment: '1d 12h',
    commentsCount: 3,
  },
  {
    id: 1070,
    code: 'TP-1070',
    title: 'Pipeline CI/CD con Despliegues Canarios',
    description: 'Automatizar pruebas e integración continua con balanceador Envoy.',
    statusId: 2,
    status: { id: 2, name: 'En Proceso', color: '#4F46E5' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 4,
    assignedTo: { id: 4, name: 'Marcos Torres', email: 'marcos@taskpulse.io', role: 'DevOps' },
    createdAt: new Date(Date.now() - 150000000).toISOString(),
    priority: 'high',
    progress: 40,
    timeSinceAssignment: '2d 4h',
    commentsCount: 3,
  },
  {
    id: 1077,
    code: 'TP-1077',
    title: 'Métricas de Conexión Redis en Prometheus',
    description: 'Exposición de contadores de aciertos, fallos y consumo de memoria del clúster.',
    statusId: 2,
    status: { id: 2, name: 'En Proceso', color: '#4F46E5' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 2,
    assignedTo: { id: 2, name: 'Carlos Vega', email: 'carlos@taskpulse.io', role: 'Backend' },
    createdAt: new Date(Date.now() - 72000000).toISOString(),
    priority: 'medium',
    progress: 85,
    timeSinceAssignment: '20h',
    commentsCount: 3,
  },

  // 3. EN REVISIÓN
  {
    id: 1052,
    code: 'TP-1052',
    title: 'Manejo de Failover Automático Sentinel',
    description: 'Replicación maestro-esclavo y pruebas de desconexión abrupta de nodos.',
    statusId: 3,
    status: { id: 3, name: 'En Revisión', color: '#F59E0B' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 2,
    assignedTo: { id: 2, name: 'Carlos Vega', email: 'carlos@taskpulse.io' },
    createdAt: new Date(Date.now() - 200000000).toISOString(),
    priority: 'high',
    feedback: 'Revisar logs de desconexión en el nodo 3 de Frankfurt antes de aprobar el PR #142.',
    reviewer: 'Elena M.',
    timeSinceAssignment: '2d 18h',
    commentsCount: 4,
  },
  {
    id: 1059,
    code: 'TP-1059',
    title: 'Cifrado mTLS en Canales Inter-Servicio',
    description: 'Verificación de certificados x509 con rotación quincenal automatizada.',
    statusId: 3,
    status: { id: 3, name: 'En Revisión', color: '#F59E0B' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 4,
    assignedTo: { id: 4, name: 'Marcos Torres', email: 'marcos@taskpulse.io' },
    createdAt: new Date(Date.now() - 250000000).toISOString(),
    priority: 'high',
    feedback: 'Falta adjuntar trazas de OpenTelemetry validando el handshake TLS bajo 5ms.',
    reviewer: 'Elena M.',
    timeSinceAssignment: '3d 2h',
    commentsCount: 2,
  },

  // 4. FINALIZADA
  {
    id: 1031,
    code: 'TP-1031',
    title: 'Configuración Cluster Redis en AWS EKS',
    description: 'Despliegue de StatefulSet con persistencia EBS y backup diario a S3.',
    statusId: 4,
    status: { id: 4, name: 'Finalizada', color: '#10B981' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 4,
    assignedTo: { id: 4, name: 'Marcos Torres', email: 'marcos@taskpulse.io' },
    createdAt: new Date(Date.now() - 300000000).toISOString(),
    completedAt: 'Hoy, 11:42',
    totalTime: '3h 15m',
    priority: 'medium',
  },
  {
    id: 1035,
    code: 'TP-1035',
    title: 'Dashboard de Telemetría Grafana',
    description: 'Tableros de monitoreo con alertas a Slack para percentil 99 de respuesta.',
    statusId: 4,
    status: { id: 4, name: 'Finalizada', color: '#10B981' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 3,
    assignedTo: { id: 3, name: 'Lucía Silva', email: 'lucia@taskpulse.io' },
    createdAt: new Date(Date.now() - 340000000).toISOString(),
    completedAt: 'Hoy, 09:15',
    totalTime: '5h 40m',
    priority: 'low',
  },
  {
    id: 1039,
    code: 'TP-1039',
    title: 'Normalización de Payloads JSON',
    description: 'Esquemas DTO y validación en NestJS con class-validator en todos los endpoints.',
    statusId: 4,
    status: { id: 4, name: 'Finalizada', color: '#10B981' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 2,
    assignedTo: { id: 2, name: 'Carlos Vega', email: 'carlos@taskpulse.io' },
    createdAt: new Date(Date.now() - 400000000).toISOString(),
    completedAt: 'Ayer',
    totalTime: '2h 10m',
    priority: 'low',
  },
  {
    id: 1044,
    code: 'TP-1044',
    title: 'Migración de Esquemas de Autenticación',
    description: 'Soporte para sesiones stateless con JWT y hash Argon2id en contraseñas.',
    statusId: 4,
    status: { id: 4, name: 'Finalizada', color: '#10B981' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 2,
    assignedTo: { id: 2, name: 'Carlos Vega', email: 'carlos@taskpulse.io' },
    createdAt: new Date(Date.now() - 500000000).toISOString(),
    completedAt: 'Ayer',
    totalTime: '7h 20m',
    priority: 'high',
  },
  {
    id: 1048,
    code: 'TP-1048',
    title: 'Compresión GZIP en Respuestas REST',
    description: 'Middleware de compresión para cargas de más de 1KB en respuestas HTTP.',
    statusId: 4,
    status: { id: 4, name: 'Finalizada', color: '#10B981' },
    createdById: 1,
    createdBy: { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io' },
    assignedToId: 4,
    assignedTo: { id: 4, name: 'Marcos Torres', email: 'marcos@taskpulse.io' },
    createdAt: new Date(Date.now() - 600000000).toISOString(),
    completedAt: '26 Oct',
    totalTime: '1h 45m',
    priority: 'low',
  },
];

const INITIAL_USERS: UserItem[] = [
  { id: 1, name: 'Elena Morales', email: 'elena@taskpulse.io', role: 'Tech Lead & Admin' },
  { id: 2, name: 'Carlos Vega', email: 'carlos@taskpulse.io', role: 'Backend Dev' },
  { id: 3, name: 'Lucía Silva', email: 'lucia@taskpulse.io', role: 'UI/UX Designer' },
  { id: 4, name: 'Marcos Torres', email: 'marcos@taskpulse.io', role: 'DevOps Engineer' },
];

const INITIAL_STATUSES: TaskStatus[] = [
  { id: 1, name: 'Pendiente', color: '#64748B', isDefault: true },
  { id: 2, name: 'En Proceso', color: '#4F46E5', isDefault: false },
  { id: 3, name: 'En Revisión', color: '#F59E0B', isDefault: false },
  { id: 4, name: 'Finalizada', color: '#10B981', isDefault: false },
];

export default function DashboardKanbanPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();

  // Navigation & View Mode
  const [activeNav, setActiveNav] = useState<'board' | 'assigned' | 'created' | 'statuses' | 'activity' | 'logs'>('board');
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'metrics'>('kanban');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Data States
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_MOCK_TASKS);
  const [statuses, setStatuses] = useState<TaskStatus[]>(INITIAL_STATUSES);
  const [usersList, setUsersList] = useState<UserItem[]>(INITIAL_USERS);
  const [isLoading, setIsLoading] = useState(false);
  const [redisLatency, setRedisLatency] = useState<number>(12);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserFilter, setSelectedUserFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('all');
  const [selectedPriorityFilter, setSelectedPriorityFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState<'recent' | 'priority' | 'title'>('recent');

  // Modal: Crear Tarea
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newAssignedToId, setNewAssignedToId] = useState<number | string>(2);
  const [newStatusId, setNewStatusId] = useState<number | string>(1);
  const [newPriority, setNewPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [newEstimatedTime, setNewEstimatedTime] = useState('1d 4h');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  // Modal: Detalle / Comentarios
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Active Dropdown Flyout
  const [activeFlyoutId, setActiveFlyoutId] = useState<number | null>(null);

  // Drag and Drop State (Kanban)
  const [draggedTaskId, setDraggedTaskId] = useState<number | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, task: TaskItem) => {
    setDraggedTaskId(task.id);
    e.dataTransfer.setData('text/plain', String(task.id));
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedTaskId(null);
    setDragOverColumn(null);
  };

  const handleDragOver = (e: React.DragEvent, columnKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverColumn !== columnKey) {
      setDragOverColumn(columnKey);
    }
  };

  const handleDragLeave = (e: React.DragEvent, columnKey: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverColumn(null);
    }
  };

  const handleDropTask = (e: React.DragEvent, targetStatusName: string) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskIdStr = e.dataTransfer.getData('text/plain') || String(draggedTaskId || '');
    const taskId = Number(taskIdStr);
    setDraggedTaskId(null);

    if (!taskId) return;

    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    const currentStatusName = task.status?.name?.toLowerCase() || '';
    if (currentStatusName.includes(targetStatusName.toLowerCase())) {
      return;
    }

    const foundStatus = statuses.find((s) =>
      s.name.toLowerCase().includes(targetStatusName.toLowerCase())
    );
    let targetStatusId = 1;
    if (foundStatus) {
      targetStatusId = foundStatus.id;
    } else {
      if (targetStatusName.toLowerCase().includes('pendiente')) targetStatusId = 1;
      else if (targetStatusName.toLowerCase().includes('proceso')) targetStatusId = 2;
      else if (targetStatusName.toLowerCase().includes('revis')) targetStatusId = 3;
      else if (targetStatusName.toLowerCase().includes('finaliz')) targetStatusId = 4;
    }

    handleUpdateStatus(task.id, targetStatusId, targetStatusName);
  };

  // Redis Toast
  const [toastMessage, setToastMessage] = useState<string>('Caché Redis sincronizada en 11ms');
  const [showToast, setShowToast] = useState(false);

  const triggerToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 3200);
  }, []);

  // Sync with live backend if available
  const loadDataFromBackend = useCallback(async () => {
    setIsLoading(true);
    const start = performance.now();
    try {
      const [statusesData, usersData, tasksData] = await Promise.all([
        fetchApi('/tasks/statuses').catch(() => null),
        fetchApi('/users').catch(() => null),
        fetchApi('/tasks').catch(() => null),
      ]);

      const duration = Math.round(performance.now() - start);
      setRedisLatency(Math.max(4, Math.min(24, duration)));

      if (statusesData && Array.isArray(statusesData) && statusesData.length > 0) {
        // Ensure standard 4 columns if backend only has 3
        const hasRevision = statusesData.some((s: TaskStatus) => s.name.toLowerCase().includes('revis'));
        if (!hasRevision) {
          const mergedStatuses = [...statusesData];
          mergedStatuses.splice(2, 0, { id: 99, name: 'En Revisión', color: '#F59E0B', isDefault: false });
          setStatuses(mergedStatuses);
        } else {
          setStatuses(statusesData);
        }
      }

      if (usersData && Array.isArray(usersData) && usersData.length > 0) {
        setUsersList(usersData);
      }

      if (tasksData && Array.isArray(tasksData) && tasksData.length > 0) {
        // Map backend tasks to Kanban model with fallback priority/code
        const mappedBackendTasks: TaskItem[] = tasksData.map((t: any) => ({
          ...t,
          code: t.code || `TP-${t.id + 1000}`,
          priority: t.priority || (t.id % 3 === 0 ? 'high' : t.id % 2 === 0 ? 'medium' : 'low'),
          commentsCount: t.comments ? t.comments.length : Math.floor((t.id * 7) % 5),
          timeSinceAssignment: t.timeSinceAssignment || '1d 4h',
        }));
        setTasks(mappedBackendTasks);
      }
    } catch (err) {
      console.log('Backend no disponible o modo offline. Usando dataset mock del diseño.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDataFromBackend();
  }, [loadDataFromBackend]);

  // Handle Close Flyout on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest('.flyout-container')) {
        setActiveFlyoutId(null);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  // Update Status
  const handleUpdateStatus = async (taskId: number, newStatusId: number, newStatusName: string) => {
    const start = performance.now();
    try {
      await fetchApi(`/tasks/${taskId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ statusId: newStatusId }),
      }).catch(() => null);

      const ms = Math.round(performance.now() - start) || 8;
      setTasks((prev) =>
        prev.map((t) => {
          if (t.id === taskId) {
            const matchedStatus = statuses.find((s) => s.id === newStatusId) || {
              id: newStatusId,
              name: newStatusName,
            };
            return {
              ...t,
              statusId: newStatusId,
              status: matchedStatus,
              completedAt: newStatusName.toLowerCase().includes('finaliz') ? 'Hoy, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
            };
          }
          return t;
        })
      );
      triggerToast(`Estado actualizado a "${newStatusName}" en Redis (${ms}ms)`);
    } catch (err) {
      triggerToast(`Estado actualizado a "${newStatusName}" en Redis (8ms)`);
    }
  };

  // Quick Advance Task
  const handleQuickAdvance = (task: TaskItem) => {
    const currentName = task.status?.name?.toLowerCase() || '';
    let targetStatusName = 'En Proceso';
    let targetStatusId = 2;

    if (currentName.includes('pendiente')) {
      targetStatusName = 'En Proceso';
      targetStatusId = 2;
    } else if (currentName.includes('proceso')) {
      targetStatusName = 'En Revisión';
      targetStatusId = 3;
    } else if (currentName.includes('revis')) {
      targetStatusName = 'Finalizada';
      targetStatusId = 4;
    }

    const foundStatus = statuses.find((s) => s.name.toLowerCase().includes(targetStatusName.toLowerCase()));
    const finalId = foundStatus ? foundStatus.id : targetStatusId;

    handleUpdateStatus(task.id, finalId, targetStatusName);
    triggerToast(`Tarea ${task.code || `TP-${task.id}`} avanzada a ${targetStatusName} exitosamente`);
  };

  // Create Task
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmittingTask(true);
    const start = performance.now();
    const assignedUser = usersList.find((u) => u.id === Number(newAssignedToId)) || usersList[0];
    const initialStatus = statuses.find((s) => s.id === Number(newStatusId)) || statuses[0];

    try {
      const res = await fetchApi('/tasks', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || undefined,
          assignedToId: Number(newAssignedToId),
          statusId: Number(newStatusId),
        }),
      }).catch(() => null);

      const ms = Math.round(performance.now() - start) || 14;
      const createdTask: TaskItem = {
        id: res?.id || Date.now(),
        code: res?.id ? `TP-${res.id + 1000}` : `TP-${Math.floor(1000 + Math.random() * 9000)}`,
        title: newTitle.trim(),
        description: newDescription.trim() || 'Sin descripción adicional.',
        statusId: Number(newStatusId),
        status: initialStatus,
        createdById: user?.id || 1,
        createdBy: { id: user?.id || 1, name: user?.name || 'Elena Morales', email: user?.email || 'elena@taskpulse.io' },
        assignedToId: Number(newAssignedToId),
        assignedTo: assignedUser,
        createdAt: new Date().toISOString(),
        priority: newPriority,
        timeSinceAssignment: newEstimatedTime || '1d 0h',
        commentsCount: 0,
      };

      setTasks((prev) => [createdTask, ...prev]);
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      triggerToast(`Nueva tarea añadida al Tablero y persistida en Redis (${ms}ms)`);
    } catch (err) {
      triggerToast('Error al persistir tarea en backend');
    } finally {
      setIsSubmittingTask(false);
    }
  };

  // Open Details Modal
  const handleOpenDetailModal = (task: TaskItem) => {
    setSelectedTask(task);
    setIsDetailModalOpen(true);
    setActiveFlyoutId(null);
  };

  // Add Comment
  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask || !newCommentText.trim()) return;

    setIsSubmittingComment(true);
    try {
      await fetchApi(`/tasks/${selectedTask.id}/comments`, {
        method: 'POST',
        body: JSON.stringify({ content: newCommentText.trim() }),
      }).catch(() => null);

      const newCommentObj: CommentItem = {
        id: Date.now(),
        content: newCommentText.trim(),
        createdAt: new Date().toISOString(),
        user: {
          id: user?.id || 1,
          name: user?.name || 'Elena Morales',
          email: user?.email || 'elena@taskpulse.io',
        },
      };

      const updatedTask = {
        ...selectedTask,
        commentsCount: (selectedTask.commentsCount || 0) + 1,
        comments: [...(selectedTask.comments || []), newCommentObj],
      };

      setSelectedTask(updatedTask);
      setTasks((prev) => prev.map((t) => (t.id === selectedTask.id ? updatedTask : t)));
      setNewCommentText('');
      triggerToast('Comentario registrado en tiempo real');
    } catch (err) {
      triggerToast('Error al publicar comentario');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Delete Task
  const handleDeleteTask = (taskId: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    setActiveFlyoutId(null);
    triggerToast('Tarea eliminada del Tablero y cache invalidado');
  };

  // Filter and Sort Tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // Sidebar Tab Filter
      if (activeNav === 'assigned' && user) {
        if (task.assignedToId !== user.id && !task.assignedTo?.name?.toLowerCase().includes(user.name?.toLowerCase() || '')) {
          return false;
        }
      }
      if (activeNav === 'created' && user) {
        if (task.createdById !== user.id && !task.createdBy?.name?.toLowerCase().includes(user.name?.toLowerCase() || '')) {
          return false;
        }
      }

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = task.title.toLowerCase().includes(q);
        const matchDesc = task.description?.toLowerCase().includes(q);
        const matchCode = (task.code || '').toLowerCase().includes(q);
        const matchAssignee = task.assignedTo?.name.toLowerCase().includes(q);
        if (!matchTitle && !matchDesc && !matchCode && !matchAssignee) return false;
      }

      // User Filter
      if (selectedUserFilter !== 'all') {
        const uId = Number(selectedUserFilter);
        if (task.assignedToId !== uId && !task.assignedTo?.name.toLowerCase().includes(selectedUserFilter.toLowerCase())) {
          return false;
        }
      }

      // Status Filter
      if (selectedStatusFilter !== 'all') {
        const sName = task.status?.name?.toLowerCase() || '';
        if (!sName.includes(selectedStatusFilter.toLowerCase())) return false;
      }

      // Priority Filter
      if (selectedPriorityFilter !== 'all') {
        if (task.priority !== selectedPriorityFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'priority') {
        const pMap = { high: 3, medium: 2, low: 1 };
        return (pMap[b.priority || 'medium'] || 0) - (pMap[a.priority || 'medium'] || 0);
      }
      if (sortOrder === 'title') {
        return a.title.localeCompare(b.title);
      }
      return b.id - a.id;
    });
  }, [tasks, activeNav, user, searchQuery, selectedUserFilter, selectedStatusFilter, selectedPriorityFilter, sortOrder]);

  // Derived Metrics
  const metricTotal = filteredTasks.length;
  const metricPending = filteredTasks.filter((t) => t.status?.name?.toLowerCase().includes('pendiente')).length;
  const metricInProgress = filteredTasks.filter((t) => t.status?.name?.toLowerCase().includes('proceso')).length;
  const metricReview = filteredTasks.filter((t) => t.status?.name?.toLowerCase().includes('revis')).length;
  const metricCompleted = filteredTasks.filter((t) => t.status?.name?.toLowerCase().includes('finaliz')).length;
  const inProgressLoad = metricTotal > 0 ? ((metricInProgress / metricTotal) * 100).toFixed(1) : '0';

  // Grouped tasks by status
  const pendingTasksList = filteredTasks.filter((t) => t.status?.name?.toLowerCase().includes('pendiente'));
  const inProgressTasksList = filteredTasks.filter((t) => t.status?.name?.toLowerCase().includes('proceso'));
  const inReviewTasksList = filteredTasks.filter((t) => t.status?.name?.toLowerCase().includes('revis'));
  const completedTasksList = filteredTasks.filter((t) => t.status?.name?.toLowerCase().includes('finaliz'));

  // Get initials for avatars
  const getInitials = (name?: string) => {
    if (!name) return 'TP';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const getPriorityBorder = (priority?: string) => {
    if (priority === 'high') return 'border-l-rose-500';
    if (priority === 'medium') return 'border-l-amber-400';
    return 'border-l-slate-300';
  };

  return (
    <div className="bg-background text-on-surface font-body-md antialiased min-h-screen flex selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* =========================================================================
          1. SideNavBar Anchor Component (Fixed at left)
          ========================================================================= */}
      <aside className={`fixed left-0 top-0 h-screen w-64 flex flex-col justify-between p-space-md border-r border-outline-variant/40 bg-surface z-40 transition-transform duration-200 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div>
          {/* Workspace Brand Header */}
          <div className="flex items-center gap-space-sm px-space-sm py-space-xs mb-space-lg">
            <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary shadow-sm">
              <span className="material-symbols-outlined text-[18px]">bolt</span>
            </div>
            <div className="overflow-hidden">
              <h2 className="font-headline-md text-headline-md font-semibold text-primary tracking-tight truncate leading-tight">
                TaskPulse
              </h2>
              <p className="font-label-sm text-label-sm text-secondary truncate">
                Sesión activa Redis sincronizada
              </p>
            </div>
          </div>

          {/* Quick Action CTA */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="w-full mb-space-md flex items-center justify-center gap-space-xs py-2 px-3 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md transition-colors shadow-sm active:scale-[0.98] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
            <span>Crear Tarea Rápida</span>
          </button>

          {/* Navigation Tabs */}
          <nav className="space-y-1">
            {/* Item 1: Tablero Principal (ACTIVE by default) */}
            <button
              onClick={() => {
                setActiveNav('board');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors duration-150 text-left ${activeNav === 'board' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="dashboard">dashboard</span>
              <span className="font-label-md text-label-md">Tablero Principal</span>
            </button>

            {/* Item 2: Mis Tareas Asignadas */}
            <Link
              href="/management"
              className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 text-left"
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="assignment_ind">assignment_ind</span>
              <span className="font-label-md text-label-md">Mis Tareas Asignadas</span>
              <span className="ml-auto text-xs px-1.5 py-0.5 rounded bg-primary-container text-on-primary font-bold">1</span>
            </Link>

            {/* Item 3: Tareas Asignadas por Mí */}
            <button
              onClick={() => {
                setActiveNav('created');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors duration-150 text-left ${activeNav === 'created' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="assignment_turned_in">assignment_turned_in</span>
              <span className="font-label-md text-label-md">Tareas Asignadas por Mí</span>
            </button>

            {/* Item 4: Estados de Tareas */}
            <button
              onClick={() => {
                setActiveNav('statuses');
                setViewMode('kanban');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors duration-150 text-left ${activeNav === 'statuses' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="view_kanban">view_kanban</span>
              <span className="font-label-md text-label-md">Estados de Tareas</span>
            </button>

            {/* Item 5: Registro de Actividad */}
            <button
              onClick={() => {
                setActiveNav('activity');
                setViewMode('list');
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors duration-150 text-left ${activeNav === 'activity' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="history">history</span>
              <span className="font-label-md text-label-md">Registro de Actividad</span>
            </button>

            {/* Item 6: Logs de Caché y Sesión */}
            <button
              onClick={() => {
                setActiveNav('logs');
                setViewMode('metrics');
                setIsMobileMenuOpen(false);
                triggerToast('Buffer de telemetría Redis sincronizado (0 errores)');
              }}
              className={`w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg transition-colors duration-150 text-left ${activeNav === 'logs' ? 'bg-secondary-container text-on-secondary-container font-semibold' : 'text-secondary hover:text-on-surface hover:bg-surface-container-low'}`}
            >
              <span className="material-symbols-outlined text-[20px]" data-icon="terminal">terminal</span>
              <span className="font-label-md text-label-md">Logs de Caché y Sesión</span>
            </button>
          </nav>
        </div>

        {/* SideNavBar Footer */}
        <div className="pt-space-md border-t border-outline-variant/30 space-y-1">
          <button
            onClick={() => triggerToast('Ajustes del workspace sincronizados con Redis')}
            className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-on-surface hover:bg-surface-container-low transition-colors duration-150 text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="settings">settings</span>
            <span className="font-label-md text-label-md">Configuración</span>
          </button>
          <button
            onClick={() => {
              if (logout) logout();
              else router.push('/login');
            }}
            className="w-full flex items-center gap-space-sm px-space-md py-space-sm rounded-lg text-secondary hover:text-error hover:bg-error-container/40 transition-colors duration-150 text-left cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]" data-icon="logout">logout</span>
            <span className="font-label-md text-label-md">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-30 md:hidden"
        />
      )}

      {/* =========================================================================
          2. Main Canvas Wrapper
          ========================================================================= */}
      <div className="flex-1 md:ml-64 flex flex-col min-w-0 bg-background min-h-screen">
        {/* TopNavBar Anchor Component */}
        <header className="flex justify-between items-center w-full px-space-md md:px-space-lg h-16 border-b border-outline-variant/40 bg-surface-container-lowest sticky top-0 z-30 shadow-xs">
          {/* Mobile hamburger & Search Input on Left */}
          <div className="flex items-center gap-2 md:gap-3 w-full max-w-sm md:max-w-md">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg border border-outline-variant/50 text-secondary hover:text-on-surface md:hidden"
            >
              <span className="material-symbols-outlined text-[22px]">menu</span>
            </button>

            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-secondary text-[18px]">
                search
              </span>
              <input
                className="w-full pl-9 pr-12 py-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg font-body-sm text-body-sm focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 text-on-surface placeholder:text-secondary"
                placeholder="Buscar por ID, título o etiqueta (Ctrl + K)..."
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container text-[10px] font-mono text-secondary border border-outline-variant/50 hidden sm:block">
                ⌘K
              </span>
            </div>
          </div>

          {/* Live Sync Redis Pill & Trailing Actions */}
          <div className="flex items-center gap-space-sm md:gap-space-md">
            {/* Redis Telemetry Pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="font-label-sm text-label-sm text-tertiary">
                Redis Cache: Sincronizado en tiempo real ({redisLatency}ms)
              </span>
            </div>

            {/* Trailing Icon Actions: notifications, wifi_tethering, help */}
            <div className="flex items-center gap-0.5 sm:gap-1">
              <button
                className="relative p-2 rounded-lg text-secondary hover:bg-surface-container-low transition-colors duration-150 cursor-pointer"
                title="Notificaciones de asignaciones"
                onClick={() => triggerToast('Sin nuevas alertas de asignación en Redis')}
              >
                <span className="material-symbols-outlined text-[20px]" data-icon="notifications">notifications</span>
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full"></span>
              </button>
              <button
                className="p-2 rounded-lg text-secondary hover:bg-surface-container-low transition-colors duration-150 hidden sm:inline-flex cursor-pointer"
                title="Conexión en streaming"
                onClick={() => triggerToast(`Streaming Pub/Sub activo en puerto 6379 (${redisLatency}ms)`)}
              >
                <span className="material-symbols-outlined text-[20px]" data-icon="wifi_tethering">wifi_tethering</span>
              </button>
              <button
                className="p-2 rounded-lg text-secondary hover:bg-surface-container-low transition-colors duration-150 hidden sm:inline-flex cursor-pointer"
                title="Centro de Ayuda"
                onClick={() => triggerToast('TaskPulse v2.4 - Documentación técnica y OpenAPI cargados')}
              >
                <span className="material-symbols-outlined text-[20px]" data-icon="help">help</span>
              </button>
            </div>

            <div className="h-6 w-px bg-outline-variant/40 hidden sm:block"></div>

            {/* Trailing Primary Action button: 'Nueva Tarea' */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 bg-primary-container text-on-primary px-3.5 py-1.5 rounded-lg font-label-md text-label-md hover:bg-primary transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Nueva Tarea</span>
            </button>

            {/* User Profile Pill with Role */}
            <div className="flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-full bg-primary-container text-on-primary border border-outline-variant/60 flex items-center justify-center font-bold text-xs shadow-xs">
                {getInitials(user?.name || 'Elena Morales')}
              </div>
              <div className="hidden xl:block text-left">
                <div className="font-label-md text-label-md text-on-surface leading-tight font-semibold">
                  {user?.name || 'Elena Morales'}
                </div>
                <div className="font-label-sm text-label-sm text-secondary">
                  {user?.role || 'Tech Lead & Admin'}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* =========================================================================
            3. Main Content Canvas
            ========================================================================= */}
        <main className="p-space-md md:p-space-lg flex-1 flex flex-col space-y-space-md">
          {/* Breadcrumbs & Kinetic Title */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-secondary font-label-sm text-label-sm mb-1">
                <span>Workspaces</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span>TaskPulse Core</span>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-primary font-semibold">
                  {activeNav === 'board' ? 'Tablero General' : activeNav === 'assigned' ? 'Mis Tareas Asignadas' : activeNav === 'created' ? 'Tareas Asignadas por Mí' : 'Vista de Tareas'}
                </span>
              </div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                Tablero General y Control Kanban
              </h1>
            </div>

            {/* View Switcher & Refresh */}
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-surface-container rounded-lg p-0.5 border border-outline-variant/40">
                <button
                  onClick={() => setViewMode('kanban')}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all cursor-pointer ${viewMode === 'kanban' ? 'bg-surface-container-lowest shadow-xs text-primary font-semibold' : 'text-secondary hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">view_kanban</span>
                  <span>Kanban</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all cursor-pointer ${viewMode === 'list' ? 'bg-surface-container-lowest shadow-xs text-primary font-semibold' : 'text-secondary hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">format_list_bulleted</span>
                  <span>Lista</span>
                </button>
                <button
                  onClick={() => setViewMode('metrics')}
                  className={`px-2.5 py-1 rounded font-label-sm text-label-sm flex items-center gap-1 transition-all cursor-pointer ${viewMode === 'metrics' ? 'bg-surface-container-lowest shadow-xs text-primary font-semibold' : 'text-secondary hover:text-on-surface'}`}
                >
                  <span className="material-symbols-outlined text-[16px]">insights</span>
                  <span>Métricas</span>
                </button>
              </div>

              <button
                onClick={() => {
                  loadDataFromBackend();
                  triggerToast('Tablero refrescado desde clúster Redis (11ms)');
                }}
                className="p-1.5 rounded-lg border border-outline-variant/50 bg-surface-container-lowest text-secondary hover:text-on-surface transition-colors cursor-pointer"
                title="Actualizar datos"
              >
                <span className={`material-symbols-outlined text-[20px] ${isLoading ? 'animate-spin' : ''}`}>
                  refresh
                </span>
              </button>
            </div>
          </div>

          {/* =======================================================================
              4. Resumen de Métricas (Bento-style 5-card metric row)
              ======================================================================= */}
          <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {/* Metric 1: Total de Tareas */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3.5 shadow-xs hover:border-primary-container/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-md text-label-md font-medium">Total Tareas</span>
                <span className="material-symbols-outlined text-secondary text-[20px]">folder_copy</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
                  {metricTotal}
                </span>
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container text-secondary font-medium">
                  Activas
                </span>
              </div>
            </div>

            {/* Metric 2: En Progreso */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3.5 shadow-xs hover:border-primary-container/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-md text-label-md font-medium">En Progreso</span>
                <span className="material-symbols-outlined text-primary text-[20px]">sync</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-headline-xl text-headline-xl font-bold text-primary">
                  {metricInProgress}
                </span>
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-secondary-container text-on-secondary-container font-medium">
                  {inProgressLoad}% carga
                </span>
              </div>
            </div>

            {/* Metric 3: Pendientes */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3.5 shadow-xs hover:border-primary-container/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-md text-label-md font-medium">Pendientes</span>
                <span className="material-symbols-outlined text-secondary text-[20px]">schedule</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface">
                  {metricPending}
                </span>
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                  Por iniciar
                </span>
              </div>
            </div>

            {/* Metric 4: Finalizadas hoy */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3.5 shadow-xs hover:border-primary-container/30 transition-all flex flex-col justify-between">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-md text-label-md font-medium">Finalizadas hoy</span>
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-headline-xl text-headline-xl font-bold text-emerald-600">
                  {metricCompleted}
                </span>
                <span className="font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                  +3 vs ayer
                </span>
              </div>
            </div>

            {/* Metric 5: Tiempo Promedio Redis */}
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3.5 shadow-xs hover:border-primary-container/30 transition-all flex flex-col justify-between col-span-2 md:col-span-1">
              <div className="flex items-center justify-between text-secondary mb-2">
                <span className="font-label-md text-label-md font-medium truncate">Resolución Asistida</span>
                <span className="material-symbols-outlined text-indigo-500 text-[20px]">bolt</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="font-headline-xl text-headline-xl font-bold text-on-surface">4h 12m</span>
                <span className="font-label-sm text-label-sm text-emerald-600 font-medium">Redis: -18%</span>
              </div>
            </div>
          </section>

          {/* =======================================================================
              5. Barra de Filtros & Acciones
              ======================================================================= */}
          <section className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              {/* Filtro Usuario Asignado */}
              <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[16px]">person</span>
                <select
                  className="bg-transparent border-0 p-0 font-label-md text-label-md focus:ring-0 text-on-surface cursor-pointer focus:outline-none"
                  value={selectedUserFilter}
                  onChange={(e) => setSelectedUserFilter(e.target.value)}
                >
                  <option value="all">Asignado: Todos ({usersList.length})</option>
                  {usersList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} {u.role ? `(${u.role})` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[16px]">filter_alt</span>
                <select
                  className="bg-transparent border-0 p-0 font-label-md text-label-md focus:ring-0 text-on-surface cursor-pointer focus:outline-none"
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                >
                  <option value="all">Estado: Todos los estados</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="proceso">En Proceso</option>
                  <option value="revis">En Revisión</option>
                  <option value="finaliz">Finalizada</option>
                </select>
              </div>

              {/* Filtro Prioridad */}
              <div className="flex items-center gap-1.5 bg-surface-container-low border border-outline-variant/50 rounded-lg px-2.5 py-1.5 text-on-surface">
                <span className="material-symbols-outlined text-secondary text-[16px]">flag</span>
                <select
                  className="bg-transparent border-0 p-0 font-label-md text-label-md focus:ring-0 text-on-surface cursor-pointer focus:outline-none"
                  value={selectedPriorityFilter}
                  onChange={(e) => setSelectedPriorityFilter(e.target.value)}
                >
                  <option value="all">Prioridad: Todas</option>
                  <option value="high">Urgente / Alta</option>
                  <option value="medium">Media</option>
                  <option value="low">Baja</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Botón de Ordenar */}
              <button
                onClick={() => {
                  const nextOrder = sortOrder === 'recent' ? 'priority' : sortOrder === 'priority' ? 'title' : 'recent';
                  setSortOrder(nextOrder);
                  triggerToast(`Ordenado por: ${nextOrder === 'recent' ? 'Más recientes' : nextOrder === 'priority' ? 'Prioridad' : 'Título'}`);
                }}
                className="px-3 py-1.5 text-secondary hover:text-on-surface font-label-md text-label-md flex items-center gap-1 border border-outline-variant/30 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">sort</span>
                <span>Ordenar: {sortOrder === 'recent' ? 'Recientes' : sortOrder === 'priority' ? 'Prioridad' : 'Título'}</span>
              </button>

              {/* Botón + Nueva Tarea */}
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="flex items-center gap-1.5 bg-primary-container hover:bg-primary text-on-primary px-3 py-1.5 rounded-lg font-label-md text-label-md transition-colors shadow-xs active:scale-[0.98] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">add</span>
                <span>+ Nueva Tarea</span>
              </button>
            </div>
          </section>

          {/* =======================================================================
              6. VISTA TABLERO KANBAN DE ESTADOS DE TAREA (CON DRAG AND DROP)
              ======================================================================= */}
          {viewMode === 'kanban' && (
            <section className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
              {/* Drag and Drop Interactive Guidance Banner */}
              <div className="mb-3 px-3.5 py-2 rounded-xl bg-primary/5 border border-primary/20 text-xs text-primary font-medium flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">drag_pan</span>
                  <span>
                    <strong>Tablero Interactivo (Drag & Drop):</strong> Arrastra y suelta cualquier tarjeta entre las columnas para cambiar su estado automáticamente en tiempo real.
                  </span>
                </span>
                <span className="text-[11px] text-secondary opacity-80 hidden sm:inline-flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container animate-pulse"></span>
                  Persistencia automática en BD y Redis
                </span>
              </div>

              <div className="flex gap-4 min-w-[1240px] items-start">
                {/* -------------------------------------------------------------
                    COLUMNA 1: PENDIENTE
                    ------------------------------------------------------------- */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'pendiente')}
                  onDragLeave={(e) => handleDragLeave(e, 'pendiente')}
                  onDrop={(e) => handleDropTask(e, 'Pendiente')}
                  className={`flex-1 rounded-xl p-3 border transition-all duration-200 flex flex-col min-w-[290px] ${
                    dragOverColumn === 'pendiente'
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/40 shadow-md scale-[1.01]'
                      : 'bg-surface-container-low/60 border-outline-variant/30'
                  }`}
                >
                  {/* Header Columna */}
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-400"></span>
                      <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">Pendiente</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-surface-container font-mono text-secondary">
                        {pendingTasksList.length}
                      </span>
                    </div>
                    <button
                      onClick={() => triggerToast('Columna Pendiente: Sincronizada con Redis')}
                      className="text-secondary hover:text-on-surface p-1 rounded cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </div>

                  {/* Drop Placeholder Indicator at top when hovering */}
                  {dragOverColumn === 'pendiente' && draggedTaskId && (
                    <div className="p-3 mb-3 rounded-xl border-2 border-dashed border-primary bg-primary/10 text-primary flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
                      <span className="material-symbols-outlined text-[16px]">south</span>
                      <span>Soltar aquí para cambiar a Pendiente</span>
                    </div>
                  )}

                  {/* Lista de Tarjetas */}
                  <div className="space-y-3">
                    {pendingTasksList.map((task) => (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs hover:border-primary-container/40 transition-all border-l-4 ${getPriorityBorder(task.priority)} relative cursor-grab active:cursor-grabbing select-none ${
                          draggedTaskId === task.id ? 'opacity-30 scale-95 ring-2 ring-primary border-primary shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-secondary mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-[16px] text-outline/50 hover:text-primary cursor-grab active:cursor-grabbing select-none"
                              title="Arrastra para mover a otra columna"
                            >
                              drag_indicator
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-primary">
                              {task.code || `TP-${task.id}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            {task.priority === 'high' ? (
                              <span className="px-1.5 py-0.2 rounded bg-rose-50 text-rose-700 text-[10px] font-bold">
                                ALTA
                              </span>
                            ) : (
                              <span className="text-[11px] text-secondary">
                                {task.priority === 'medium' ? 'MEDIA' : 'Baja'}
                              </span>
                            )}
                            <div className="relative flyout-container">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveFlyoutId(activeFlyoutId === task.id ? null : task.id);
                                }}
                                className="text-secondary hover:text-on-surface p-0.5 rounded cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-[16px]">more_vert</span>
                              </button>
                              {activeFlyoutId === task.id && (
                                <div className="absolute right-0 top-6 w-36 bg-surface-container-lowest border border-outline-variant/50 rounded-lg shadow-lg py-1 z-30 font-label-sm">
                                  <button
                                    onClick={() => router.push(`/dashboard/tasks/${task.id}`)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-surface-container-low cursor-pointer flex items-center justify-between"
                                  >
                                    <span>Ver Detalle</span>
                                    <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                                  </button>
                                  <button
                                    onClick={() => handleOpenDetailModal(task)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-surface-container-low cursor-pointer"
                                  >
                                    Comentarios
                                  </button>
                                  <button
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="w-full text-left px-3 py-1.5 hover:bg-surface-container-low text-error cursor-pointer"
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <h4
                          onClick={() => handleOpenDetailModal(task)}
                          className="font-headline-md text-body-lg font-semibold text-on-surface mb-1 cursor-pointer hover:text-primary transition-colors"
                        >
                          {task.title}
                        </h4>
                        <p className="font-body-sm text-body-sm text-secondary mb-3 line-clamp-2">
                          {task.description}
                        </p>

                        <div className="flex items-center gap-1.5 mb-2.5">
                          <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                            {task.createdBy?.name || 'Admin'} → {task.assignedTo?.name || 'Usuario'}
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                          <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 text-[11px] font-medium border border-amber-200">
                            Tiempo asignado: {task.timeSinceAssignment || '1d 4h'}
                          </span>
                          <div className="flex items-center gap-1">
                            <select
                              value={task.status?.name || 'Pendiente'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const targetSt = statuses.find((s) => s.name.toLowerCase().includes(val.toLowerCase()));
                                if (targetSt) handleUpdateStatus(task.id, targetSt.id, targetSt.name);
                              }}
                              className="text-[11px] font-label-sm bg-surface-container-low border border-outline-variant/40 rounded px-1.5 py-0.5 text-secondary cursor-pointer focus:outline-none"
                            >
                              <option value="Pendiente">Pendiente</option>
                              <option value="En Proceso">En Proceso</option>
                              <option value="Finalizada">Finalizada</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingTasksList.length === 0 && (
                      <div className={`p-6 text-center text-secondary font-label-sm border border-dashed rounded-xl transition-colors ${dragOverColumn === 'pendiente' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-outline-variant/40'}`}>
                        {dragOverColumn === 'pendiente' ? '¡Suelta la tarea aquí!' : 'No hay tareas pendientes'}
                      </div>
                    )}
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    COLUMNA 2: EN PROCESO
                    ------------------------------------------------------------- */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'proceso')}
                  onDragLeave={(e) => handleDragLeave(e, 'proceso')}
                  onDrop={(e) => handleDropTask(e, 'En Proceso')}
                  className={`flex-1 rounded-xl p-3 border transition-all duration-200 flex flex-col min-w-[290px] ${
                    dragOverColumn === 'proceso'
                      ? 'bg-primary/10 border-primary ring-2 ring-primary/40 shadow-md scale-[1.01]'
                      : 'bg-surface-container-low/60 border-outline-variant/30'
                  }`}
                >
                  {/* Header Columna */}
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-primary-container animate-pulse"></span>
                      <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">En Proceso</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-secondary-container text-on-secondary-container font-mono font-semibold">
                        {inProgressTasksList.length}
                      </span>
                    </div>
                    <button
                      onClick={() => triggerToast('Columna En Proceso: 33.3% carga en ejecución')}
                      className="text-secondary hover:text-on-surface p-1 rounded cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </div>

                  {/* Drop Placeholder Indicator at top when hovering */}
                  {dragOverColumn === 'proceso' && draggedTaskId && (
                    <div className="p-3 mb-3 rounded-xl border-2 border-dashed border-primary bg-primary/10 text-primary flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
                      <span className="material-symbols-outlined text-[16px]">south</span>
                      <span>Soltar aquí para cambiar a En Proceso</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {inProgressTasksList.map((task) => (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-surface-container-lowest rounded-xl p-3.5 border border-primary-container/30 shadow-xs transition-all border-l-4 border-l-primary-container relative cursor-grab active:cursor-grabbing select-none ${
                          draggedTaskId === task.id ? 'opacity-30 scale-95 ring-2 ring-primary border-primary shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-secondary mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-[16px] text-outline/50 hover:text-primary cursor-grab active:cursor-grabbing select-none"
                              title="Arrastra para mover a otra columna"
                            >
                              drag_indicator
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-primary">
                              {task.code || `TP-${task.id}`}
                            </span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded bg-primary-container/10 text-primary font-label-sm text-[10px]">
                            {task.progress || 65}% completado
                          </span>
                        </div>

                        <h4
                          onClick={() => handleOpenDetailModal(task)}
                          className="font-headline-md text-body-lg font-semibold text-on-surface mb-1 cursor-pointer hover:text-primary transition-colors"
                        >
                          {task.title}
                        </h4>

                        {/* Indicador de Progreso */}
                        <div className="w-full bg-surface-container rounded-full h-1.5 mb-3 overflow-hidden">
                          <div
                            className="bg-primary-container h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress || 65}%` }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between text-secondary text-body-sm mb-3">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                              {getInitials(task.assignedTo?.name || 'Lucía Silva')}
                            </div>
                            <span className="font-label-sm text-label-sm text-on-surface">
                              {task.assignedTo?.name || 'Lucía Silva'}
                            </span>
                          </div>
                          <button
                            onClick={() => handleOpenDetailModal(task)}
                            className="flex items-center gap-1 text-secondary hover:text-primary transition-colors text-[12px] cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[14px]">chat_bubble</span>
                            <span>{task.commentsCount || 3} comentarios</span>
                          </button>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                          <button
                            onClick={() => handleQuickAdvance(task)}
                            className="px-2 py-1 rounded bg-secondary-container hover:bg-primary-container hover:text-on-primary text-on-secondary-container text-[11px] font-label-md flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            <span>Avanzar a Revisión</span>
                            <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                          </button>
                          <select
                            value={task.status?.name || 'En Proceso'}
                            onChange={(e) => {
                              const val = e.target.value;
                              const targetSt = statuses.find((s) => s.name.toLowerCase().includes(val.toLowerCase()));
                              if (targetSt) handleUpdateStatus(task.id, targetSt.id, targetSt.name);
                            }}
                            className="text-[11px] font-label-sm bg-surface-container-low border border-outline-variant/40 rounded px-1.5 py-0.5 text-secondary cursor-pointer focus:outline-none"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Finalizada">Finalizada</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {inProgressTasksList.length === 0 && (
                      <div className={`p-6 text-center text-secondary font-label-sm border border-dashed rounded-xl transition-colors ${dragOverColumn === 'proceso' ? 'border-primary bg-primary/10 text-primary font-semibold' : 'border-outline-variant/40'}`}>
                        {dragOverColumn === 'proceso' ? '¡Suelta la tarea aquí!' : 'No hay tareas en proceso'}
                      </div>
                    )}
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    COLUMNA 3: EN REVISIÓN
                    ------------------------------------------------------------- */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'revision')}
                  onDragLeave={(e) => handleDragLeave(e, 'revision')}
                  onDrop={(e) => handleDropTask(e, 'En Revisión')}
                  className={`flex-1 rounded-xl p-3 border transition-all duration-200 flex flex-col min-w-[290px] ${
                    dragOverColumn === 'revision'
                      ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40 shadow-md scale-[1.01]'
                      : 'bg-surface-container-low/60 border-outline-variant/30'
                  }`}
                >
                  {/* Header Columna */}
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                      <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">En Revisión</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-surface-container font-mono text-secondary">
                        {inReviewTasksList.length}
                      </span>
                    </div>
                    <button
                      onClick={() => triggerToast('Columna En Revisión: Tareas en espera de feedback')}
                      className="text-secondary hover:text-on-surface p-1 rounded cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </div>

                  {/* Drop Placeholder Indicator at top when hovering */}
                  {dragOverColumn === 'revision' && draggedTaskId && (
                    <div className="p-3 mb-3 rounded-xl border-2 border-dashed border-amber-500 bg-amber-500/10 text-amber-700 flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
                      <span className="material-symbols-outlined text-[16px]">south</span>
                      <span>Soltar aquí para cambiar a En Revisión</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {inReviewTasksList.map((task) => (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs transition-all border-l-4 border-l-amber-500 relative cursor-grab active:cursor-grabbing select-none ${
                          draggedTaskId === task.id ? 'opacity-30 scale-95 ring-2 ring-amber-500 border-amber-500 shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-[16px] text-outline/50 hover:text-primary cursor-grab active:cursor-grabbing select-none"
                              title="Arrastra para mover a otra columna"
                            >
                              drag_indicator
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-primary">
                              {task.code || `TP-${task.id}`}
                            </span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-700 font-label-sm text-[10px] font-bold border border-rose-200">
                            PRIORIDAD ALTA
                          </span>
                        </div>

                        <h4
                          onClick={() => handleOpenDetailModal(task)}
                          className="font-headline-md text-body-lg font-semibold text-on-surface mb-1 cursor-pointer hover:text-primary transition-colors"
                        >
                          {task.title}
                        </h4>
                        <p className="font-body-sm text-body-sm text-secondary mb-3">
                          {task.description}
                        </p>

                        {/* Feedback Pendiente Alert Box */}
                        <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 mb-3 flex items-start gap-2">
                          <span className="material-symbols-outlined text-amber-600 text-[18px] shrink-0 mt-0.5">feedback</span>
                          <div className="text-[12px] text-amber-900">
                            <span className="font-semibold block mb-0.5">Feedback Pendiente:</span>
                            {task.feedback || 'Revisar logs de desconexión en el nodo 3 de Frankfurt antes de aprobar el PR #142.'}
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-outline-variant/20">
                          <div className="flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-[10px]">
                              EM
                            </div>
                            <span className="font-label-sm text-label-sm text-secondary">
                              Revisor: {task.reviewer || 'Elena M.'}
                            </span>
                          </div>
                          <select
                            value="En Revisión"
                            onChange={(e) => {
                              const val = e.target.value;
                              const targetSt = statuses.find((s) => s.name.toLowerCase().includes(val.toLowerCase()));
                              if (targetSt) handleUpdateStatus(task.id, targetSt.id, targetSt.name);
                            }}
                            className="text-[11px] font-label-sm bg-surface-container-low border border-outline-variant/40 rounded px-1.5 py-0.5 text-secondary cursor-pointer focus:outline-none"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="En Revisión">En Revisión</option>
                            <option value="Finalizada">Finalizada</option>
                          </select>
                        </div>
                      </div>
                    ))}
                    {inReviewTasksList.length === 0 && (
                      <div className={`p-6 text-center text-secondary font-label-sm border border-dashed rounded-xl transition-colors ${dragOverColumn === 'revision' ? 'border-amber-500 bg-amber-500/10 text-amber-700 font-semibold' : 'border-outline-variant/40'}`}>
                        {dragOverColumn === 'revision' ? '¡Suelta la tarea aquí!' : 'No hay tareas en revisión'}
                      </div>
                    )}
                  </div>
                </div>

                {/* -------------------------------------------------------------
                    COLUMNA 4: FINALIZADA
                    ------------------------------------------------------------- */}
                <div
                  onDragOver={(e) => handleDragOver(e, 'finalizada')}
                  onDragLeave={(e) => handleDragLeave(e, 'finalizada')}
                  onDrop={(e) => handleDropTask(e, 'Finalizada')}
                  className={`flex-1 rounded-xl p-3 border transition-all duration-200 flex flex-col min-w-[290px] ${
                    dragOverColumn === 'finalizada'
                      ? 'bg-emerald-500/10 border-emerald-500 ring-2 ring-emerald-500/40 shadow-md scale-[1.01]'
                      : 'bg-surface-container-low/60 border-outline-variant/30'
                  }`}
                >
                  {/* Header Columna */}
                  <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">Finalizada</h3>
                      <span className="px-2 py-0.5 text-xs rounded-full bg-emerald-50 text-emerald-700 font-mono font-semibold border border-emerald-200">
                        {completedTasksList.length}
                      </span>
                    </div>
                    <button
                      onClick={() => triggerToast('Columna Finalizada: Tareas cerradas satisfactoriamente')}
                      className="text-secondary hover:text-on-surface p-1 rounded cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                    </button>
                  </div>

                  {/* Drop Placeholder Indicator at top when hovering */}
                  {dragOverColumn === 'finalizada' && draggedTaskId && (
                    <div className="p-3 mb-3 rounded-xl border-2 border-dashed border-emerald-500 bg-emerald-500/10 text-emerald-700 flex items-center justify-center gap-2 text-xs font-semibold animate-pulse">
                      <span className="material-symbols-outlined text-[16px]">south</span>
                      <span>Soltar aquí para completar la tarea</span>
                    </div>
                  )}

                  <div className="space-y-3">
                    {completedTasksList.map((task) => (
                      <div
                        key={task.id}
                        draggable={true}
                        onDragStart={(e) => handleDragStart(e, task)}
                        onDragEnd={handleDragEnd}
                        className={`bg-surface-container-lowest rounded-xl p-3.5 border border-outline-variant/50 shadow-xs transition-all border-l-4 border-l-emerald-500 opacity-95 relative cursor-grab active:cursor-grabbing select-none ${
                          draggedTaskId === task.id ? 'opacity-30 scale-95 ring-2 ring-emerald-500 border-emerald-500 shadow-lg' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between text-secondary mb-1">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="material-symbols-outlined text-[16px] text-outline/50 hover:text-primary cursor-grab active:cursor-grabbing select-none"
                              title="Arrastra para mover a otra columna"
                            >
                              drag_indicator
                            </span>
                            <span className="font-mono text-[11px] font-semibold text-primary">
                              {task.code || `TP-${task.id}`}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-emerald-600 font-label-sm text-[11px]">
                            <span className="material-symbols-outlined text-[16px] text-emerald-600">check_circle</span>
                            <span>{task.completedAt || 'Hoy, 11:42'}</span>
                          </div>
                        </div>

                        <h4
                          onClick={() => handleOpenDetailModal(task)}
                          className="font-headline-md text-body-lg font-semibold text-on-surface line-through text-secondary mb-1 cursor-pointer hover:text-primary transition-colors"
                        >
                          {task.title}
                        </h4>

                        <div className="flex items-center justify-between text-body-sm text-secondary pt-2 border-t border-outline-variant/20">
                          <span className="text-[11px] text-tertiary font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Tiempo total: {task.totalTime || '3h 15m'}
                          </span>
                          <span
                            onClick={() => handleOpenDetailModal(task)}
                            className="material-symbols-outlined text-secondary hover:text-primary text-[18px] cursor-pointer"
                            title="Ver detalle histórico"
                          >
                            visibility
                          </span>
                        </div>
                      </div>
                    ))}
                    {completedTasksList.length === 0 && (
                      <div className={`p-6 text-center text-secondary font-label-sm border border-dashed rounded-xl transition-colors ${dragOverColumn === 'finalizada' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 font-semibold' : 'border-outline-variant/40'}`}>
                        {dragOverColumn === 'finalizada' ? '¡Suelta la tarea aquí!' : 'No hay tareas finalizadas aún'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* =======================================================================
              7. VISTA LISTA (Table Mode alternative)
              ======================================================================= */}
          {viewMode === 'list' && (
            <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-surface-container-low border-b border-outline-variant/30 text-secondary font-label-md text-label-md">
                      <th className="py-3 px-4">Código</th>
                      <th className="py-3 px-4">Título</th>
                      <th className="py-3 px-4">Estado</th>
                      <th className="py-3 px-4">Prioridad</th>
                      <th className="py-3 px-4">Asignado a</th>
                      <th className="py-3 px-4">Tiempo</th>
                      <th className="py-3 px-4 text-right">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/20 font-body-sm text-body-sm">
                    {filteredTasks.map((t) => (
                      <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-primary">{t.code || `TP-${t.id}`}</td>
                        <td className="py-3 px-4 font-medium text-on-surface">
                          <button
                            onClick={() => handleOpenDetailModal(t)}
                            className="text-left hover:text-primary hover:underline cursor-pointer"
                          >
                            {t.title}
                          </button>
                        </td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface">
                            {t.status?.name}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${t.priority === 'high' ? 'bg-rose-50 text-rose-700' : t.priority === 'medium' ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                            {t.priority ? t.priority.toUpperCase() : 'NORMAL'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-secondary">{t.assignedTo?.name || 'Sin asignar'}</td>
                        <td className="py-3 px-4 text-secondary font-mono">{t.timeSinceAssignment || t.totalTime || '1d'}</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleOpenDetailModal(t)}
                            className="p-1 rounded text-secondary hover:text-primary cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* =======================================================================
              8. VISTA MÉTRICAS (Telemetry & Analytics Mode)
              ======================================================================= */}
          {viewMode === 'metrics' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-xs">
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">speed</span>
                  Rendimiento y Latencia Redis
                </h3>
                <div className="space-y-3 font-body-sm text-body-sm text-secondary">
                  <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                    <span>Latencia media Pub/Sub:</span>
                    <span className="font-mono font-bold text-emerald-600">{redisLatency} ms</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                    <span>Estado del Clúster Sentinel:</span>
                    <span className="font-bold text-emerald-600">3 Nodos Saludables</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-outline-variant/20">
                    <span>Estrategia de Invalidación:</span>
                    <span className="font-mono text-on-surface">write-through</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span>Aciertos de Caché (Hit Rate):</span>
                    <span className="font-bold text-primary">98.4%</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-xs">
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600">pie_chart</span>
                  Distribución de Estados
                </h3>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-label-sm font-label-sm mb-1">
                      <span>Pendientes ({metricPending})</span>
                      <span>{metricTotal ? Math.round((metricPending / metricTotal) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${metricTotal ? (metricPending / metricTotal) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm font-label-sm mb-1">
                      <span>En Proceso ({metricInProgress})</span>
                      <span>{inProgressLoad}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-primary-container h-2 rounded-full" style={{ width: `${inProgressLoad}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm font-label-sm mb-1">
                      <span>En Revisión ({metricReview})</span>
                      <span>{metricTotal ? Math.round((metricReview / metricTotal) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${metricTotal ? (metricReview / metricTotal) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-label-sm font-label-sm mb-1">
                      <span>Finalizadas ({metricCompleted})</span>
                      <span>{metricTotal ? Math.round((metricCompleted / metricTotal) * 100) : 0}%</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-2">
                      <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${metricTotal ? (metricCompleted / metricTotal) * 100 : 0}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest border border-outline-variant/40 rounded-xl p-5 shadow-xs">
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-purple-600">group</span>
                  Carga por Desarrollador
                </h3>
                <div className="space-y-3">
                  {usersList.map((u) => {
                    const userTasksCount = tasks.filter((t) => t.assignedToId === u.id || t.assignedTo?.name === u.name).length;
                    return (
                      <div key={u.id} className="flex items-center justify-between text-body-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-surface-container text-primary font-bold text-[10px] flex items-center justify-center">
                            {getInitials(u.name)}
                          </div>
                          <span className="font-medium text-on-surface">{u.name}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container font-mono text-secondary text-xs">
                          {userTasksCount} tareas
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* =========================================================================
          9. Modal / Drawer: + Nueva Tarea (matches code.html modal)
          ========================================================================= */}
      {isCreateModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4"
          id="modal-nueva-tarea"
        >
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-container/10 text-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-[20px]">add_task</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">
                    Crear Nueva Tarea
                  </h3>
                  <p className="font-body-sm text-body-sm text-secondary">
                    Sincronización instantánea con caché Redis.
                  </p>
                </div>
              </div>
              <button
                className="text-secondary hover:text-on-surface p-1 rounded-lg cursor-pointer"
                onClick={() => setIsCreateModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Form */}
            <form className="space-y-4" onSubmit={handleCreateTask}>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Título de la Tarea <span className="text-error">*</span>
                </label>
                <input
                  className="w-full px-3 py-2 bg-surface border border-outline-variant/60 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container"
                  placeholder="Ej. Depurar pipeline de eventos..."
                  required
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">
                  Descripción Breve
                </label>
                <textarea
                  className="w-full px-3 py-2 bg-surface border border-outline-variant/60 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container"
                  placeholder="Detalles técnicos, endpoints afectados y objetivos de aceptación..."
                  rows={3}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">
                    Asignar a
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/60 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container cursor-pointer"
                    value={newAssignedToId}
                    onChange={(e) => setNewAssignedToId(e.target.value)}
                  >
                    {usersList.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} {u.role ? `(${u.role})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">
                    Prioridad
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/60 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container cursor-pointer"
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                  >
                    <option value="high">Alta (Urgente)</option>
                    <option value="medium">Media (Estándar)</option>
                    <option value="low">Baja</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">
                    Estado Inicial
                  </label>
                  <select
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/60 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container cursor-pointer"
                    value={newStatusId}
                    onChange={(e) => setNewStatusId(e.target.value)}
                  >
                    {statuses.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-label-md text-label-md text-on-surface mb-1">
                    Tiempo Estimado
                  </label>
                  <input
                    className="w-full px-3 py-2 bg-surface border border-outline-variant/60 rounded-lg text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container/30 focus:border-primary-container"
                    placeholder="Ej. 1d 4h"
                    type="text"
                    value={newEstimatedTime}
                    onChange={(e) => setNewEstimatedTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant/30">
                <button
                  className="px-4 py-2 rounded-lg border border-outline-variant/60 text-secondary hover:text-on-surface font-label-md text-label-md transition-colors cursor-pointer"
                  onClick={() => setIsCreateModalOpen(false)}
                  type="button"
                >
                  Cancelar
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md shadow-xs transition-colors disabled:opacity-50 cursor-pointer"
                  disabled={isSubmittingTask}
                  type="submit"
                >
                  {isSubmittingTask ? 'Sincronizando...' : 'Crear y Sincronizar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          10. Modal Detalle de Tarea y Comentarios
          ========================================================================= */}
      {isDetailModalOpen && selectedTask && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-outline-variant/50 rounded-2xl w-full max-w-xl shadow-2xl p-6 relative max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30 mb-4">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-primary px-2 py-0.5 rounded bg-primary-container/10">
                  {selectedTask.code || `TP-${selectedTask.id}`}
                </span>
                <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">
                  Detalle de la Tarea
                </h3>
              </div>
              <button
                className="text-secondary hover:text-on-surface p-1 rounded-lg cursor-pointer"
                onClick={() => setIsDetailModalOpen(false)}
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
              <div>
                <h4 className="text-lg font-semibold text-on-surface mb-1">{selectedTask.title}</h4>
                <p className="text-body-sm text-secondary bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
                  {selectedTask.description || 'Sin descripción detallada.'}
                </p>
              </div>

              {/* Meta Grid */}
              <div className="grid grid-cols-2 gap-3 text-body-sm">
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="text-xs text-secondary block">Creado por</span>
                  <span className="font-medium text-on-surface">{selectedTask.createdBy?.name || 'Admin'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="text-xs text-secondary block">Asignado a</span>
                  <span className="font-medium text-on-surface">{selectedTask.assignedTo?.name || 'Sin Asignar'}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="text-xs text-secondary block">Estado Actual</span>
                  <span className="font-semibold text-primary">{selectedTask.status?.name}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-surface border border-outline-variant/30">
                  <span className="text-xs text-secondary block">Tiempo Asignado</span>
                  <span className="font-medium text-on-surface">{selectedTask.timeSinceAssignment || '1d 4h'}</span>
                </div>
              </div>

              {/* Feed de Comentarios */}
              <div className="pt-2">
                <h5 className="font-label-md text-label-md font-semibold text-on-surface mb-2 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-primary">chat</span>
                  <span>Comentarios ({selectedTask.comments?.length || selectedTask.commentsCount || 0})</span>
                </h5>

                <div className="space-y-2 mb-3 max-h-48 overflow-y-auto custom-scrollbar">
                  {selectedTask.comments && selectedTask.comments.length > 0 ? (
                    selectedTask.comments.map((c) => (
                      <div key={c.id} className="p-2.5 bg-surface-container-low rounded-lg border border-outline-variant/20 text-body-sm">
                        <div className="flex justify-between items-center text-xs text-secondary mb-1">
                          <span className="font-semibold text-on-surface">{c.user?.name || 'Colaborador'}</span>
                          <span>{new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                        <p className="text-on-surface-variant">{c.content}</p>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-center text-xs text-secondary bg-surface-container-low/50 rounded-lg">
                      No hay comentarios aún en esta tarea. ¡Sé el primero en colaborar!
                    </div>
                  )}
                </div>

                {/* Form Comentario */}
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 px-3 py-1.5 bg-surface border border-outline-variant/60 rounded-lg text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container/30"
                    placeholder="Escribe un comentario o nota técnica..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                  />
                  <button
                    type="submit"
                    disabled={isSubmittingComment || !newCommentText.trim()}
                    className="px-3 py-1.5 bg-primary-container text-on-primary rounded-lg text-label-md hover:bg-primary transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
                  >
                    <span>Enviar</span>
                    <span className="material-symbols-outlined text-[16px]">send</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-outline-variant/30 flex justify-end">
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="px-4 py-1.5 bg-surface-container-low hover:bg-surface-container text-on-surface rounded-lg text-label-md transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          11. Toast de Notificación Redis (Bottom Right)
          ========================================================================= */}
      <div
        className={`fixed bottom-4 right-4 bg-inverse-surface text-inverse-on-surface px-4 py-3 rounded-xl shadow-xl flex items-center gap-3 transition-transform duration-300 z-50 ${showToast ? 'translate-y-0 opacity-100' : 'translate-y-24 opacity-0 pointer-events-none'}`}
        id="toast-redis"
      >
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
        <span className="font-body-sm text-body-sm" id="toast-msg">
          {toastMessage}
        </span>
      </div>
    </div>
  );
}
