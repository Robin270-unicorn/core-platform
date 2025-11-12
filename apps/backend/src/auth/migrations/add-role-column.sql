-- Database Migration for RBAC Implementation
-- This adds the role column to the user table

-- Add role column with default value
ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "role" character varying NOT NULL DEFAULT 'SUPPORTER';

-- Add check constraint to ensure only valid roles
ALTER TABLE "user"
DROP CONSTRAINT IF EXISTS "CHK_user_role";

ALTER TABLE "user"
ADD CONSTRAINT "CHK_user_role"
CHECK (role IN ('SUPPORTER', 'CREATOR', 'MODERATOR', 'ADMIN'));

-- Optional: Create index for faster role-based queries
CREATE INDEX IF NOT EXISTS "IDX_user_role" ON "user"("role");

-- Optional: Update existing users to have specific roles
-- Uncomment and modify as needed:

-- UPDATE "user" SET "role" = 'CREATOR' WHERE email = 'specific-creator@example.com';
-- UPDATE "user" SET "role" = 'MODERATOR' WHERE email = 'moderator@example.com';
-- UPDATE "user" SET "role" = 'ADMIN' WHERE email = 'admin@example.com';

