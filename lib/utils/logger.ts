/**
 * Structured logging utility for API routes and services
 */

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogContext {
  [key: string]: unknown;
}

interface ErrorLogContext extends LogContext {
  error: Error | unknown;
  stack?: string;
  errorCode?: string;
  errorMessage?: string;
  requestMethod?: string;
  requestUrl?: string;
  requestBody?: unknown;
  requestParams?: Record<string, unknown>;
  userId?: string;
  timestamp: string;
}

/**
 * Formats error information for logging
 */
function formatError(error: unknown): {
  message: string;
  stack?: string;
  code?: string;
  details?: unknown;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      code: (error as any).code,
      details: (error as any).details,
    };
  }

  if (typeof error === "string") {
    return { message: error };
  }

  return {
    message: "Unknown error",
    details: error,
  };
}

/**
 * Logs an error with full context
 */
export function logError(
  message: string,
  error: unknown,
  context?: LogContext
): void {
  const errorInfo = formatError(error);
  const logContext: ErrorLogContext = {
    ...context,
    error,
    message,
    errorMessage: errorInfo.message,
    stack: errorInfo.stack,
    errorCode: errorInfo.code,
    timestamp: new Date().toISOString(),
  };

  // Log to console with structured format
  console.error(`[ERROR] ${message}`, {
    ...logContext,
    // Include error details separately for better visibility
    errorDetails: {
      message: errorInfo.message,
      code: errorInfo.code,
      stack: errorInfo.stack,
      details: errorInfo.details,
    },
  });

  // In production, you might want to send this to a logging service
  // e.g., Sentry, LogRocket, etc.
}

/**
 * Logs an info message
 */
export function logInfo(message: string, context?: LogContext): void {
  console.log(`[INFO] ${message}`, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Logs a warning message
 */
export function logWarn(message: string, context?: LogContext): void {
  console.warn(`[WARN] ${message}`, {
    ...context,
    timestamp: new Date().toISOString(),
  });
}

/**
 * Logs a debug message (only in development)
 */
export function logDebug(message: string, context?: LogContext): void {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[DEBUG] ${message}`, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Creates a logger context from a Next.js request
 */
export function createRequestContext(request: {
  method?: string;
  url?: string;
  body?: unknown;
  params?: Record<string, unknown>;
}): LogContext {
  return {
    requestMethod: request.method,
    requestUrl: request.url,
    requestBody: request.body,
    requestParams: request.params,
  };
}
