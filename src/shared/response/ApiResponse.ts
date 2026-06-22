export class ApiResponse {
  static success<T>(data: T, message: string = 'Success', requestId?: string) {
    return {
      success: true,
      message,
      data,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    };
  }

  static error(error: any, message: string = 'Failure', requestId?: string) {
    return {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString(),
      ...(requestId && { requestId }),
    };
  }
}
