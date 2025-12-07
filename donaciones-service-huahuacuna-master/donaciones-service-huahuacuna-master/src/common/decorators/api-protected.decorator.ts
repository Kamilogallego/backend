import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { RolesGuard } from '../guards/roles.guard.js';
import { Roles } from './roles.decorator.js';
import { Role } from '../interfaces/jwt-payload.interface.js';

/**
 * Decorator compuesto para endpoints protegidos
 * Combina guards de autenticación, roles y documentación Swagger
 *
 * PRINCIPIO: DRY - No repetir configuración en cada endpoint
 *
 * @example
 * @ApiProtected()
 * @Get('protected')
 * async protectedEndpoint() { ... }
 *
 * @ApiProtected(Role.SUPER_ADMIN, Role.ADMIN)
 * @Get('admin-only')
 * async adminEndpoint() { ... }
 */
export function ApiProtected(...roles: Role[]) {
  const decorators = [
    UseGuards(JwtAuthGuard, RolesGuard),
    ApiBearerAuth(),
    ApiUnauthorizedResponse({ description: 'No autorizado - Token inválido o expirado' }),
  ];

  if (roles && roles.length > 0) {
    decorators.push(Roles(...roles));
    decorators.push(
      ApiForbiddenResponse({
        description: `Prohibido - Se requiere uno de los roles: ${roles.join(', ')}`
      })
    );
  }

  return applyDecorators(...decorators);
}
