import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import {
  User,
  TaskStatus,
  Task,
  TaskComment,
  TaskStatusHistory,
} from './entities';

@Injectable()
export class DatabaseSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DatabaseSeedService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(TaskStatus)
    private readonly statusRepository: Repository<TaskStatus>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>,
    @InjectRepository(TaskComment)
    private readonly commentRepository: Repository<TaskComment>,
    @InjectRepository(TaskStatusHistory)
    private readonly historyRepository: Repository<TaskStatusHistory>,
  ) {}

  async onApplicationBootstrap() {
    this.logger.log('🔄 Ejecutando verificación de datos semilla al iniciar NestJS...');
    try {
      const result = await this.runSeed();
      this.logger.log(`✅ Base de datos lista: ${result.message}`);
    } catch (error) {
      this.logger.error(`Error verificando o sembrando datos de prueba: ${error.message}`);
    }
  }

  async runSeed() {
    await this.seedStatuses();
    const seededUsers = await this.seedUsers();
    const tasksCount = await this.seedTasks();

    return {
      success: true,
      message: 'Datos semilla verificados y sembrados exitosamente',
      users: seededUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        password: 'Password123!',
      })),
      totalTasks: tasksCount,
      timestamp: new Date().toISOString(),
    };
  }

  private async seedStatuses() {
    const defaultStatuses = [
      { id: 1, name: 'Pendiente', description: 'La tarea ha sido asignada pero no iniciada.', isDefault: true, color: '#F59E0B' },
      { id: 2, name: 'En Proceso', description: 'La tarea se encuentra actualmente en desarrollo.', isDefault: false, color: '#3B82F6' },
      { id: 3, name: 'Finalizada', description: 'La tarea ha sido completada satisfactoriamente.', isDefault: false, color: '#10B981' },
    ];

    for (const s of defaultStatuses) {
      const existing = await this.statusRepository.findOne({ where: { name: s.name } });
      if (!existing) {
        await this.statusRepository.save(this.statusRepository.create(s));
        this.logger.log(`  ➕ Estado creado: ${s.name}`);
      }
    }
  }

  private async seedUsers(): Promise<User[]> {
    const saltRounds = 10;
    const defaultPassword = 'Password123!';
    const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

    const testUsers = [
      { name: 'Sofía Romero', email: 'sofia@taskpulse.io' },
      { name: 'Carlos Mendoza', email: 'carlos@taskpulse.io' },
      { name: 'Mariana Silva', email: 'mariana@taskpulse.io' },
      { name: 'Diego Torres', email: 'diego@taskpulse.io' },
      { name: 'Elena Morales', email: 'elena@taskpulse.io' },
      { name: 'Admin TalentoTech', email: 'admin@taskpulse.io' },
    ];

    const results: User[] = [];

    for (const u of testUsers) {
      const normalizedEmail = u.email.toLowerCase().trim();
      let user = await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.password')
        .where('LOWER(TRIM(user.email)) = :email', { email: normalizedEmail })
        .getOne();

      if (!user) {
        user = this.userRepository.create({
          name: u.name,
          email: normalizedEmail,
          password: hashedPassword,
        });
        user = await this.userRepository.save(user);
        this.logger.log(`  ➕ Usuario de prueba creado: ${u.name} (${u.email}) [Clave: Password123!]`);
      } else {
        // Asegurar que la contraseña de los usuarios de prueba siempre coincida con Password123!
        user.password = hashedPassword;
        user = await this.userRepository.save(user);
      }
      results.push(user);
    }

    return results;
  }

  private async seedTasks(): Promise<number> {
    const count = await this.taskRepository.count();
    if (count > 0) return count;

    const elena = await this.userRepository.findOne({ where: { email: 'elena@taskpulse.io' } });
    const carlos = await this.userRepository.findOne({ where: { email: 'carlos@taskpulse.io' } });
    const sofia = await this.userRepository.findOne({ where: { email: 'sofia@taskpulse.io' } });
    const mariana = await this.userRepository.findOne({ where: { email: 'mariana@taskpulse.io' } });
    const diego = await this.userRepository.findOne({ where: { email: 'diego@taskpulse.io' } });

    const pending = await this.statusRepository.findOne({ where: { name: 'Pendiente' } });
    const inProgress = await this.statusRepository.findOne({ where: { name: 'En Proceso' } });
    const completed = await this.statusRepository.findOne({ where: { name: 'Finalizada' } });

    if (elena && carlos && pending) {
      const task1 = await this.taskRepository.save(
        this.taskRepository.create({
          title: 'Indexar esquemas de sesiones y caché en Redis',
          description: 'Configurar estructura de llaves session:user:<id> con TTL de 24 horas y optimizar el cálculo de tiempos transcurridos en memoria.',
          status: pending,
          createdBy: elena,
          assignedTo: carlos,
          createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
          assignedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
        }),
      );

      await this.commentRepository.save([
        this.commentRepository.create({
          task: task1,
          user: elena,
          content: 'Hola Carlos, por favor valida que la clave de Redis expire en 86400 segundos.',
        }),
        this.commentRepository.create({
          task: task1,
          user: carlos,
          content: 'Listo Elena, ya configuré el RedisService con ioredis y el cálculo de tiempo dinámico.',
        }),
      ]);
    }

    if (sofia && mariana && inProgress) {
      const task2 = await this.taskRepository.save(
        this.taskRepository.create({
          title: 'Implementar interfaz de gestión y tablero de tareas',
          description: 'Desarrollar vistas React con Tailwind CSS para listar tareas, filtrar por asignación y permitir cambio de estado con auditoría.',
          status: inProgress,
          createdBy: sofia,
          assignedTo: mariana,
          createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
          assignedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
        }),
      );

      await this.commentRepository.save([
        this.commentRepository.create({
          task: task2,
          user: sofia,
          content: 'Mariana, recuerda agregar el indicador visual del tiempo transcurrido desde la asignación.',
        }),
      ]);

      if (pending) {
        await this.historyRepository.save(
          this.historyRepository.create({
            task: task2,
            changedBy: mariana,
            previousStatus: pending,
            newStatus: inProgress,
          }),
        );
      }
    }

    if (elena && diego && completed) {
      await this.taskRepository.save(
        this.taskRepository.create({
          title: 'Pruebas de endpoints REST y seguridad JWT',
          description: 'Verificar el ciclo completo de registro, login, emisión de JWT y protección de endpoints con JwtAuthGuard en NestJS.',
          status: completed,
          createdBy: elena,
          assignedTo: diego,
          createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
          assignedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
        }),
      );
    }

    return this.taskRepository.count();
  }
}
