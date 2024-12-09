export interface JsonResponse<T> {
  status_code: number;
  timestamp: string;
  message: string;
  data?: T;
  error?: any;
}

export function successResponse<T>(
  data: T,
  message: string = 'Operation successful',
  statusCode: number = 200,
): JsonResponse<T> {
  return {
    status_code: statusCode,
    timestamp: new Date().toISOString(),
    message,
    data,
  };
}

export function errorResponse(
  error: any,
  message: string,
  statusCode: number = 500,
): JsonResponse<any> {
  return {
    status_code: statusCode,
    timestamp: new Date().toISOString(),
    message,
    error,
  };
}
