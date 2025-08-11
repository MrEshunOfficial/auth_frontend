// components/auth/RoleBasedComponent.tsx
"use client";
import { useUserRole, useAuth } from "@/hook/useProfile";
import { ReactNode } from "react";

interface RoleBasedComponentProps {
  children: ReactNode;
  allowedRoles?: ("user" | "admin" | "super_admin")[];
  requireVerification?: boolean;
  requireAdmin?: boolean;
  requireSuperAdmin?: boolean;
  fallback?: ReactNode;
  inverse?: boolean; // Show content when user DOESN'T have the role
}

const RoleBasedComponent: React.FC<RoleBasedComponentProps> = ({
  children,
  allowedRoles = ["user"],
  requireVerification = false,
  requireAdmin = false,
  requireSuperAdmin = false,
  fallback = null,
  inverse = false,
}) => {
  const { role, isAdmin, isSuperAdmin } = useUserRole();
  const { isAuthenticated, user } = useAuth();

  // Not authenticated
  if (!isAuthenticated || !user) {
    return inverse ? <>{children}</> : <>{fallback}</>;
  }

  // Check verification requirement
  if (requireVerification && !user.isVerified) {
    return inverse ? <>{children}</> : <>{fallback}</>;
  }

  // Handle specific admin requirements
  if (requireSuperAdmin && !isSuperAdmin) {
    return inverse ? <>{children}</> : <>{fallback}</>;
  }

  if (requireAdmin && !isAdmin && !isSuperAdmin) {
    return inverse ? <>{children}</> : <>{fallback}</>;
  }

  // Check role permissions if allowedRoles is specified
  const hasPermission = allowedRoles.some((allowedRole) => {
    switch (allowedRole) {
      case "super_admin":
        return isSuperAdmin;
      case "admin":
        return isAdmin || isSuperAdmin;
      case "user":
        return role === "user" || isAdmin || isSuperAdmin;
      default:
        return false;
    }
  });

  // Return based on inverse flag
  if (inverse) {
    return hasPermission ? <>{fallback}</> : <>{children}</>;
  }

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default RoleBasedComponent;
