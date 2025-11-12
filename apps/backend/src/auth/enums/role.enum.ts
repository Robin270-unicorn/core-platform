import { registerEnumType } from '@nestjs/graphql';

/**
 * User roles in the system
 * - SUPPORTER: Contributor/investor - can view, contribute, comment
 * - CREATOR: Campaign owner - can create and manage own campaigns
 * - MODERATOR: Content manager - can approve/reject campaigns, moderate content
 * - ADMIN: System administrator - full access to platform management
 */
export enum Role {
  SUPPORTER = 'SUPPORTER',
  CREATOR = 'CREATOR',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

registerEnumType(Role, {
  name: 'Role',
  description: 'User role in the system',
});

