import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly redisService: RedisService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { name, email, password } = registerDto;
    const cleanEmail = email.toLowerCase().trim();

    // 1. Validar si el usuario ya existe
    const existingUser = await this.userRepository
      .createQueryBuilder('user')
      .where('LOWER(TRIM(user.email)) = :email', { email: cleanEmail })
      .getOne();

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario registrado con este correo electrónico');
    }

    // 2. Encriptar contraseña con bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 3. Crear y guardar usuario
    const user = this.userRepository.create({
      name: name.trim(),
      email: cleanEmail,
      password: hashedPassword,
    });

    try {
      const savedUser = await this.userRepository.save(user);

      // 4. Generar token
      const token = this.generateToken(savedUser);

      // 5. Guardar sesión en Redis
      await this.redisService.saveSession(savedUser.id, token);

      this.logger.log(`Usuario registrado exitosamente: ${savedUser.name} (${savedUser.email})`);

      return {
        message: 'Usuario registrado exitosamente',
        user: {
          id: savedUser.id,
          name: savedUser.name,
          email: savedUser.email,
          createdAt: savedUser.createdAt,
        },
        accessToken: token,
      };
    } catch (error) {
      this.logger.error(`Error al registrar usuario: ${error.message}`);
      throw new InternalServerErrorException('Error al registrar el usuario');
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;
    const cleanEmail = email.toLowerCase().trim();

    this.logger.log(`Intento de login recibido para: "${cleanEmail}"`);

    // 1. Buscar usuario con password
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('LOWER(TRIM(user.email)) = :email', { email: cleanEmail })
      .getOne();

    if (!user) {
      this.logger.warn(`Login fallido: Usuario "${cleanEmail}" no encontrado en la base de datos.`);
      throw new UnauthorizedException('Credenciales inválidas. Verifica tu correo o contraseña.');
    }

    // 2. Verificar contraseña con bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      this.logger.warn(`Login fallido: Contraseña incorrecta para el usuario "${cleanEmail}".`);
      throw new UnauthorizedException('Credenciales inválidas. Verifica tu correo o contraseña.');
    }

    // 3. Generar token JWT
    const token = this.generateToken(user);

    // 4. Guardar sesión en Redis (Requisito Parte 1)
    await this.redisService.saveSession(user.id, token);

    this.logger.log(`✅ Login exitoso: ${user.name} (${user.email})`);

    return {
      message: 'Inicio de sesión exitoso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
      accessToken: token,
    };
  }

  async logout(userId: number) {
    // Eliminar sesión de Redis
    await this.redisService.deleteSession(userId);
    return { message: 'Sesión cerrada exitosamente' };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    return user;
  }

  private generateToken(user: User): string {
    const payload = { sub: user.id, email: user.email, name: user.name };
    return this.jwtService.sign(payload);
  }
}
