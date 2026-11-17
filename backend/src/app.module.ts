import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { TasksModule } from './tasks/tasks.module';
import {
  User,
  TaskStatus,
  Task,
  TaskComment,
  TaskStatusHistory,
} from './database/entities';
import { DatabaseSeedService } from './database/seed.service';
import { AppController } from './app.controller';

@Module({
  imports: [
    // Variables de entorno globales
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),

    // Conexión a Base de Datos PostgreSQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: Number(configService.get<number>('DB_PORT', 5432)),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_NAME', 'task_management_db'),
        entities: [User, TaskStatus, Task, TaskComment, TaskStatusHistory],
        synchronize: true, // Sincroniza esquema de entidades con PostgreSQL
        logging: false,
      }),
    }),
    TypeOrmModule.forFeature([
      User,
      TaskStatus,
      Task,
      TaskComment,
      TaskStatusHistory,
    ]),

    // Módulos de la aplicación
    RedisModule,
    AuthModule,
    UsersModule,
    TasksModule,
  ],
  controllers: [AppController],
  providers: [DatabaseSeedService],
})
export class AppModule {}
