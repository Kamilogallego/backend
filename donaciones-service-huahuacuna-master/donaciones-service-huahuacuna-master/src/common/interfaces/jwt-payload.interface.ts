/**
 * Roles del sistema (debe coincidir con auth-service)
 */
export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  PADRINO = 'PADRINO',
}

/**
 * Payload del JWT token
 * Este formato debe coincidir con el generado por auth-service
 */
export interface JwtPayload {
  sub: number;        // User ID
  email: string;
  name: string;
  role: Role;
  iat?: number;       // Issued at
  exp?: number;       // Expiration
}
