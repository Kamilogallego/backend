import { SetMetadata } from '@nestjs/common';

/**
 * Clave para marcar endpoints como públicos
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Decorator para marcar un endpoint como público (sin autenticación)
 * @example
 * @Public()
 * @Get('available')
 * async getAvailable() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
