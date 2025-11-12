    # RBAC (Role-Based Access Control) Implementation

This document describes the RBAC system implemented in the backend.

## Overview

The system implements a clean, flexible RBAC architecture with 4 roles and granular permissions. The implementation is designed to be easy to use throughout both backend and frontend.

## Roles

### 1. **SUPPORTER** (Default)
**Description:** Contributor/investor

**Permissions:**
- View public campaigns
- Read comments
- Write comments
- Contribute to campaigns
- Manage own notifications

**Restrictions:**
- Cannot edit or approve campaigns

### 2. **CREATOR**
**Description:** Campaign owner

**Permissions:**
- View public campaigns
- Create campaigns
- Update/delete own campaigns
- Submit campaigns for review
- Read and write comments
- Manage own notifications

**Restrictions:**
- Cannot approve or edit others' campaigns

### 3. **MODERATOR**
**Description:** Content manager

**Permissions:**
- View all campaigns
- Approve or reject campaigns
- Provide feedback on campaigns
- Read, write, and moderate comments
- Manage users and roles
- Manage platform settings

**Restrictions:**
- Cannot create or contribute to campaigns

### 4. **ADMIN**
**Description:** System administrator

**Permissions:**
- Full access to all platform features
- Manage users and roles
- Override moderation decisions
- Access all data (read-only if needed)
- Manage platform settings

**Note:** Admins typically don't use regular campaign functions

## Architecture

### Core Files

```
apps/backend/src/auth/
├── enums/
│   ├── role.enum.ts              # Role definitions
│   ├── permission.enum.ts        # Permission definitions
│   ├── role-permissions.ts       # Role-to-permission mapping
│   └── index.ts                  # Exports
├── decorators/
│   ├── roles.decorator.ts        # @Roles() decorator
│   ├── permissions.decorator.ts  # @RequirePermissions() decorator
│   └── get-current-user.decorator.ts
├── guards/
│   ├── jwt-auth.guard.ts         # JWT authentication
│   └── roles.guard.ts            # RBAC authorization
└── auth.service.ts               # JWT includes role
```

## Usage

### 1. Protecting Routes with Roles

```typescript
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../auth/enums';

@Mutation(() => Campaign)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CREATOR, Role.ADMIN)
async createCampaign(
  @Args('input') input: CreateCampaignInput,
  @GetCurrentUser() user: any,
): Promise<Campaign> {
  return this.campaignsService.createCampaign(input, user.userId);
}
```

### 2. Protecting Routes with Permissions

```typescript
import { RequirePermissions } from '../auth/decorators/permissions.decorator';
import { Permission } from '../auth/enums';

@Mutation(() => Campaign)
@UseGuards(JwtAuthGuard, RolesGuard)
@RequirePermissions(Permission.APPROVE_CAMPAIGN)
async approveCampaign(
  @Args('campaignId') campaignId: string,
): Promise<Campaign> {
  return this.campaignsService.approveCampaign(campaignId);
}
```

### 3. Checking Ownership

For operations that require the user to own a resource:

```typescript
@Mutation(() => Campaign)
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.CREATOR, Role.ADMIN)
async updateCampaign(
  @Args('input') input: UpdateCampaignInput,
  @GetCurrentUser() user: any,
): Promise<Campaign> {
  const isOwner = await this.campaignsService.isOwner(input.id, user.userId);
  if (!isOwner && user.role !== Role.ADMIN) {
    throw new ForbiddenException('You can only update your own campaigns');
  }
  return this.campaignsService.updateCampaign(input.id, input);
}
```

### 4. Getting Current User with Role

```typescript
import { GetCurrentUser } from '../auth/decorators/get-current-user.decorator';
import type { JwtPayload } from '../auth/auth.service';

@Query(() => User)
@UseGuards(JwtAuthGuard)
async me(@GetCurrentUser() currentUser: JwtPayload): Promise<User> {
  // currentUser.role contains the user's role
  // currentUser.userId contains the user's ID
  return this.userService.findById(currentUser.userId);
}
```

