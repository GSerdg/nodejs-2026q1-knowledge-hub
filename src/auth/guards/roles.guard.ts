import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../../common/decorators/roles.decorator';
import { RequestWithUser } from '../entities/auth.entity';
import { IS_PUBLIC_KEY } from 'src/common/decorators/public.decorator';
import { ForbiddenError } from 'src/common/errors/custom-error';

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

    if (user.role === Role.admin) return true;

    if (user.role === Role.viewer) {
      if (request.method !== 'GET') {
        throw new ForbiddenError('Viewer role has read-only access');
      }
      return true;
    }

    if (user.role === Role.editor) {
      if (request.url.startsWith('/category') && request.method !== 'GET') {
        throw new ForbiddenError('Editors cannot manage categories');
      }

      if (request.url.startsWith('/user') && request.method === 'POST') {
        throw new ForbiddenError('Editors cannot create new user');
      }

      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) return true;

    const hasRole = requiredRoles.includes(user.role);
    if (!hasRole) throw new ForbiddenError('Insufficient permissions');

    return true;
  }
}
