// Error Logger Utility for API debugging and monitoring
// Provides detailed logging of API requests, responses, and errors

interface LogEntry {
  timestamp: string;
  type: 'request' | 'response' | 'error';
  endpoint: string;
  method?: string;
  status?: number;
  duration?: number;
  payload?: any;
  response?: any;
  error?: any;
  headers?: Record<string, string>;
}

class ErrorLogger {
  private logs: LogEntry[] = [];
  private readonly maxLogs = 50; // Keep last 50 entries
  private isDev = import.meta.env.DEV;

  /**
   * Log an API request
   */
  logApiRequest(
    endpoint: string,
    method: string,
    payload?: any,
    headers?: Record<string, string>
  ): string {
    const requestId = this.generateRequestId();

    const sanitizedPayload = this.sanitizeData(payload);
    const sanitizedHeaders = this.sanitizeHeaders(headers);

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: 'request',
      endpoint,
      method,
      payload: sanitizedPayload,
      headers: sanitizedHeaders,
    };

    this.addLog(entry);

    if (this.isDev) {
      console.group(`🔵 API Request: ${method} ${endpoint}`);
      console.log('Timestamp:', entry.timestamp);
      console.log('Request ID:', requestId);
      if (sanitizedPayload) console.log('Payload:', sanitizedPayload);
      if (sanitizedHeaders) console.log('Headers:', sanitizedHeaders);
      console.groupEnd();
    }

    return requestId;
  }

  /**
   * Log an API response
   */
  logApiResponse(
    endpoint: string,
    status: number,
    response: any,
    duration: number,
    requestId?: string
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: 'response',
      endpoint,
      status,
      duration,
      response: this.sanitizeData(response),
    };

    this.addLog(entry);

    if (this.isDev) {
      const statusColor = status >= 200 && status < 300 ? '🟢' : status >= 400 ? '🔴' : '🟡';
      console.group(`${statusColor} API Response: ${status} ${endpoint}`);
      console.log('Timestamp:', entry.timestamp);
      if (requestId) console.log('Request ID:', requestId);
      console.log('Duration:', `${duration}ms`);
      console.log('Status:', status);
      console.log('Response:', entry.response);
      console.groupEnd();
    }
  }

  /**
   * Log an API error
   */
  logApiError(
    endpoint: string,
    error: any,
    context?: {
      method?: string;
      payload?: any;
      retryAttempt?: number;
    }
  ): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      type: 'error',
      endpoint,
      method: context?.method,
      error: this.sanitizeError(error),
      payload: context?.payload ? this.sanitizeData(context.payload) : undefined,
    };

    this.addLog(entry);

    if (this.isDev) {
      console.group(`🔴 API Error: ${endpoint}`);
      console.log('Timestamp:', entry.timestamp);
      if (context?.method) console.log('Method:', context.method);
      if (context?.retryAttempt) console.log('Retry Attempt:', context.retryAttempt);
      console.error('Error:', error);
      if (context?.payload) console.log('Request Payload:', this.sanitizeData(context.payload));
      console.groupEnd();
    }
  }

  /**
   * Log a retry attempt
   */
  logRetryAttempt(endpoint: string, attempt: number, delay: number): void {
    if (this.isDev) {
      console.log(`🔄 Retry Attempt ${attempt} for ${endpoint} in ${delay}ms`);
    }
  }

  /**
   * Get all logs
   */
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  /**
   * Get logs for a specific endpoint
   */
  getLogsForEndpoint(endpoint: string): LogEntry[] {
    return this.logs.filter(log => log.endpoint === endpoint);
  }

  /**
   * Get error logs only
   */
  getErrorLogs(): LogEntry[] {
    return this.logs.filter(log => log.type === 'error');
  }

  /**
   * Export logs as JSON (for debugging/support)
   */
  exportLogs(): void {
    const logsJson = JSON.stringify(this.logs, null, 2);
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `api-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('✅ API logs exported successfully');
  }

  /**
   * Clear all logs
   */
  clearLogs(): void {
    this.logs = [];
    console.log('🗑️ API logs cleared');
  }

  /**
   * Add a log entry
   */
  private addLog(entry: LogEntry): void {
    this.logs.push(entry);

    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
  }

  /**
   * Sanitize sensitive data from payloads
   */
  private sanitizeData(data: any): any {
    if (!data) return data;

    // Clone the data to avoid modifying the original
    const cloned = JSON.parse(JSON.stringify(data));

    // List of sensitive keys to redact
    const sensitiveKeys = ['password', 'token', 'authorization', 'api_key', 'apiKey', 'secret'];

    const sanitize = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;

      for (const key in obj) {
        if (sensitiveKeys.some(sensitive => key.toLowerCase().includes(sensitive))) {
          obj[key] = '[REDACTED]';
        } else if (typeof obj[key] === 'object') {
          sanitize(obj[key]);
        }
      }
      return obj;
    };

    return sanitize(cloned);
  }

  /**
   * Sanitize headers (remove authorization)
   */
  private sanitizeHeaders(headers?: Record<string, string>): Record<string, string> | undefined {
    if (!headers) return undefined;

    const sanitized = { ...headers };
    if (sanitized['Authorization']) {
      sanitized['Authorization'] = '[REDACTED]';
    }
    if (sanitized['authorization']) {
      sanitized['authorization'] = '[REDACTED]';
    }
    return sanitized;
  }

  /**
   * Sanitize error objects
   */
  private sanitizeError(error: any): any {
    if (error instanceof Error) {
      return {
        name: error.name,
        message: error.message,
        stack: this.isDev ? error.stack : undefined,
        ...(error as any), // Include additional properties (like status, errors)
      };
    }
    return error;
  }

  /**
   * Generate a unique request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const errorLogger = new ErrorLogger();

// Export types
export type { LogEntry };
