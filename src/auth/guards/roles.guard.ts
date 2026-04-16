import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { RequestWithUser } from '../entities/auth.entity';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) return false;

    if (user.role === Role.ADMIN) return true;

    if (user.role === Role.VIEWER) {
      if (request.method !== 'GET') {
        throw new ForbiddenException('Viewer role has read-only access');
      }
      return true;
    }

    if (user.role === Role.EDITOR) {
      if (request.url.startsWith('/categories') && request.method !== 'GET') {
        throw new ForbiddenException('Editors cannot manage categories');
      }

      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) throw new ForbiddenException('Insufficient permissions');

    return true;
  }
}
