import { NextRequest } from "next/server";

// Audit Log Interface
export interface AuditLog {
  id: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  performedBy: string;
  performedByRole: string;
  oldValue?: string;
  newValue?: string;
  metadata?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

// Audit Actions
export type AuditAction =
  | 'user_role_change'
  | 'user_status_change'
  | 'user_created'
  | 'user_deleted'
  | 'post_created'
  | 'post_submitted'
  | 'post_published'
  | 'post_drafted'
  | 'post_deleted'
  | 'gallery_uploaded'
  | 'gallery_visibility_changed'
  | 'gallery_deleted';

// Entity Types
export type EntityType = 'user' | 'post' | 'gallery';

// Create Audit Log Parameters
export interface CreateAuditLogParams {
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  performedBy: string;
  performedByRole: string;
  oldValue?: any;
  newValue?: any;
  metadata?: any;
  req: NextRequest;
}

// Audit Log Filters
export interface AuditLogFilters {
  entityType?: EntityType;
  entityId?: string;
  action?: AuditAction;
  performedBy?: string;
  startDate?: Date;
  endDate?: Date;
  skip?: number;
  limit?: number;
}

// Audit Log Query Result
export interface AuditLogQueryResult {
  logs: AuditLog[];
  total: number;
  skip: number;
  limit: number;
}
