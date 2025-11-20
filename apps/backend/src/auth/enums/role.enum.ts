import { registerEnumType } from '@nestjs/graphql';

/**
 * User roles in the system
 * - SUPPORTER: Regular user - can view, contribute, comment, and create campaigns
 * - MODERATOR: Content manager - can approve/reject campaigns, moderate content
 * - ADMIN: System administrator - full access to platform management
 *
 * Note: Campaign ownership is context-specific (via creatorId), not a global role
 */
export enum Role {
  SUPPORTER = 'SUPPORTER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User role in the system',
});

