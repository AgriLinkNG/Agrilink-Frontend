// Core API configuration with security best practices
import { getAuthToken, removeAuthToken } from './auth/tokenStorage';
import { errorLogger } from '../lib/errorLogger';

// Get API base URL with proper fallback
const getApiBaseUrl = (): string => {
  const envUrl = import.meta.env.VITE_API_URL;
  const fallbackUrl = 'https://team-delta-defenders-backend-1.onrender.com/api';

  // If environment variable is undefined or empty string, use fallback
  if (!envUrl || envUrl === 'undefined' || envUrl.trim() === '') {
    console.warn('VITE_API_URL is not set, using fallback:', fallbackUrl);
    return fallbackUrl;
  }

  return envUrl;
};

// API Configuration
export const API_CONFIG = {
  BASE_URL: getApiBaseUrl(),
  TIMEOUT: parseInt(import.meta.env.VITE_API_TIMEOUT || '45000'), // 45 seconds for Render.com
  MAX_RETRIES: parseInt(import.meta.env.VITE_API_RETRIES || '3'),
} as const;

// Log configuration on load (only in development)
if (import.meta.env.DEV) {
  console.log('API Configuration:', {
    BASE_URL: API_CONFIG.BASE_URL,
    VITE_API_URL: import.meta.env.VITE_API_URL,
  });
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
  meta?: {
    pagination?: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  };
}

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

// Custom error class for API errors
export class ApiRequestError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(message: string, status: number, errors?: Record<string, string[]>) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.errors = errors;
  }
}

// Rate limiting tracker
class RateLimitTracker {
  private requests: Map<string, number[]> = new Map();
  private readonly maxRequests = parseInt(import.meta.env.VITE_API_RATE_LIMIT || '100'); // requests per minute
  private readonly timeWindow = parseInt(import.meta.env.VITE_API_RATE_WINDOW || '60000'); // 1 minute

  canMakeRequest(endpoint: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];

    // Remove old requests outside time window
    const recentRequests = requests.filter(time => now - time < this.timeWindow);
    this.requests.set(endpoint, recentRequests);

    return recentRequests.length < this.maxRequests;
  }

  recordRequest(endpoint: string): void {
    const now = Date.now();
    const requests = this.requests.get(endpoint) || [];
    requests.push(now);
    this.requests.set(endpoint, requests);
  }
}

const rateLimiter = new RateLimitTracker();

// Request interceptor for adding auth headers and security
const createHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'X-Requested-With': 'XMLHttpRequest', // CSRF protection
  };

  // Add auth token if available
  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add CSRF token if available (for additional security)
  const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
  if (csrfToken) {
    headers['X-CSRF-Token'] = csrfToken;
  }

  return headers;
};

// Secure API request handler with retry logic
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  retryCount = 0
): Promise<ApiResponse<T>> {
  // Rate limiting check
  if (!rateLimiter.canMakeRequest(endpoint)) {
    throw new ApiRequestError('Rate limit exceeded. Please try again later.', 429);
  }

  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  const startTime = Date.now();

  // Log the request
  const method = options.method || 'GET';
  let requestPayload: any = undefined;

  // Handle different body types
  if (options.body) {
    if (options.body instanceof FormData) {
      // For FormData, log a summary instead of the actual data
      requestPayload = { type: 'FormData', note: 'File upload - contents not logged' };
    } else if (typeof options.body === 'string') {
      try {
        requestPayload = JSON.parse(options.body);
      } catch {
        requestPayload = options.body;
      }
    } else {
      requestPayload = options.body;
    }
  }

  const requestId = errorLogger.logApiRequest(
    endpoint,
    method,
    requestPayload,
    options.headers as Record<string, string>
  );

  try {
    // Record the request
    rateLimiter.recordRequest(endpoint);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    // For FormData, we need to let the browser set Content-Type with boundary
    const isFormData = options.body instanceof FormData;
    const baseHeaders = isFormData
      ? {
          'X-Requested-With': 'XMLHttpRequest',
          // Don't set Accept or Content-Type for FormData - let browser handle it
        }
      : createHeaders();

    const response = await fetch(url, {
      ...options,
      headers: {
        ...baseHeaders,
        ...options.headers,
      },
      signal: controller.signal,
      // Security settings
      credentials: 'include', // Include cookies for CSRF protection
      mode: 'cors',
      cache: 'no-store', // Prevent caching sensitive data
    });

    clearTimeout(timeoutId);
    const duration = Date.now() - startTime;

    // Handle different response statuses
    if (response.status === 401) {
      // Unauthorized - clear auth data and redirect to login
      removeAuthToken();
      window.location.href = '/login';
      throw new ApiRequestError('Authentication required', 401);
    }

    if (response.status === 403) {
      throw new ApiRequestError('Access forbidden', 403);
    }

    if (response.status === 429) {
      // Rate limited by server
      throw new ApiRequestError('Too many requests. Please try again later.', 429);
    }

    // Parse response
    let data: ApiResponse<T>;
    const contentType = response.headers.get('content-type');

    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Handle non-JSON responses
      const text = await response.text();
      data = {
        success: response.ok,
        message: text || response.statusText,
      };
    }

    if (!response.ok) {
      const error = new ApiRequestError(
        data.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        data.errors
      );

      // Log error response
      errorLogger.logApiError(endpoint, error, {
        method,
        payload: requestPayload,
        retryAttempt: retryCount,
      });

      throw error;
    }

    // Log successful response
    errorLogger.logApiResponse(endpoint, response.status, data, duration, requestId);

    return data;

  } catch (error) {
    // Handle network errors and timeouts
    if (error instanceof ApiRequestError) {
      throw error;
    }

    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        const timeoutError = new ApiRequestError('Request timeout', 408);
        errorLogger.logApiError(endpoint, timeoutError, {
          method,
          payload: requestPayload,
          retryAttempt: retryCount,
        });
        throw timeoutError;
      }

      // Retry logic for network errors
      if (retryCount < API_CONFIG.MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
        errorLogger.logRetryAttempt(endpoint, retryCount + 1, delay);
        await new Promise(resolve => setTimeout(resolve, delay));
        return makeRequest<T>(endpoint, options, retryCount + 1);
      }

      const networkError = new ApiRequestError(`Network error: ${error.message}`, 0);
      errorLogger.logApiError(endpoint, networkError, {
        method,
        payload: requestPayload,
        retryAttempt: retryCount,
      });
      throw networkError;
    }

    const unknownError = new ApiRequestError('Unknown error occurred', 0);
    errorLogger.logApiError(endpoint, unknownError, {
      method,
      payload: requestPayload,
      retryAttempt: retryCount,
    });
    throw unknownError;
  }
}

// HTTP Methods with security
export const api = {
  get: <T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
    let finalEndpoint = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.keys(params).forEach(key => {
        if (params[key] !== undefined && params[key] !== null) {
          searchParams.append(key, String(params[key]));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        finalEndpoint += `?${queryString}`;
      }
    }
    return makeRequest<T>(finalEndpoint, { method: 'GET' });
  },

  post: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  put: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  patch: <T>(endpoint: string, data?: any): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  delete: <T>(endpoint: string): Promise<ApiResponse<T>> => {
    return makeRequest<T>(endpoint, { method: 'DELETE' });
  },

  // File upload with security
  upload: <T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> => {
    // Add auth token if available
    // Note: makeRequest will detect FormData and skip setting Content-Type/Accept headers
    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return makeRequest<T>(endpoint, {
      method: 'POST',
      body: formData,
      headers,
    });
  },
};

export default api;