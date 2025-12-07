import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { JwtPayload } from "../interfaces/jwt-payload.interface.js";
import { RequestWithUser } from "../interfaces/request-with-user.interface.js";

/**
 * Decorator para obtener el usuario actual desde el request
 * Debe usarse en endpoints protegidos con JwtAuthGuard
 *
 * @example
 * @Get('profile')
 * @UseGuards(JwtAuthGuard)
 * async getProfile(@CurrentUser() user: JwtPayload) {
 *   return user;
 * }
 *
 * // O para obtener solo una propiedad:
 * @Get('user-id')
 * @UseGuards(JwtAuthGuard)
 * async getUserId(@CurrentUser('sub') userId: number) {
 *   return userId;
 * }
 */
export const CurrentUser = createParamDecorator(
  (data: keyof JwtPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    // Si se especificó una propiedad, devolver solo esa
    if (data && user) {
      return user[data];
    }

    // Devolver el usuario
    return user;
  },
);
