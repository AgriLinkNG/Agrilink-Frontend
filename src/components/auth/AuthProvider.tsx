// Authentication provider component with error boundaries and security monitoring

import React, { ReactNode, useEffect, useState } from 'react';
import { AuthContext_, useAuthProvider, AuthContextType } from '../../hooks/useAuth';
import { ApiRequestError } from '../../services/api';

interface AuthProviderProps {
  children: ReactNode;
}

interface AuthErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Error boundary for authentication errors
class AuthErrorBoundary extends React.Component<
  { children: ReactNode; onError?: (error: Error) => void },
  AuthErrorBoundaryState
> {
  constructor(props: { children: ReactNode; onError?: (error: Error) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): AuthErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    if (this.props.onError) {
      this.props.onError(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
            <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
              <svg
                className="w-6 h-6 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Authentication Error
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Something went wrong with authentication. Please refresh the page or try again later.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full bg-brand-colors-SproutGreen text-white py-2 px-4 rounded-md hover:bg-brand-colors-SproutGreen/90 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Loading component
const AuthLoadingSpinner: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-colors-SproutGreen"></div>
      <p className="mt-4 text-sm text-gray-600">Initializing authentication...</p>
    </div>
  </div>
);

// Main authentication provider
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthProvider();
  const [minLoadTimeElapsed, setMinLoadTimeElapsed] = useState(false);

  // Ensure loading screen shows for at least 250ms to prevent jarring flashes
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTimeElapsed(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      sessionStorage.setItem('loginTime', Date.now().toString());
    }

    if (!auth.isAuthenticated && auth.isInitialized) {
      sessionStorage.removeItem('loginTime');
    }
  }, [auth.isAuthenticated, auth.user, auth.isInitialized]);

  const handleAuthError = (error: Error) => {
    if (error instanceof ApiRequestError) {
      switch (error.status) {
        case 401:
          setTimeout(() => {
            window.location.href = '/login';
          }, 2000);
          break;
        case 403:
          setTimeout(() => {
            window.location.href = '/';
          }, 2000);
          break;
        default:
          break;
      }
    }
  };

  // Show loading screen while initializing AND until minimum display time has elapsed
  if (!auth.isInitialized || !minLoadTimeElapsed) {
    return <AuthLoadingSpinner />;
  }

  return (
    <AuthErrorBoundary onError={handleAuthError}>
      <AuthContext_.Provider value={auth}>
        {children}
      </AuthContext_.Provider>
    </AuthErrorBoundary>
  );
};

// Higher-order component for protected routes
export const withAuthProtection = <P extends object>(
  Component: React.ComponentType<P>,
  options: {
    requireAuth?: boolean;
    requiredRole?: string;
    redirectTo?: string;
  } = {}
) => {
  const { requireAuth = true, requiredRole, redirectTo = '/login' } = options;

  return (props: P) => {
    const auth = useAuthProvider();

    useEffect(() => {
      if (!auth.isInitialized || auth.isLoading) {
        return;
      }

      if (requireAuth && !auth.isAuthenticated) {
        window.location.href = redirectTo;
        return;
      }

      if (requiredRole && auth.user?.role !== requiredRole) {
        window.location.href = '/unauthorized';
        return;
      }
    }, [auth.isInitialized, auth.isAuthenticated, auth.user, auth.isLoading]);

    // Show loading while checking authentication
    if (!auth.isInitialized || auth.isLoading) {
      return <AuthLoadingSpinner />;
    }

    // Don't render if authentication requirements aren't met
    if (requireAuth && !auth.isAuthenticated) {
      return null;
    }

    if (requiredRole && auth.user?.role !== requiredRole) {
      return null;
    }

    return <Component {...props} />;
  };
};

// Protected route component
export const ProtectedRoute: React.FC<{
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: string;
  redirectTo?: string;
  fallback?: ReactNode;
}> = ({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
  fallback = <AuthLoadingSpinner />,
}) => {
  const auth = useAuthProvider();

  // Show fallback while initializing
  if (!auth.isInitialized || auth.isLoading) {
    return <>{fallback}</>;
  }

  // Check authentication requirements
  if (requireAuth && !auth.isAuthenticated) {
    setTimeout(() => {
      window.location.href = redirectTo;
    }, 100);
    return <>{fallback}</>;
  }

  // Check role requirements
  if (requiredRole && auth.user?.role !== requiredRole) {
    setTimeout(() => {
      window.location.href = '/unauthorized';
    }, 100);
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

export default AuthProvider;