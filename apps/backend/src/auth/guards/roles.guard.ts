import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Role } from '../enums/role.enum';
import { Permission } from '../enums/permission.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';
import { hasPermission } from '../enums/role-permissions';

/**
 * Guard to check if user has required roles or permissions
 * Can be used with @Roles() or @RequirePermissions() decorators
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get required roles and permissions from metadata
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<Permission[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles or permissions are required, allow access
    if (!requiredRoles && !requiredPermissions) {
      return true;
    }

    // Get user from request
    const request = this.getRequest(context);
    const user = request.user;

    if (!user || !user.role) {
      throw new ForbiddenException('User role not found');
    }

    const userRole: Role = user.role;

    // Check role-based access
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(userRole);
      if (!hasRole) {
        throw new ForbiddenException(
          `This action requires one of the following roles: ${requiredRoles.join(', ')}`
        );
      }
    }

    // Check permission-based access
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAllPermissions = requiredPermissions.every(permission =>
        hasPermission(userRole, permission)
      );

      if (!hasAllPermissions) {
        const missingPermissions = requiredPermissions.filter(
          permission => !hasPermission(userRole, permission)
        );
        throw new ForbiddenException(
          `Missing required permissions: ${missingPermissions.join(', ')}`
        );
      }
    }

    return true;
  }

  private getRequest(context: ExecutionContext) {
    // Handle both HTTP and GraphQL contexts
    const contextType = context.getType();

    if (contextType === 'http') {
      return context.switchToHttp().getRequest();
    }

    // GraphQL context
    const ctx = GqlExecutionContext.create(context);
    return ctx.getContext().req;
  }
}

