import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: Redis;
  private readonly logger = new Logger(RedisService.name);

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = Number(this.configService.get<number>('REDIS_PORT', 6379));

    this.logger.log(`Conectando a Redis en ${host}:${port}...`);
    this.client = new Redis({
      host,
      port,
      retryStrategy: (times) => {
        const delay = Math.min(times * 200, 2000);
        return delay;
      },
      lazyConnect: true,
    });

    this.client
      .connect()
      .then(() => {
        this.logger.log('Conexión con Redis establecida exitosamente.');
      })
      .catch((err) => {
        this.logger.warn(`No se pudo conectar a Redis: ${err.message}. El sistema continuará con degradación suave si es necesario.`);
      });
  }

  onModuleDestroy() {
    if (this.client) {
      this.client.disconnect();
    }
  }

  getClient(): Redis {
    return this.client;
  }

  // 1. Manejo de sesiones y tokens en Redis (Requisito Parte 1)
  async saveSession(userId: number, token: string, ttlSeconds = 86400): Promise<void> {
    try {
      if (this.client?.status === 'ready') {
        const key = `session:user:${userId}`;
        await this.client.set(key, token, 'EX', ttlSeconds);
      }
    } catch (error) {
      this.logger.error(`Error al guardar sesión en Redis: ${error.message}`);
    }
  }

  async getSession(userId: number): Promise<string | null> {
    try {
      if (this.client?.status === 'ready') {
        return await this.client.get(`session:user:${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error al obtener sesión en Redis: ${error.message}`);
    }
    return null;
  }

  async deleteSession(userId: number): Promise<void> {
    try {
      if (this.client?.status === 'ready') {
        await this.client.del(`session:user:${userId}`);
      }
    } catch (error) {
      this.logger.error(`Error al eliminar sesión en Redis: ${error.message}`);
    }
  }

  // 2. Caché y optimización de tiempos de asignación y estados (Requisito Parte 2)
  async setTaskAssignment(taskId: number, assignedAtIso: string): Promise<void> {
    try {
      if (this.client?.status === 'ready') {
        const key = `task:${taskId}:assigned_at`;
        await this.client.set(key, assignedAtIso, 'EX', 86400 * 7); // 7 días en caché
      }
    } catch (error) {
      this.logger.error(`Error al guardar tiempo de asignación en Redis: ${error.message}`);
    }
  }

  async getTaskAssignment(taskId: number): Promise<string | null> {
    try {
      if (this.client?.status === 'ready') {
        return await this.client.get(`task:${taskId}:assigned_at`);
      }
    } catch (error) {
      this.logger.error(`Error al obtener tiempo de asignación de Redis: ${error.message}`);
    }
    return null;
  }

  async cacheTaskStatus(taskId: number, statusName: string): Promise<void> {
    try {
      if (this.client?.status === 'ready') {
        const key = `task:${taskId}:status`;
        await this.client.set(key, statusName, 'EX', 86400);
      }
    } catch (error) {
      this.logger.error(`Error al almacenar estado de tarea en Redis: ${error.message}`);
    }
  }

  async getCachedTaskStatus(taskId: number): Promise<string | null> {
    try {
      if (this.client?.status === 'ready') {
        return await this.client.get(`task:${taskId}:status`);
      }
    } catch (error) {
      this.logger.error(`Error al obtener estado en caché de Redis: ${error.message}`);
    }
    return null;
  }
}
