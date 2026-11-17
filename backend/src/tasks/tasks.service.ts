import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Task } from '../database/entities/task.entity';
import { TaskStatus } from '../database/entities/task-status.entity';
import { TaskComment } from '../database/entities/task-comment.entity';
import { TaskStatusHistory } from '../database/entities/task-status-history.entity';
import { User } from '../database/entities/user.entity';
import { RedisService } from '../redis/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import { AssignTaskDto } from './dto/assign-task.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskStatus)
    private readonly statusRepository: Repository<TaskStatus>,
    @InjectRepository(TaskComment)
    private readonly commentRepository: Repository<TaskComment>,
    @InjectRepository(TaskStatusHistory)
    private readonly historyRepository: Repository<TaskStatusHistory>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {}

  // 1. Obtener todos los estados de tareas
  async getStatuses(): Promise<TaskStatus[]> {
    return this.statusRepository.find({ order: { id: 'ASC' } });
  }

  // 2. Crear una nueva tarea
  async createTask(userId: number, dto: CreateTaskDto) {
    const assignedUser = await this.userRepository.findOne({
      where: { id: dto.assignedToId },
    });
    if (!assignedUser) {
      throw new NotFoundException('El usuario asignado no existe');
    }

    let statusId = dto.statusId;
    let status: TaskStatus | null = null;

    if (statusId) {
      status = await this.statusRepository.findOne({ where: { id: statusId } });
    }

    if (!status) {
      status = await this.statusRepository.findOne({ where: { isDefault: true } });
      if (!status) {
        status = await this.statusRepository.findOne({ where: { name: 'Pendiente' } });
      }
      if (!status) {
        // Fallback al primer estado existente
        const all = await this.statusRepository.find({ take: 1 });
        status = all[0];
      }
    }

    const now = new Date();
    const task = this.taskRepository.create({
      title: dto.title.trim(),
      description: dto.description?.trim(),
      createdById: userId,
      assignedToId: dto.assignedToId,
      statusId: status ? status.id : 1,
      assignedAt: now,
    });

    const savedTask = await this.taskRepository.save(task);

    // Integración Redis: Guardar fecha/hora de asignación y estado en caché
    await this.redisService.setTaskAssignment(savedTask.id, now.toISOString());
    if (status) {
      await this.redisService.cacheTaskStatus(savedTask.id, status.name);
    }

    // Registrar en historial inicial
    const history = this.historyRepository.create({
      taskId: savedTask.id,
      changedById: userId,
      newStatusId: savedTask.statusId,
      changedAt: now,
    });
    await this.historyRepository.save(history);

    return this.findOne(savedTask.id);
  }

  // 3. Listar tareas con cálculo de tiempo de asignación optimizado con Redis
  async findAll(userId: number, filter: 'all' | 'assigned' | 'created' = 'all') {
    const query = this.taskRepository
      .createQueryBuilder('task')
      .leftJoinAndSelect('task.status', 'status')
      .leftJoinAndSelect('task.createdBy', 'createdBy')
      .leftJoinAndSelect('task.assignedTo', 'assignedTo')
      .orderBy('task.createdAt', 'DESC');

    if (filter === 'assigned') {
      query.where('task.assignedToId = :userId', { userId });
    } else if (filter === 'created') {
      query.where('task.createdById = :userId', { userId });
    }

    const tasks = await query.getMany();

    // Enriquecer cada tarea con el cálculo de tiempo transcurrido desde asignación
    const enrichedTasks = await Promise.all(
      tasks.map(async (task) => {
        const timeData = await this.computeAssignmentTime(task.id, task.assignedAt);
        return {
          ...task,
          timeSinceAssignment: timeData.formatted,
          assignmentDurationSeconds: timeData.seconds,
        };
      }),
    );

    return enrichedTasks;
  }

  // 4. Detalle de tarea con historial y comentarios
  async findOne(taskId: number) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['status', 'createdBy', 'assignedTo', 'comments', 'comments.user', 'history', 'history.changedBy', 'history.previousStatus', 'history.newStatus'],
      order: {
        comments: { createdAt: 'ASC' },
        history: { changedAt: 'DESC' },
      },
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    const timeData = await this.computeAssignmentTime(task.id, task.assignedAt);

    return {
      ...task,
      timeSinceAssignment: timeData.formatted,
      assignmentDurationSeconds: timeData.seconds,
    };
  }

  // 5. Cambiar estado de una tarea
  async updateStatus(taskId: number, userId: number, dto: UpdateTaskStatusDto) {
    const task = await this.taskRepository.findOne({
      where: { id: taskId },
      relations: ['status'],
    });

    if (!task) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    // Validar que el usuario sea creador o asignado
    if (task.createdById !== userId && task.assignedToId !== userId) {
      throw new ForbiddenException('Solo el creador o el usuario asignado pueden modificar el estado de la tarea');
    }

    const newStatus = await this.statusRepository.findOne({
      where: { id: dto.statusId },
    });
    if (!newStatus) {
      throw new NotFoundException('El estado especificado no existe');
    }

    const previousStatusId = task.statusId;
    task.statusId = newStatus.id;
    const now = new Date();
    await this.taskRepository.save(task);

    // Actualizar caché de Redis para respuesta inmediata
    await this.redisService.cacheTaskStatus(task.id, newStatus.name);

    // Registrar en tabla de histórico con fecha y hora exacta
    const historyEntry = this.historyRepository.create({
      taskId: task.id,
      changedById: userId,
      previousStatusId,
      newStatusId: newStatus.id,
      changedAt: now,
    });
    await this.historyRepository.save(historyEntry);

    return this.findOne(task.id);
  }

  // 6. Asignar/Reasignar tarea
  async assignTask(taskId: number, userId: number, dto: AssignTaskDto) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    if (task.createdById !== userId && task.assignedToId !== userId) {
      throw new ForbiddenException('No tienes permisos para reasignar esta tarea');
    }

    const newAssignee = await this.userRepository.findOne({ where: { id: dto.assignedToId } });
    if (!newAssignee) {
      throw new NotFoundException('El usuario a asignar no existe');
    }

    const now = new Date();
    task.assignedToId = dto.assignedToId;
    task.assignedAt = now;
    await this.taskRepository.save(task);

    // Actualizar Redis
    await this.redisService.setTaskAssignment(task.id, now.toISOString());

    return this.findOne(task.id);
  }

  // 7. Añadir comentario
  async addComment(taskId: number, userId: number, dto: CreateCommentDto) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    // Regla: "Tanto el usuario que asigna la tarea como el que la recibe pueden añadir comentarios"
    if (task.createdById !== userId && task.assignedToId !== userId) {
      throw new ForbiddenException('Solo el creador o el usuario asignado pueden comentar en esta tarea');
    }

    const comment = this.commentRepository.create({
      taskId,
      userId,
      content: dto.content.trim(),
    });

    const savedComment = await this.commentRepository.save(comment);

    return this.commentRepository.findOne({
      where: { id: savedComment.id },
      relations: ['user'],
    });
  }

  // 8. Listar comentarios de una tarea
  async getComments(taskId: number) {
    const task = await this.taskRepository.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException(`Tarea con ID ${taskId} no encontrada`);
    }

    return this.commentRepository.find({
      where: { taskId },
      relations: ['user'],
      order: { createdAt: 'ASC' },
    });
  }

  // Utilidad: Cálculo de tiempo de asignación con optimización Redis
  private async computeAssignmentTime(taskId: number, dbAssignedAt: Date) {
    let assignedDate: Date = dbAssignedAt;

    // Intentar leer de Redis (optimización de lectura)
    const cachedTime = await this.redisService.getTaskAssignment(taskId);
    if (cachedTime) {
      assignedDate = new Date(cachedTime);
    } else if (dbAssignedAt) {
      // Guardar en Redis para futuras lecturas
      await this.redisService.setTaskAssignment(taskId, new Date(dbAssignedAt).toISOString());
    }

    const now = new Date();
    const diffMs = Math.max(0, now.getTime() - (assignedDate ? assignedDate.getTime() : now.getTime()));
    const totalSeconds = Math.floor(diffMs / 1000);

    const minutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    let formatted = 'Recién asignada';
    if (days > 0) {
      formatted = `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    } else if (hours > 0) {
      formatted = `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else if (minutes > 0) {
      formatted = `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (totalSeconds > 5) {
      formatted = `Hace ${totalSeconds} segundos`;
    }

    return {
      seconds: totalSeconds,
      formatted,
    };
  }
}
