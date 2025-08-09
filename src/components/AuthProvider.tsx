// File: components/providers/AuthProvider.tsx

"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useAuth, UseAuthReturn } from "@/hooks/useAuth";

type AuthContextType = UseAuthReturn;

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuthContext must be used within an AuthProvider");
  }
  return context;
};

// Higher-order component for protected routes
interface WithAuthProps {
  requiredRoles?: string[];
  fallback?: ReactNode;
}

export const withAuth = <P extends object>(
  Component: React.ComponentType<P>,
  options: WithAuthProps = {}
) => {
  const { requiredRoles = [], fallback } = options;

  return function AuthenticatedComponent(props: P) {
    const { isAuthenticated, isLoading, user, hasAnyRole } = useAuthContext();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      if (fallback) {
        return <>{fallback}</>;
      }

      // Redirect to login
      if (typeof window !== "undefined") {
        const authServiceUrl =
          process.env.NEXT_PUBLIC_AUTH_ACCESS_URL ||
          "https://access-management-xi.vercel.app";
        const callbackUrl = encodeURIComponent(window.location.pathname);
        window.location.href = `${authServiceUrl}/auth/users/login?callbackUrl=${callbackUrl}`;
      }

      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>Redirecting to login...</p>
        </div>
      );
    }

    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Required roles: {requiredRoles.join(", ")}
            </p>
            <p className="text-sm text-gray-500">Your role: {user?.role}</p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
};
