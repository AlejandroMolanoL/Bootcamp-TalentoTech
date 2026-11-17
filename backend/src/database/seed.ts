import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import {
  User,
  TaskStatus,
  Task,
  TaskComment,
  TaskStatusHistory,
} from './entities';

// Cargar variables de entorno
dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'task_management_db',
  entities: [User, TaskStatus, Task, TaskComment, TaskStatusHistory],
  synchronize: true,
});

async function runSeed() {
  console.log('🔄 Conectando a la base de datos PostgreSQL para ejecutar seed...');
  await AppDataSource.initialize();
  console.log('✅ Conexión establecida.');

  const userRepo = AppDataSource.getRepository(User);
  const statusRepo = AppDataSource.getRepository(TaskStatus);
  const taskRepo = AppDataSource.getRepository(Task);
  const commentRepo = AppDataSource.getRepository(TaskComment);
  const historyRepo = AppDataSource.getRepository(TaskStatusHistory);

  // 1. Semilla de Estados
  console.log('📦 Sembrando estados de tareas...');
  const defaultStatuses = [
    { id: 1, name: 'Pendiente', description: 'La tarea ha sido asignada pero no iniciada.', isDefault: true, color: '#F59E0B' },
    { id: 2, name: 'En Proceso', description: 'La tarea se encuentra actualmente en desarrollo.', isDefault: false, color: '#3B82F6' },
    { id: 3, name: 'Finalizada', description: 'La tarea ha sido completada satisfactoriamente.', isDefault: false, color: '#10B981' },
  ];

  for (const s of defaultStatuses) {
    const existing = await statusRepo.findOne({ where: { name: s.name } });
    if (!existing) {
      await statusRepo.save(statusRepo.create(s));
    }
  }

  // 2. Semilla de Usuarios
  console.log('👥 Sembrando usuarios de prueba...');
  const saltRounds = 10;
  const defaultPassword = 'Password123!';
  const hashedPassword = await bcrypt.hash(defaultPassword, saltRounds);

  const testUsersData = [
    { name: 'Sofía Romero', email: 'sofia@taskpulse.io', password: hashedPassword },
    { name: 'Carlos Mendoza', email: 'carlos@taskpulse.io', password: hashedPassword },
    { name: 'Mariana Silva', email: 'mariana@taskpulse.io', password: hashedPassword },
    { name: 'Diego Torres', email: 'diego@taskpulse.io', password: hashedPassword },
    { name: 'Elena Morales', email: 'elena@taskpulse.io', password: hashedPassword },
    { name: 'Admin TalentoTech', email: 'admin@taskpulse.io', password: hashedPassword },
  ];

  const createdUsers: Record<string, User> = {};

  for (const u of testUsersData) {
    let user = await userRepo.findOne({ where: { email: u.email } });
    if (!user) {
      user = await userRepo.save(userRepo.create(u));
      console.log(`  ➕ Usuario creado: ${u.name} (${u.email})`);
    } else {
      user.password = hashedPassword;
      await userRepo.save(user);
      console.log(`  ✔️ Usuario existente actualizado: ${u.name} (${u.email})`);
    }
    createdUsers[u.email] = user;
  }

  // 3. Semilla de Tareas
  console.log('📋 Sembrando tareas de prueba...');
  const pendingStatus = await statusRepo.findOne({ where: { name: 'Pendiente' } });
  const inProgressStatus = await statusRepo.findOne({ where: { name: 'En Proceso' } });
  const completedStatus = await statusRepo.findOne({ where: { name: 'Finalizada' } });

  const tasksData = [
    {
      title: 'Indexar esquemas de sesiones y caché en Redis',
      description: 'Configurar estructura de llaves session:user:<id> con TTL de 24 horas y optimizar el cálculo de tiempos transcurridos en memoria.',
      status: pendingStatus!,
      createdBy: createdUsers['elena@taskpulse.io'],
      assignedTo: createdUsers['carlos@taskpulse.io'],
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
      assignedAt: new Date(Date.now() - 2 * 24 * 3600 * 1000),
    },
    {
      title: 'Implementar interfaz de gestión y tablero de tareas',
      description: 'Desarrollar vistas React con Tailwind CSS para listar tareas, filtrar por asignación y permitir cambio de estado con auditoría.',
      status: inProgressStatus!,
      createdBy: createdUsers['sofia@taskpulse.io'],
      assignedTo: createdUsers['mariana@taskpulse.io'],
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
      assignedAt: new Date(Date.now() - 1 * 24 * 3600 * 1000),
    },
    {
      title: 'Pruebas de endpoints REST y seguridad JWT',
      description: 'Verificar el ciclo completo de registro, login, emisión de JWT y protección de endpoints con JwtAuthGuard en NestJS.',
      status: completedStatus!,
      createdBy: createdUsers['elena@taskpulse.io'],
      assignedTo: createdUsers['diego@taskpulse.io'],
      createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
      assignedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000),
    },
  ];

  for (const t of tasksData) {
    const existing = await taskRepo.findOne({ where: { title: t.title } });
    if (!existing) {
      const task = await taskRepo.save(taskRepo.create(t));
      console.log(`  ➕ Tarea creada: "${t.title}"`);

      // Comentarios de prueba
      if (t.title.includes('Redis')) {
        await commentRepo.save([
          commentRepo.create({
            task,
            user: createdUsers['elena@taskpulse.io'],
            content: 'Hola Carlos, por favor valida que la clave de Redis expire en 86400 segundos.',
          }),
          commentRepo.create({
            task,
            user: createdUsers['carlos@taskpulse.io'],
            content: 'Listo Elena, ya configuré el RedisService con ioredis y el cálculo de tiempo dinámico.',
          }),
        ]);
      } else if (t.title.includes('interfaz')) {
        await commentRepo.save([
          commentRepo.create({
            task,
            user: createdUsers['sofia@taskpulse.io'],
            content: 'Mariana, recuerda agregar el indicador visual del tiempo transcurrido desde la asignación.',
          }),
        ]);
        await historyRepo.save(
          historyRepo.create({
            task,
            changedBy: createdUsers['mariana@taskpulse.io'],
            previousStatus: pendingStatus,
            newStatus: inProgressStatus!,
          }),
        );
      }
    }
  }

  console.log('\n🎉 ¡Semilla de datos completada exitosamente!');
  console.log('Credenciales de prueba creadas:');
  console.log('----------------------------------------------------');
  console.log('Contraseña común: Password123!');
  console.log('Usuarios:');
  Object.keys(createdUsers).forEach((email) => {
    console.log(` - ${createdUsers[email].name}: ${email}`);
  });
  console.log('----------------------------------------------------');

  await AppDataSource.destroy();
}

runSeed().catch((err) => {
  console.error('❌ Error ejecutando seed:', err);
  process.exit(1);
});
