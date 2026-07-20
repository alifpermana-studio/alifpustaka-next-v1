-- Migration: Create audit_log table
-- Description: Create audit log table for tracking all system changes
-- Date: 2026-07-20

-- Create audit_log table
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "performedBy" TEXT NOT NULL,
    "performedByRole" TEXT NOT NULL,
    "oldValue" TEXT,
    "newValue" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for efficient querying
CREATE INDEX "audit_log_entityType_entityId_idx" ON "audit_log"("entityType", "entityId");
CREATE INDEX "audit_log_performedBy_idx" ON "audit_log"("performedBy");
CREATE INDEX "audit_log_action_idx" ON "audit_log"("action");
CREATE INDEX "audit_log_createdAt_idx" ON "audit_log"("createdAt");

-- Add comment to document retention policy
COMMENT ON TABLE "audit_log" IS 'Audit logs with 1-year retention policy. Logs older than 1 year should be deleted.';
