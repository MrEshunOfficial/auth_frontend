// components/auth/AuthGuard.tsx
"use client";
import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hook/useProfile";
import LoadingSpinner from "../ui/Loading-spinner";

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireVerification?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
  loadingComponent?: ReactNode;
  unauthorizedComponent?: ReactNode;
}

const AuthGuard: React.FC<AuthGuardProps> = ({
  children,
  requireAuth = true,
  requireVerification = false,
  requireAdmin = false,
  requireSuperAdmin = false,
  redirectTo = "/login",
  fallback,
  loadingComponent,
  unauthorizedComponent,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Wait for auth check to complete
    if (loading) return;

    // Check authentication requirement
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If not requiring auth and user is not authenticated, allow access
    if (!requireAuth && !isAuthenticated) {
      return;
    }

    // If we reach here, user is authenticated, check additional requirements
    if (user) {
      // Check verification requirement
      if (requireVerification && !user.isVerified) {
        router.push("/verify-email");
        return;
      }

      // Check super admin requirement
      if (requireSuperAdmin && !user.isSuperAdmin) {
        router.push("/unauthorized");
        return;
      }

      // Check admin requirement (super admins are also admins)
      if (requireAdmin && !user.isAdmin && !user.isSuperAdmin) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [
    isAuthenticated,
    user,
    loading,
    requireAuth,
    requireVerification,
    requireAdmin,
    requireSuperAdmin,
    redirectTo,
    router,
  ]);

  // Show loading state
  if (loading) {
    return (
      loadingComponent ||
      fallback || (
        <div className="flex items-center justify-center min-h-screen">
          <LoadingSpinner />
        </div>
      )
    );
  }

  // Show nothing while redirecting for unauthenticated users
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Additional checks for authenticated users
  if (isAuthenticated && user) {
    if (requireVerification && !user.isVerified) {
      return unauthorizedComponent || null;
    }

    if (requireSuperAdmin && !user.isSuperAdmin) {
      return unauthorizedComponent || null;
    }

    if (requireAdmin && !user.isAdmin && !user.isSuperAdmin) {
      return unauthorizedComponent || null;
    }
  }

  return <>{children}</>;
};

export default AuthGuard;
