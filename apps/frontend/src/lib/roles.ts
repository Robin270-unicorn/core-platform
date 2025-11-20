/**
 * Frontend Role Types and Utilities
 * Import this file in your frontend application to use the same role definitions
 */

export enum Role {
  SUPPORTER = 'SUPPORTER',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export interface JwtPayload {
  sub: string;
  email: string;
  userId: string;
  sid: string;
  role: Role;
  iat: number;
  exp: number;
}

/**
 * Check if a user has one of the required roles
 */
export function hasRole(userRole: Role, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole);
}


/**
 * Actions and which roles can perform them
 */
export const ROLE_ACTIONS: Record<string, Role[]> = {
  // Campaign actions - anyone can create and manage their own campaigns
  VIEW_CAMPAIGNS: [Role.SUPPORTER, Role.MODERATOR, Role.ADMIN],
  CREATE_CAMPAIGN: [Role.SUPPORTER, Role.MODERATOR, Role.ADMIN],
  EDIT_OWN_CAMPAIGN: [Role.SUPPORTER, Role.MODERATOR, Role.ADMIN],
  DELETE_OWN_CAMPAIGN: [Role.SUPPORTER, Role.MODERATOR, Role.ADMIN],
  SUBMIT_CAMPAIGN: [Role.SUPPORTER, Role.MODERATOR, Role.ADMIN],
  APPROVE_CAMPAIGN: [Role.MODERATOR, Role.ADMIN],
  REJECT_CAMPAIGN: [Role.MODERATOR, Role.ADMIN],

  // Contribution actions
  CONTRIBUTE: [Role.SUPPORTER, Role.ADMIN],

  // Comment actions
  READ_COMMENTS: [Role.SUPPORTER, Role.MODERATOR, Role.ADMIN],
  WRITE_COMMENTS: [Role.SUPPORTER, Role.MODERATOR, Role.ADMIN],
  MODERATE_COMMENTS: [Role.MODERATOR, Role.ADMIN],

  // User management
  MANAGE_USERS: [Role.MODERATOR, Role.ADMIN],
  MANAGE_ROLES: [Role.MODERATOR, Role.ADMIN],

  // Platform settings
  MANAGE_SETTINGS: [Role.MODERATOR, Role.ADMIN],
};

/**
 * Check if a user can perform an action based on their role
 */
export function canPerformAction(
  userRole: Role,
  action: keyof typeof ROLE_ACTIONS
): boolean {
  return ROLE_ACTIONS[action].includes(userRole);
}

/**
 * Get user-friendly role name
 */
export function getRoleDisplayName(role: Role): string {
  const displayNames: Record<Role, string> = {
    [Role.SUPPORTER]: 'Supporter',
    [Role.MODERATOR]: 'Moderator',
    [Role.ADMIN]: 'Administrator',
  };
  return displayNames[role];
}

/**
 * Get role description
 */
export function getRoleDescription(role: Role): string {
  const descriptions: Record<Role, string> = {
    [Role.SUPPORTER]: 'Regular user - can create campaigns, contribute, and comment',
    [Role.MODERATOR]: 'Content manager - can approve/reject campaigns and moderate content',
    [Role.ADMIN]: 'System administrator - full access to platform management',
  };
  return descriptions[role];
}

/**
 * Get role badge color (for UI)
 */
export function getRoleBadgeColor(role: Role): string {
  const colors: Record<Role, string> = {
    [Role.SUPPORTER]: 'blue',
    [Role.MODERATOR]: 'purple',
    [Role.ADMIN]: 'red',
  };
  return colors[role];
}

/**
 * Decode JWT token to get user info including role
 * Note: Install jwt-decode package: npm install jwt-decode
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    // Using dynamic import to avoid issues if jwt-decode is not installed
    const { jwtDecode } = require('jwt-decode');
    return jwtDecode(token) as JwtPayload;
  } catch (error) {
    console.error('Failed to decode token:', error);
    return null;
  }
}

/**
 * React hook example for using roles
 *
 * Usage:
 * const { userRole, hasRequiredRole, canPerform } = useUserRole();
 *
 * if (canPerform('CREATE_CAMPAIGN')) {
 *   return <CreateCampaignButton />;
 * }
 */
export interface UseUserRoleReturn {
  userRole: Role | null;
  hasRequiredRole: (requiredRoles: Role[]) => boolean;
  canPerform: (action: keyof typeof ROLE_ACTIONS) => boolean;
}

// Example implementation (uncomment if using React):
/*
import { useMemo } from 'react';

export function useUserRole(): UseUserRoleReturn {
  const token = localStorage.getItem('token');

  const userRole = useMemo(() => {
    if (!token) return null;
    const decoded = decodeToken(token);
    return decoded?.role || null;
  }, [token]);

  const hasRequiredRole = (requiredRoles: Role[]): boolean => {
    if (!userRole) return false;
    return hasRole(userRole, requiredRoles);
  };

  const canPerform = (action: keyof typeof ROLE_ACTIONS): boolean => {
    if (!userRole) return false;
    return canPerformAction(userRole, action);
  };

  return { userRole, hasRequiredRole, canPerform };
}
*/

