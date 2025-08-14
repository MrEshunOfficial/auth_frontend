// components/providers/AuthInitializer.tsx
"use client";

import { useProfile } from "@/hook/useProfile";
import React, { useEffect, ReactNode } from "react";

interface AuthInitializerProps {
  children: ReactNode;
}

export const AuthInitializer: React.FC<AuthInitializerProps> = ({
  children,
}) => {
  const { initializeAuth, authChecked } = useProfile();

  useEffect(() => {
    // Initialize auth check on app load
    if (!authChecked) {
      initializeAuth().catch(console.error);
    }
  }, [authChecked, initializeAuth]);

  // Always render children - individual pages will handle auth requirements
  return <>{children}</>;
};

export default AuthInitializer;
