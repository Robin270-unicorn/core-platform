import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

/**
 * Decorator to check if the current user is the owner of a resource
 * Returns true if user is owner, false otherwise
 */
export const IsOwner = createParamDecorator(
  (resourceIdField: string, context: ExecutionContext) => {
    const ctx = GqlExecutionContext.create(context);
    const request = ctx.getContext().req;
    const args = ctx.getArgs();

    const user = request.user;
    const resourceCreatorId = args[resourceIdField];

    return user && resourceCreatorId && user.userId === resourceCreatorId;
  },
);

