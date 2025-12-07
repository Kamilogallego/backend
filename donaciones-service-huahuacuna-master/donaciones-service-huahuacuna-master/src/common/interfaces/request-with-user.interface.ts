import { Request } from 'express';
import { JwtPayload } from './jwt-payload.interface.js';

/**
 * Interfaz extendida de Request con usuario autenticado
 */
export interface RequestWithUser extends Request {
  user: JwtPayload;
}
