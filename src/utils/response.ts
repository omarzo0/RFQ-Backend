export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    current: number;
    pages: number;
    total: number;
    limit: number;
  };
  metadata?: Record<string, any>;
}

export const successResponse = <T>(
  res: any,
  data?: T,
  message?: string,
  statusCode: number = 200,
  pagination?: ApiResponse["pagination"],
  metadata?: Record<string, any>
): void => {
  const response: ApiResponse<T> = {
    success: true,
    ...(data !== undefined && { data }),
    ...(message && { message }),
    ...(pagination && { pagination }),
    ...(metadata && { metadata }),
  };

  res.status(statusCode).json(response);
};

export const errorResponse = (
  res: any,
  error: string | Error,
  statusCode: number = 500,
  details?: any
): void => {
  const message = error instanceof Error ? error.message : error;

  const response: ApiResponse = {
    success: false,
    error: message,
    ...(details && { details }),
  };

  res.status(statusCode).json(response);
};
