// API Response Types

export interface ApiSuccessResponse<T> {
  data: T;
  pagination?: PaginationInfo;
}

export interface ApiErrorResponse {
  error: {
    code: 'VALIDATION_ERROR' | 'AUTH_ERROR' | 'NOT_FOUND' | 'FORBIDDEN' | 'RATE_LIMITED' | 'SERVER_ERROR';
    message: string;
    details?: Record<string, unknown>;
  };
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// Helper to create error responses
export function createErrorResponse(
  code: ApiErrorResponse['error']['code'],
  message: string,
  status: number
): Response {
  return Response.json(
    { error: { code, message } } satisfies ApiErrorResponse,
    { status }
  );
}

// Helper to create success responses
export function createSuccessResponse<T>(data: T, pagination?: PaginationInfo): Response {
  const response: ApiSuccessResponse<T> = { data };
  if (pagination) {
    response.pagination = pagination;
  }
  return Response.json(response);
}
