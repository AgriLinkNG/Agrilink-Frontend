/**
 * ErrorFallback - Reusable error display with retry functionality
 */
import React from 'react';

interface ErrorFallbackProps {
  error: Error | string | null;
  title?: string;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  title = 'Something went wrong',
  onRetry,
  onDismiss,
  className = '',
}) => {
  const errorMessage = error instanceof Error ? error.message : error || 'An unexpected error occurred';

  return (
    <div
      className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}
      role="alert"
    >
      <div className="flex items-start gap-4">
        {/* Error Icon */}
        <div className="flex-shrink-0">
          <svg
            className="h-6 w-6 text-red-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        {/* Content */}
        <div className="flex-1">
          <h3 className="text-lg font-['MadaniArabic-SemiBold'] text-red-800">
            {title}
          </h3>
          <p className="mt-1 text-sm text-red-700 font-['MadaniArabic-Regular']">
            {errorMessage}
          </p>

          {/* Actions */}
          <div className="mt-4 flex gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-red-600 text-white text-sm font-['MadaniArabic-Medium'] rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="px-4 py-2 bg-white text-red-600 text-sm font-['MadaniArabic-Medium'] rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>

        {/* Close button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="flex-shrink-0 text-red-400 hover:text-red-600 transition-colors"
            aria-label="Dismiss error"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default ErrorFallback;
