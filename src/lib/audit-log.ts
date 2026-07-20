import { NextRequest } from "next/server";
import { after } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  AuditLog,
  AuditAction,
  EntityType,
  CreateAuditLogParams,
  AuditLogFilters,
  AuditLogQueryResult,
} from "@/types/audit";
import { randomUUID } from "crypto";

/**
 * Create an audit log entry (async - non-blocking)
 */
export async function createAuditLog(
  params: CreateAuditLogParams
): Promise<AuditLog> {
  const {
    action,
    entityType,
    entityId,
    performedBy,
    performedByRole,
    oldValue,
    newValue,
    metadata,
    req,
  } = params;

  // Extract IP and user agent from request
  const ipAddress =
    req.headers.get("x-forwarded-for")?.split(",")[0] ||
    req.headers.get("x-real-ip") ||
    "unknown";
  const userAgent = req.headers.get("user-agent") || "unknown";

  const auditLog = await prisma.auditLog.create({
    data: {
      id: randomUUID(),
      action,
      entityType,
      entityId,
      performedBy,
      performedByRole,
      oldValue: oldValue ? JSON.stringify(oldValue) : null,
      newValue: newValue ? JSON.stringify(newValue) : null,
      metadata: metadata || null,
      ipAddress,
      userAgent,
    },
  });

  return auditLog as AuditLog;
}

/**
 * Create audit log asynchronously (fire and forget)
 */
export function createAuditLogAsync(params: CreateAuditLogParams): void {
  after(async () => {
    try {
      await createAuditLog(params);
    } catch (error) {
      console.error("Failed to create audit log:", error);
      // Don't throw - audit log failure shouldn't break the main operation
    }
  });
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(
  filters: AuditLogFilters
): Promise<AuditLogQueryResult> {
  const {
    entityType,
    entityId,
    action,
    performedBy,
    startDate,
    endDate,
    skip = 0,
    limit = 50,
  } = filters;

  const where: any = {};

  if (entityType) where.entityType = entityType;
  if (entityId) where.entityId = entityId;
  if (action) where.action = action;
  if (performedBy) where.performedBy = performedBy;

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs as AuditLog[],
    total,
    skip,
    limit,
  };
}

/**
 * Get audit logs for a specific user
 */
export async function getUserAuditLogs(
  userId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      OR: [{ performedBy: userId }, { entityId: userId, entityType: "user" }],
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return logs as AuditLog[];
}

/**
 * Get audit logs for a specific entity
 */
export async function getEntityAuditLogs(
  entityType: EntityType,
  entityId: string,
  limit: number = 50
): Promise<AuditLog[]> {
  const logs = await prisma.auditLog.findMany({
    where: {
      entityType,
      entityId,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
  return logs as AuditLog[];
}

/**
 * Delete audit logs older than 1 year (cleanup)
 */
export async function deleteOldAuditLogs(): Promise<number> {
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  const result = await prisma.auditLog.deleteMany({
    where: {
      createdAt: {
        lt: oneYearAgo,
      },
    },
  });

  return result.count;
}

/**
 * Helper to parse stored JSON values safely
 */
export function parseAuditValue(value: string | null): any {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}
