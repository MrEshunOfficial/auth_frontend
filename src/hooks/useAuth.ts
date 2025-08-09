// File: hooks/useAuth.ts
// Place this in your homepage application (separate service)

import { useState, useEffect, useCallback } from 'react';
import authClient, { AuthUser } from '@/lib/auth/authClient';

export interface UseAuthReturn {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  checkAuth: () => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isAdmin: () => boolean;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authClient.checkAuthentication();
      
      if (result.authenticated && result.user) {
        setUser(result.user);
      } else {
        setUser(null);
        setError(result.message || 'Not authenticated');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication check failed');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await authClient.logout();
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      // Still clear user state even if logout request fails
      setUser(null);
    }
  }, []);

  const hasRole = useCallback((role: string): boolean => {
    return user?.role === role;
  }, [user]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return user ? roles.includes(user.role) : false;
  }, [user]);

  const isAdmin = useCallback((): boolean => {
    return hasAnyRole(['admin', 'super_admin']);
  }, [hasAnyRole]);

  // Initial authentication check
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Start periodic authentication checking
  useEffect(() => {
    if (user) {
      authClient.startPeriodicCheck(300000); // Check every 5 minutes
      
      return () => {
        authClient.stopPeriodicCheck();
      };
    }
  }, [user]);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error,
    checkAuth,
    logout,
    hasRole,
    hasAnyRole,
    isAdmin,
  };
};