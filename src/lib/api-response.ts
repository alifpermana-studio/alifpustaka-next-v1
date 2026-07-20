import {
  ApiResponse,
  ApiError,
  ApiMeta,
  ErrorCode,
  ERROR_MESSAGES,
} from "@/types/api";
import { randomUUID } from "crypto";

/**
 * Create a success API response
 */
export function successResponse<T>(
  message: string,
  data: T,
  meta?: Partial<ApiMeta>
): ApiResponse<T> {
  return {
    success: true,
    message,
    data,
    error: null,
    meta: {
      timestamp: new Date().toISOString(),
      ...meta,
    },
  };
}

/**
 * Create an error API response
 */
export function errorResponse(
  code: ErrorCode,
  message?: string,
  details?: any
): ApiResponse<null> {
  const errorMessage = message || ERROR_MESSAGES[code];

  return {
    success: false,
    message: errorMessage,
    data: null,
    error: {
      code,
      message: errorMessage,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return `req_${randomUUID()}`;
}

/**
 * Create pagination metadata
 */
export function createPaginationMeta(
  total: number,
  skip: number,
  limit: number
): ApiMeta {
  return {
    timestamp: new Date().toISOString(),
    pagination: {
      total,
      skip,
      limit,
      hasMore: skip + limit < total,
    },
  };
}
