import { NextRequest } from "next/server";

// API Response Type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T | null;
  error: ApiError | null;
  meta?: ApiMeta;
}

// API Error Structure
export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
}

// API Metadata
export interface ApiMeta {
  timestamp: string;
  requestId?: string;
  auditLogId?: string;
  pagination?: PaginationMeta;
}

// Pagination Metadata
export interface PaginationMeta {
  total: number;
  skip: number;
  limit: number;
  hasMore?: boolean;
}

// Error Codes
export type ErrorCode = 
  | 'insufficient_permissions'
  | 'account_inactive'
  | 'account_banned'
  | 'account_deleted'
  | 'invalid_role_assignment'
  | 'invalid_status_transition'
  | 'session_expired'
  | 'unauthorized'
  | 'not_found'
  | 'validation_error'
  | 'forbidden'
  | 'internal_error'
  | 'missing_parameter'
  | 'invalid_parameter';

// Error Code Messages
export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  insufficient_permissions: 'You do not have sufficient permissions to perform this action',
  account_inactive: 'Your account is inactive. Please contact support.',
  account_banned: 'Your account has been banned. Please contact support.',
  account_deleted: 'Your account has been deleted.',
  invalid_role_assignment: 'Cannot assign the specified role',
  invalid_status_transition: 'Invalid status transition',
  session_expired: 'Your session has expired. Please sign in again.',
  unauthorized: 'Authentication required',
  not_found: 'Resource not found',
  validation_error: 'Validation error',
  forbidden: 'Access forbidden',
  internal_error: 'Internal server error',
  missing_parameter: 'Missing required parameter',
  invalid_parameter: 'Invalid parameter value',
};