## Permission Matrix

| Permission | SUPPORTER | CREATOR | MODERATOR | ADMIN |
|------------|-----------|---------|-----------|-------|
| VIEW_CAMPAIGNS | ✅ | ✅ | ✅ | ✅ |
| CREATE_CAMPAIGN | ❌ | ✅ | ❌ | ✅ |
| UPDATE_OWN_CAMPAIGN | ❌ | ✅ | ❌ | ✅ |
| DELETE_OWN_CAMPAIGN | ❌ | ✅ | ❌ | ✅ |
| UPDATE_ANY_CAMPAIGN | ❌ | ❌ | ❌ | ✅ |
| DELETE_ANY_CAMPAIGN | ❌ | ❌ | ❌ | ✅ |
| APPROVE_CAMPAIGN | ❌ | ❌ | ✅ | ✅ |
| REJECT_CAMPAIGN | ❌ | ❌ | ✅ | ✅ |
| CONTRIBUTE_TO_CAMPAIGN | ✅ | ❌ | ❌ | ✅ |
| READ_COMMENTS | ✅ | ✅ | ✅ | ✅ |
| WRITE_COMMENT | ✅ | ✅ | ✅ | ✅ |
| MODERATE_COMMENTS | ❌ | ❌ | ✅ | ✅ |
| MANAGE_USERS | ❌ | ❌ | ✅ | ✅ |
| MANAGE_ROLES | ❌ | ❌ | ✅ | ✅ |
| MANAGE_PLATFORM_SETTINGS | ❌ | ❌ | ✅ | ✅ |
| MANAGE_NOTIFICATIONS | ✅ | ✅ | ❌ | ✅ |

## API Examples

### User Creation with Role

```graphql
mutation CreateUser {
  createUser(
    email: "user@example.com"
    name: "John Doe"
    password: "securePassword123"
    role: CREATOR  # Optional, defaults to SUPPORTER
  ) {
    id
    email
    name
    role
  }
}
```

### Login (Returns JWT with Role)

```graphql
mutation Login {
  login(
    email: "user@example.com"
    password: "securePassword123"
  )
}
```

The returned JWT token includes the user's role in the payload.

### Update User Role (Admin/Moderator only)

```graphql
mutation UpdateUserRole {
  updateUserRole(
    userId: "user-uuid"
    role: CREATOR
  ) {
    id
    email
    name
    role
  }
}
```

### Get All Users (Admin/Moderator only)

```graphql
query GetAllUsers {
  getAllUsers {
    id
    email
    name
    role
  }
}
```

## Frontend Integration

### 1. Decode JWT to Get User Role

```typescript
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  userId: string;
  sid: string;
  role: 'SUPPORTER' | 'CREATOR' | 'MODERATOR' | 'ADMIN';
  iat: number;
  exp: number;
}

const token = localStorage.getItem('token');
const decoded = jwtDecode<JwtPayload>(token);
const userRole = decoded.role;
```

### 2. Conditionally Render UI Based on Role

```typescript
// React example
const canCreateCampaign = ['CREATOR', 'ADMIN'].includes(userRole);
const canApproveCampaign = ['MODERATOR', 'ADMIN'].includes(userRole);

return (
  <>
    {canCreateCampaign && (
      <button onClick={handleCreateCampaign}>Create Campaign</button>
    )}
    {canApproveCampaign && (
      <button onClick={handleApproveCampaign}>Approve</button>
    )}
  </>
);
```

### 3. Export Role Enum for Frontend

Create a shared types file:

```typescript
// apps/frontend/src/types/roles.ts
export enum Role {
  SUPPORTER = 'SUPPORTER',
  CREATOR = 'CREATOR',
  MODERATOR = 'MODERATOR',
  ADMIN = 'ADMIN',
}

export const ROLE_PERMISSIONS = {
  [Role.SUPPORTER]: ['VIEW_CAMPAIGNS', 'CONTRIBUTE', 'COMMENT'],
  [Role.CREATOR]: ['VIEW_CAMPAIGNS', 'CREATE_CAMPAIGN', 'MANAGE_OWN'],
  [Role.MODERATOR]: ['APPROVE', 'MODERATE', 'MANAGE_USERS'],
  [Role.ADMIN]: ['ALL'],
};

export function canPerformAction(
  userRole: Role,
  requiredRoles: Role[]
): boolean {
  return requiredRoles.includes(userRole);
}
```

