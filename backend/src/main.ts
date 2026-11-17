import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);

  // Prefijo global para todos los endpoints excepto rutas raíz y health/seed
  app.setGlobalPrefix('api', {
    exclude: ['/', 'api', 'seed', 'api/seed'],
  });

  // Habilitar CORS para permitir peticiones desde el frontend Next.js
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Validación global de DTOs con class-validator
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  logger.log(`Servidor Backend NestJS corriendo en el puerto ${port} (http://localhost:${port}/api)`);
}

bootstrap();
