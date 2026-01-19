// Retry Strategy Utility
// Smart retry logic for different error types

import { ApiRequestError } from '@/services/api';

/**
 * Determine if an error should be retried
 */
export function shouldRetry(error: ApiRequestError | Error): boolean {
  if (!(error instanceof ApiRequestError)) {
    // Network errors and other generic errors should be retried
    return true;
  }

  const status = error.status;

  // Don't retry client errors (4xx) except for specific cases
  if (status >= 400 && status < 500) {
    // Retry for timeout (408) and rate limit (429)
    return status === 408 || status === 429;
  }

  // Retry all server errors (5xx)
  if (status >= 500 && status < 600) {
    return true;
  }

  // Retry network errors (status 0)
  if (status === 0) {
    return true;
  }

  return false;
}

/**
 * Get retry delay for a given attempt and error type
 * Uses exponential backoff with jitter
 */
export function getRetryDelay(attempt: number, error: ApiRequestError | Error): number {
  // Base delay in milliseconds
  let baseDelay = 1000;

  if (error instanceof ApiRequestError) {
    const status = error.status;

    // Rate limit errors should wait longer
    if (status === 429) {
      baseDelay = 5000;
    }

    // Server errors can use standard backoff
    if (status >= 500) {
      baseDelay = 2000;
    }

    // Timeout errors
    if (status === 408) {
      baseDelay = 3000;
    }
  }

  // Exponential backoff: delay = baseDelay * (2 ^ attempt)
  const exponentialDelay = baseDelay * Math.pow(2, attempt);

  // Add jitter (randomness) to prevent thundering herd
  // Jitter is between 0% and 25% of the delay
  const jitter = Math.random() * 0.25 * exponentialDelay;

  const totalDelay = exponentialDelay + jitter;

  // Cap maximum delay at 30 seconds
  return Math.min(totalDelay, 30000);
}

/**
 * Get maximum number of retries for a given error type
 */
export function getMaxRetries(error: ApiRequestError | Error): number {
  if (!(error instanceof ApiRequestError)) {
    // Generic errors: 3 retries
    return 3;
  }

  const status = error.status;

  // Rate limit: fewer retries since we wait longer
  if (status === 429) {
    return 2;
  }

  // Server errors: more retries
  if (status >= 500) {
    return 3;
  }

  // Timeout: moderate retries
  if (status === 408) {
    return 3;
  }

  // Network errors
  if (status === 0) {
    return 3;
  }

  // Don't retry other errors
  return 0;
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithStrategy<T>(
  fn: () => Promise<T>,
  context?: string
): Promise<T> {
  let lastError: Error | null = null;
  let attempt = 0;

  while (true) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if we should retry
      if (!shouldRetry(lastError as any)) {
        throw lastError;
      }

      // Check if we've exceeded max retries
      const maxRetries = getMaxRetries(lastError as any);
      if (attempt >= maxRetries) {
        throw lastError;
      }

      // Calculate delay
      const delay = getRetryDelay(attempt, lastError as any);

      // Log retry attempt
      if (import.meta.env.DEV) {
        console.log(
          `🔄 Retry attempt ${attempt + 1}/${maxRetries} for ${context || 'operation'} in ${delay}ms`,
          lastError
        );
      }

      // Wait before retrying
      await sleep(delay);

      attempt++;
    }
  }
}

/**
 * Sleep for a given duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Get user-friendly message for retry status
 */
export function getRetryStatusMessage(attempt: number, maxRetries: number, delay: number): string {
  const remainingRetries = maxRetries - attempt;
  const seconds = Math.ceil(delay / 1000);

  if (remainingRetries === 0) {
    return 'Maximum retry attempts reached';
  }

  return `Retrying in ${seconds} second${seconds !== 1 ? 's' : ''}... (${remainingRetries} attempt${remainingRetries !== 1 ? 's' : ''} remaining)`;
}

/**
 * Create a retry-enabled version of a function
 */
export function withRetry<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: string
): T {
  return (async (...args: any[]) => {
    return retryWithStrategy(() => fn(...args), context);
  }) as T;
}