## Database Migration

After implementing RBAC, you need to update the database schema:

```sql
-- Add role column to users table
ALTER TABLE "user" 
ADD COLUMN "role" character varying NOT NULL DEFAULT 'SUPPORTER';

-- Add check constraint
ALTER TABLE "user"
ADD CONSTRAINT "CHK_role" 
CHECK (role IN ('SUPPORTER', 'CREATOR', 'MODERATOR', 'ADMIN'));
```

Or let TypeORM handle it with synchronization (development only):
```typescript
// In your database configuration
synchronize: true, // Only for development!
```

## Testing

### 1. Test Role Assignment

```typescript
describe('User Roles', () => {
  it('should default to SUPPORTER role', async () => {
    const user = await usersService.create({
      email: 'test@example.com',
      name: 'Test User',
      password: 'password123',
    });
    expect(user.role).toBe(Role.SUPPORTER);
  });

  it('should create user with specific role', async () => {
    const user = await usersService.create({
      email: 'creator@example.com',
      name: 'Creator User',
      password: 'password123',
      role: Role.CREATOR,
    });
    expect(user.role).toBe(Role.CREATOR);
  });
});
```

### 2. Test Authorization

```typescript
describe('Campaign Authorization', () => {
  it('should allow CREATOR to create campaign', async () => {
    const token = await login('creator@example.com', 'password');
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'mutation { createCampaign(...) { id } }'
      });
    expect(response.status).toBe(200);
  });

  it('should deny SUPPORTER from creating campaign', async () => {
    const token = await login('supporter@example.com', 'password');
    const response = await request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${token}`)
      .send({
        query: 'mutation { createCampaign(...) { id } }'
      });
    expect(response.body.errors[0].message).toContain('Forbidden');
  });
});
```

## Adding New Permissions

To add a new permission:

1. Add to `permission.enum.ts`:
```typescript
export enum Permission {
  // ...existing permissions...
  NEW_PERMISSION = 'NEW_PERMISSION',
}
```

2. Update `role-permissions.ts`:
```typescript
export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [Role.ADMIN]: [
    // ...existing permissions...
    Permission.NEW_PERMISSION,
  ],
  // ...other roles...
};
```

3. Use in your resolver/controller:
```typescript
@RequirePermissions(Permission.NEW_PERMISSION)
async newProtectedEndpoint() {
  // ...
}
```

## Security Best Practices

1. **Always use both guards together:**
   ```typescript
   @UseGuards(JwtAuthGuard, RolesGuard)
   ```

2. **Check ownership for resource-specific operations:**
   - Verify the user owns the resource before allowing updates/deletes
   - Admins can override ownership checks

3. **Validate on both frontend and backend:**
   - Frontend: For UX (hide/disable buttons)
   - Backend: For security (enforce access control)

4. **Use permissions for fine-grained control:**
   - Roles for broad categorization
   - Permissions for specific actions

5. **Audit role changes:**
   - Log when roles are updated
   - Track who made the change

## Troubleshooting

### "User role not found" error
- Ensure JWT token includes role in payload
- Check that user record has role field populated

### Permission denied despite having role
- Verify role-permissions mapping
- Check that both JwtAuthGuard and RolesGuard are applied
- Ensure guards are in correct order

### Role not appearing in JWT
- Confirm auth.service.generateToken includes role parameter
- Verify user login process passes role to token generation

## Summary

This RBAC implementation provides:
- ✅ Clean separation of concerns
- ✅ Easy to extend with new roles/permissions
- ✅ Type-safe with TypeScript
- ✅ Works with GraphQL and REST
- ✅ Frontend-friendly (role in JWT)
- ✅ Minimal boilerplate required

