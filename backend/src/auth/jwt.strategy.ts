import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../database/entities/user.entity';
import { RedisService } from '../redis/redis.service';

export interface JwtPayload {
  sub: number;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly redisService: RedisService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'super_secret_jwt_key_talento_tech_2026'),
      passReqToCallback: true,
    });
  }

  async validate(req: any, payload: JwtPayload) {
    const user = await this.userRepository.findOne({ where: { id: payload.sub } });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado o token inválido');
    }

    // Verificar sesión en Redis si está activa (Requisito Parte 1)
    const sessionToken = await this.redisService.getSession(user.id);
    const authHeader = req.headers.authorization;
    const currentToken = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (sessionToken && currentToken && sessionToken !== currentToken) {
      throw new UnauthorizedException('Sesión cerrada o iniciada en otro dispositivo');
    }

    return user;
  }
}
