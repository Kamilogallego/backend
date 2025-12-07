import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../interfaces/jwt-payload.interface.js';
import { RequestWithUser } from '../interfaces/request-with-user.interface.js';

export const ROLES_KEY = 'roles';

/**
 * Guard para verificar roles de usuario
 * Debe usarse después de JwtAuthGuard
 *
 * PRINCIPIO: Single Responsibility - Solo verifica roles
 * PRINCIPIO: Open/Closed - Extensible mediante metadata de roles
 */
@Injectable()
export class RolesGuard implements CanActivate {
  private readonly logger = new Logger(RolesGuard.name);

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Obtener roles requeridos del metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Si no hay roles requeridos, permitir acceso
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Verificar que el usuario existe (debería existir si pasó por JwtAuthGuard)
    if (!user || !user.role) {
      this.logger.error('User not found in request. Ensure JwtAuthGuard runs before RolesGuard.');
      throw new ForbiddenException('No tienes permisos para acceder a este recurso');
    }

    // Verificar si el usuario tiene alguno de los roles requeridos
    const hasRole = requiredRoles.includes(user.role);

    if (!hasRole) {
      this.logger.warn(
        `User ${user.email} (role: ${user.role}) tried to access resource requiring roles: ${requiredRoles.join(', ')}`
      );
      throw new ForbiddenException(
        `Se requiere uno de los siguientes roles: ${requiredRoles.join(', ')}`
      );
    }

    return true;
  }
}
