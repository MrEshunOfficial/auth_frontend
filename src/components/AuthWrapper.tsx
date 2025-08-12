// components/AuthWrapper.tsx
"use client";

import React, { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hook/useProfile";

interface AuthWrapperProps {
  children: ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

export const AuthWrapper: React.FC<AuthWrapperProps> = ({
  children,
  requireAuth = true,
  redirectTo = "/login",
  fallback = (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-lg">Loading...</div>
    </div>
  ),
}) => {
  const { isAuthenticated, authChecked, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Redirect if authentication is required but user is not authenticated
    if (requireAuth && authChecked && !isAuthenticated && !loading) {
      router.push(redirectTo);
    }
  }, [requireAuth, authChecked, isAuthenticated, loading, router, redirectTo]);

  // Show fallback while checking auth or loading
  if (!authChecked || loading) {
    return <>{fallback}</>;
  }

  // Show children if auth is not required or user is authenticated
  if (!requireAuth || isAuthenticated) {
    return <>{children}</>;
  }

  // Show fallback if auth is required but user is not authenticated
  // This case should rarely be reached due to the redirect above
  return <>{fallback}</>;
};

// Higher-order component for pages that require authentication
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    fallback?: ReactNode;
  }
) => {
  const WrappedComponent: React.FC<P> = (props) => (
    <AuthWrapper
      requireAuth={true}
      redirectTo={options?.redirectTo}
      fallback={options?.fallback}
    >
      <Component {...props} />
    </AuthWrapper>
  );

  WrappedComponent.displayName = `withAuth(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

// Higher-order component for pages that should redirect authenticated users
export const withGuest = <P extends object>(
  Component: React.ComponentType<P>,
  options?: {
    redirectTo?: string;
    fallback?: ReactNode;
  }
) => {
  const WrappedComponent: React.FC<P> = (props) => {
    const { isAuthenticated, authChecked, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Redirect if user is authenticated
      if (authChecked && isAuthenticated && !loading) {
        router.push(options?.redirectTo || "/dashboard");
      }
    }, [authChecked, isAuthenticated, loading, router]);

    // Show fallback while checking auth or loading
    if (!authChecked || loading) {
      return (
        <>
          {options?.fallback || (
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-lg">Loading...</div>
            </div>
          )}
        </>
      );
    }

    // Show component if user is not authenticated
    if (!isAuthenticated) {
      return <Component {...props} />;
    }

    // Show fallback while redirecting
    return (
      <>
        {options?.fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-lg">Redirecting...</div>
          </div>
        )}
      </>
    );
  };

  WrappedComponent.displayName = `withGuest(${
    Component.displayName || Component.name
  })`;

  return WrappedComponent;
};

export default AuthWrapper;
