# Campaign Ownership System - Context-Specific Implementation

## Summary

Changed the campaign ownership model from a global `CREATOR` role to a context-specific ownership system where any authenticated user can create and manage their own campaigns.

## What Changed

### 1. Role System Simplification

**Before:**
- 4 global roles: SUPPORTER, CREATOR, MODERATOR, ADMIN
- CREATOR role was required to create/manage campaigns
- Campaign ownership was tied to a global role

**After:**
- 3 global roles: SUPPORTER, MODERATOR, ADMIN
- Campaign ownership is context-specific (via `creatorId` field)
- Any authenticated user can create campaigns and automatically becomes the owner

### 2. Backend Changes

#### Files Modified:

1. **`apps/backend/src/auth/enums/role.enum.ts`**
   - Removed `CREATOR` from the Role enum
   - Updated documentation to clarify ownership is campaign-specific

2. **`apps/backend/src/auth/enums/role-permissions.ts`**
   - Removed `CREATOR` role from permissions mapping
   - Added campaign creation permissions to `SUPPORTER` role
   - All users can now create and manage their own campaigns

3. **`apps/backend/src/campaigns/campaigns.resolver.ts`**
   - Removed `@Roles(Role.CREATOR)` decorators from all mutations/queries
   - Changed from role-based to ownership-based authorization
   - Anyone authenticated can now call campaign mutations
   - Ownership checks ensure users can only modify their own campaigns
   - Admins can still modify any campaign

### 3. Frontend Changes

#### Files Modified:

1. **`apps/frontend/src/lib/roles.ts`**
   - Removed `CREATOR` from Role enum
   - Updated `ROLE_ACTIONS` to allow all users to create campaigns
   - Updated helper functions to remove CREATOR references
   - Changed descriptions to reflect new ownership model

## Authorization Flow

### Creating a Campaign

**Before:**
```typescript
@Roles(Role.CREATOR, Role.ADMIN)
async createCampaign() { ... }
```

**After:**
```typescript
@UseGuards(JwtAuthGuard)  // Only needs to be authenticated
async createCampaign() { ... }
```

### Modifying a Campaign

**Before:**
- Required CREATOR or ADMIN role
- Then checked ownership

**After:**
- Only requires authentication
- Checks ownership: `isOwner = await campaignsService.isOwner(campaignId, userId)`
- Allows modification if owner OR admin

### Example Authorization Logic

```typescript
@Mutation(() => Campaign)
@UseGuards(JwtAuthGuard)  // Just needs to be logged in
async updateCampaign(
  @Args('updateCampaignInput') updateCampaignInput: UpdateCampaignInput,
  @GetCurrentUser() user: JwtPayload,
): Promise<Campaign> {
  // Context-specific ownership check
  const isOwner = await this.campaignsService.isOwner(
    updateCampaignInput.id, 
    user.userId
  );
  
  // Allow if owner OR admin
  if (!isOwner && user.role !== Role.ADMIN) {
    throw new ForbiddenException('You can only update your own campaigns');
  }
  
  return this.campaignsService.updateCampaign(
    updateCampaignInput.id, 
    updateCampaignInput
  );
}
```

## Campaign Approval Workflow

1. **Any user creates a campaign**
   - Campaign status: `DRAFT`
   - User is automatically the owner (via `creatorId`)

2. **Owner submits campaign for review**
   ```typescript
   @UseGuards(JwtAuthGuard)
   async submitCampaign(campaignId, user) {
     // Check ownership
     const isOwner = await isOwner(campaignId, user.userId);
     if (!isOwner) throw ForbiddenException();
     
     // Change status to SUBMITTED
     return submitCampaign(campaignId);
   }
   ```

3. **Moderator/Admin reviews**
   ```typescript
   @RequirePermissions(Permission.APPROVE_CAMPAIGN)
   async approveCampaign(campaignId) {
     // Only MODERATOR or ADMIN has this permission
     return approveCampaign(campaignId);
   }
   ```

4. **Campaign goes live**
   - Status: `APPROVED`
   - Owner can still manage their campaign
   - Contributors can donate

## Permissions Matrix

| Action | SUPPORTER | MODERATOR | ADMIN |
|--------|-----------|-----------|-------|
| View campaigns | ✅ | ✅ | ✅ |
| Create campaign | ✅ | ✅ | ✅ |
| Edit own campaign | ✅ | ✅ | ✅ |
| Delete own campaign | ✅ | ✅ | ✅ |
| Submit for review | ✅ (owner) | ✅ (owner) | ✅ |
| Approve campaign | ❌ | ✅ | ✅ |
| Reject campaign | ❌ | ✅ | ✅ |
| Edit any campaign | ❌ | ❌ | ✅ |
| Delete any campaign | ❌ | ❌ | ✅ |
| Contribute | ✅ | ✅ | ✅ |

## Database Schema

Campaign ownership is tracked via:

```typescript
@Entity()
export class Campaign {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  creatorId: string;  // ← Owner of the campaign

  @ManyToOne(() => User)
  creator: User;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT
  })
  status: CampaignStatus;
  
  // ... other fields
}
```

## Benefits

1. **Simplified Role System**
   - Fewer global roles to manage
   - Clearer separation of concerns

2. **Context-Specific Ownership**
   - Users own specific campaigns, not a global role
   - More granular permission control

3. **Better User Experience**
   - Any user can create campaigns
   - Natural workflow: create → own → manage

4. **Scalability**
   - Easy to add collaborative features (multiple owners, team members, etc.)
   - Ownership is at the campaign level, not user level

5. **Clearer Authorization**
   - Explicit ownership checks in code
   - Less magic, more transparency

## Migration Notes

### For Existing Users with CREATOR Role

- Users previously with CREATOR role should be changed to SUPPORTER
- They retain ownership of all campaigns they created (via `creatorId`)
- They can still manage their campaigns
- Database migration script:

```sql
UPDATE users 
SET role = 'SUPPORTER' 
WHERE role = 'CREATOR';
```

### For New Users

- All new users default to SUPPORTER role
- Can immediately create campaigns
- Become campaign owner automatically

## Testing

The demo page (`/`) now allows any authenticated user to:
- Create campaigns
- View their campaigns
- The campaign shows them as the creator

To test:
1. Login as any user
2. Go to Campaigns tab
3. Create a campaign
4. The campaign is created with you as the owner
5. Only you (or admins) can modify/delete it

## Conclusion

Campaign ownership is now properly context-specific rather than tied to a global role. This provides:
- More flexibility
- Better user experience
- Clearer authorization logic
- Easier to maintain and extend

