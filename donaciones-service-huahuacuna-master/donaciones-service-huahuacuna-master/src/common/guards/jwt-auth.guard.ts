import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { JwtPayload } from '../interfaces/jwt-payload.interface.js';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator.js';

/**
 * Guard para verificar JWT tokens
 * Valida el token usando el mismo JWT_SECRET que auth-service
 * Respeta el decorator @Public() para endpoints públicos
 *
 * PRINCIPIO: Single Responsibility - Solo se encarga de validar el token
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    // Verificar si el endpoint está marcado como público
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw new UnauthorizedException('Authorization header is missing.');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      throw new UnauthorizedException('Malformed authorization header.');
    }

    try {
      // Verificar el token con el mismo secret que auth-service
      const payload = this.jwtService.verify<JwtPayload>(token);

      // Adjuntar usuario al request para uso posterior
      (request as any).user = payload;

      this.logger.debug(`User ${payload.email} authenticated successfully`);

      return true;
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token has expired.');
        }
        if (error.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Invalid token.');
        }
      }
      throw new UnauthorizedException('Authentication failed.');
    }
  }
}
