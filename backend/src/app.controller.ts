import { Controller, Get, Post } from '@nestjs/common';
import { DatabaseSeedService } from './database/seed.service';

@Controller()
export class AppController {
  constructor(private readonly seedService: DatabaseSeedService) {}

  private getHealthInfo() {
    return {
      status: 'online',
      service: 'TaskPulse API (Laboratorio TalentoTech)',
      version: '1.0.0',
      message:
        'Servidor Backend NestJS operativo. La aplicación web de gestión de tareas se encuentra en http://localhost:3000.',
      frontendUrl: 'http://localhost:3000',
      apiPrefix: '/api',
      seedEndpoint: 'http://localhost:3001/api/seed',
      documentation: {
        auth: [
          'POST /api/auth/register',
          'POST /api/auth/login',
          'POST /api/auth/logout',
          'GET /api/auth/profile',
        ],
        users: ['GET /api/users'],
        tasks: [
          'GET /api/tasks',
          'POST /api/tasks',
          'GET /api/tasks/:id',
          'PATCH /api/tasks/:id/status',
          'PATCH /api/tasks/:id/assign',
          'GET /api/tasks/statuses',
        ],
        comments: [
          'GET /api/tasks/:id/comments',
          'POST /api/tasks/:id/comments',
        ],
      },
    };
  }

  @Get()
  getRoot() {
    return this.getHealthInfo();
  }

  @Get('api')
  getApiRoot() {
    return this.getHealthInfo();
  }

  // Endpoints para ejecutar sembrado de datos en cualquier momento desde el navegador o frontend
  @Get('seed')
  seedRoot() {
    return this.seedService.runSeed();
  }

  @Get('api/seed')
  seedApiGet() {
    return this.seedService.runSeed();
  }

  @Post('api/seed')
  seedApiPost() {
    return this.seedService.runSeed();
  }
}
