export interface ApiErrorBody {
  error: {
    message: string;
    statusCode: number;
  };
}

export function apiError(statusCode: number, message: string): ApiErrorBody {
  return {
    error: {
      message,
      statusCode,
    },
  };
}
