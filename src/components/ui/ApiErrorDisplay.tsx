import React from 'react';
import { ApiRequestError } from '@/services/api';

interface ApiErrorDisplayProps {
  error: ApiRequestError | Error | null;
  context: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
}

const ApiErrorDisplay: React.FC<ApiErrorDisplayProps> = ({
  error,
  context,
  onRetry,
  onDismiss,
  showDetails = import.meta.env.DEV,
}) => {
  if (!error) return null;

  const isApiError = error instanceof ApiRequestError;
  const status = isApiError ? error.status : 0;
  const message = error.message;
  const errors = isApiError ? error.errors : undefined;

  // Determine error severity and styling
  const getErrorSeverity = (status: number) => {
    if (status === 0) return 'network'; // Network or unknown error
    if (status >= 500) return 'server'; // Server error
    if (status === 429) return 'rate-limit'; // Rate limit
    if (status === 408) return 'timeout'; // Timeout
    if (status === 401 || status === 403) return 'auth'; // Authentication/Authorization
    if (status >= 400) return 'client'; // Client error (validation, etc.)
    return 'unknown';
  };

  const severity = getErrorSeverity(status);

  // Get user-friendly error explanation
  const getErrorExplanation = (status: number, severity: string): string => {
    switch (severity) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection.';
      case 'server':
        return 'The server encountered an error. This is not your fault. Please try again in a few moments.';
      case 'rate-limit':
        return 'Too many requests. Please wait a moment before trying again.';
      case 'timeout':
        return 'The request took too long to complete. The server might be slow or overloaded.';
      case 'auth':
        return status === 401
          ? 'You need to be logged in to perform this action.'
          : 'You don\'t have permission to perform this action.';
      case 'client':
        return 'There was a problem with your request. Please check the information and try again.';
      default:
        return 'An unexpected error occurred.';
    }
  };

  const explanation = getErrorExplanation(status, severity);

  // Determine if retry is recommended
  const shouldShowRetry = severity === 'network' || severity === 'server' || severity === 'timeout';

  // Copy error details to clipboard
  const copyErrorDetails = () => {
    const details = JSON.stringify(
      {
        context,
        status,
        message,
        errors,
        timestamp: new Date().toISOString(),
      },
      null,
      2
    );
    navigator.clipboard.writeText(details);
    alert('Error details copied to clipboard');
  };

  return (
    <div className="mb-4 rounded-lg border border-red-400 bg-red-50 p-4">
      {/* Error Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5">
            <svg className="h-5 w-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-base font-['MadaniArabic-Medium'] text-red-800">
              Error {context}
              {status > 0 && <span className="ml-2 text-sm">(Status: {status})</span>}
            </h3>
            <p className="mt-1 text-sm text-red-700">{explanation}</p>

            {/* Error Message */}
            <div className="mt-2">
              <p className="text-sm font-['MadaniArabic-Regular'] text-red-800">{message}</p>
            </div>

            {/* Validation Errors */}
            {errors && Object.keys(errors).length > 0 && (
              <div className="mt-3 space-y-1">
                <p className="text-sm font-['MadaniArabic-Medium'] text-red-800">Validation Errors:</p>
                {Object.entries(errors).map(([field, fieldErrors]) => (
                  <div key={field} className="ml-2">
                    <span className="text-sm font-['MadaniArabic-Medium'] text-red-700">{field}:</span>
                    <ul className="ml-4 list-disc">
                      {fieldErrors.map((err, idx) => (
                        <li key={idx} className="text-sm text-red-600">
                          {err}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* Dev Mode Details */}
            {showDetails && isApiError && (
              <details className="mt-3">
                <summary className="cursor-pointer text-xs text-red-600 hover:text-red-800">
                  Show Technical Details (Dev Mode)
                </summary>
                <div className="mt-2 rounded bg-red-100 p-2">
                  <pre className="text-xs text-red-900">
                    {JSON.stringify({ status, message, errors }, null, 2)}
                  </pre>
                </div>
              </details>
            )}
          </div>
        </div>

        {/* Dismiss Button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 text-red-600 hover:text-red-800"
            aria-label="Dismiss error"
          >
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex gap-2">
        {shouldShowRetry && onRetry && (
          <button
            onClick={onRetry}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-['MadaniArabic-Medium'] text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        )}

        <button
          onClick={copyErrorDetails}
          className="rounded-md border border-red-600 px-4 py-2 text-sm font-['MadaniArabic-Medium'] text-red-600 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
        >
          Copy Error Details
        </button>

        {severity === 'auth' && status === 401 && (
          <a
            href="/login"
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-['MadaniArabic-Medium'] text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Go to Login
          </a>
        )}
      </div>
    </div>
  );
};

export default ApiErrorDisplay;
