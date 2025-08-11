// components/auth/ProtectedRoute.tsx (Fixed file name and imports)
"use client";
import { ReactNode } from "react";
import AuthGuard from "./AuthGuard";

interface ProtectedRouteProps {
  children: ReactNode;
  level?: "user" | "verified" | "admin" | "super_admin";
  redirectTo?: string;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  level = "user",
  redirectTo,
  fallback,
  loadingComponent,
  unauthorizedComponent,
}) => {
  const getAuthRequirements = (level: string) => {
    switch (level) {
      case "super_admin":
        return {
          requireAuth: true,
          requireVerification: true,
          requireSuperAdmin: true,
        };
      case "admin":
        return {
          requireAuth: true,
          requireVerification: true,
          requireAdmin: true,
        };
      case "verified":
        return {
          requireAuth: true,
          requireVerification: true,
        };
      case "user":
      default:
        return {
          requireAuth: true,
        };
    }
  };

  const authProps = getAuthRequirements(level);

  return (
    <AuthGuard
      {...authProps}
      redirectTo={redirectTo}
      fallback={fallback}
      loadingComponent={loadingComponent}
      unauthorizedComponent={unauthorizedComponent}>
      {children}
    </AuthGuard>
  );
};

export default ProtectedRoute;
