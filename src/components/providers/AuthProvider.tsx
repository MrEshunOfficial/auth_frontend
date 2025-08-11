// components/providers/AuthProvider.tsx
"use client";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { checkAuthStatus } from "@/store/slices/profile.slice";
import type { AppDispatch } from "@/store";

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    // Check authentication status on app startup
    dispatch(checkAuthStatus());
  }, [dispatch]);

  return <>{children}</>;
};

export default AuthProvider;
