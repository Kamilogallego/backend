import { SetMetadata } from '@nestjs/common';
import { Role } from '../interfaces/jwt-payload.interface.js';
import { ROLES_KEY } from '../guards/roles.guard.js';

/**
 * Decorator para especificar qué roles pueden acceder a un endpoint
 *
 * @example
 * @Roles(Role.SUPER_ADMIN, Role.ADMIN)
 * @Get('admins-only')
 * async adminEndpoint() { ... }
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
