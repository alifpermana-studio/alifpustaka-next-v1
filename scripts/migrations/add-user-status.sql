-- Migration: Add status column to user table
-- Description: Add user status field with default value 'active'
-- Date: 2026-07-20

-- Add status column with default value
ALTER TABLE "user" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';

-- Set all existing users to active status
UPDATE "user" SET "status" = 'active' WHERE "status" IS NULL;

-- Add comment to document valid values
COMMENT ON COLUMN "user"."status" IS 'Valid values: active, inactive, banned, deleted';
