export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T | null;
}

export function successResponse<T = unknown>(
  message: string,
  data?: T,
): ApiResponse<T> {
  return {
    success: true,
    message,
    data: data ?? null,
  };
}

export function isApiResponse(value: unknown): value is ApiResponse {
  if (!value || typeof value !== 'object') return false;
  const body = value as Partial<ApiResponse>;
  return (
    typeof body.success === 'boolean' &&
    typeof body.message === 'string' &&
    'data' in body
  );
}
