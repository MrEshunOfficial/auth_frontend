// hooks/useProfile.ts - Improved with better type utilization
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchProfile,
  updateProfile,
  updateProfileRole,
  updateProfileLocation,
  fetchProfileCompleteness,
  logoutUser,
  clearProfile,
  clearError,
  updateUserOptimistic,
  updateProfileOptimistic,
  checkAuthStatus,
  setLoading,
} from "@/store/slices/profile.slice";
import type { RootState, AppDispatch } from "@/store";
import {
  User,
  UserProfile,
  UpdateProfileRequestBody,
  UserRole,
  UserLocation,
  UserContext,
  createUserContext,
} from "@/types/api.types";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface UseProfileReturn {
  // Data - Both user and profile objects
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  completeness?: number;

  // Actions
  initializeAuth: () => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (updates: UpdateProfileRequestBody) => Promise<void>;
  updateRole: (role: UserRole) => Promise<void>;
  updateLocation: (location: UserLocation) => Promise<void>;
  fetchCompleteness: () => Promise<void>;
  logout: () => Promise<void>;
  clearProfileData: () => void;
  clearProfileError: () => void;

  // Utility functions
  formatDate: (dateString?: string | Date) => string;
  getRoleDisplay: (role: string) => string;
  getProviderDisplay: (provider?: string) => string;

  // Helper properties using proper types
  needsRefresh: boolean;
  hasProfile: boolean;

  // Use the proper UserContext type
  userContext: UserContext | null;
}

export const useProfile = (): UseProfileReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    user,
    profile,
    loading,
    error,
    lastFetched,
    isAuthenticated,
    authChecked,
    completeness,
  } = useSelector((state: RootState) => state.profile);

  // Check if profile data needs refresh
  const needsRefresh = useCallback(() => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > CACHE_DURATION;
  }, [lastFetched]);

  // Initialize authentication status
  const initializeAuth = useCallback(async () => {
    if (authChecked) return;

    try {
      await dispatch(checkAuthStatus()).unwrap();
    } catch {
      console.log("Auth check failed - user not authenticated");
    }
  }, [dispatch, authChecked]);

  // Fetch profile with automatic authentication handling
  const fetchUserProfile = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      await dispatch(fetchProfile()).unwrap();
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "string" ? error : "Failed to fetch profile";

      if (errorMessage === "AUTHENTICATION_ERROR") {
        console.log("Authentication error - redirecting to login");
        router.push("/login");
      }
      throw error;
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, router]);

  // Update profile with optimistic updates and proper typing
  const updateUserProfile = useCallback(
    async (updates: UpdateProfileRequestBody) => {
      if (!user) {
        throw new Error("No user data available");
      }

      // Optimistic updates for user fields with proper typing
      if (updates.name || updates.avatar) {
        const userUpdates: Partial<User> = {};
        if (updates.name) userUpdates.name = updates.name;
        if (updates.avatar) userUpdates.avatar = updates.avatar;
        dispatch(updateUserOptimistic(userUpdates));
      }

      // Optimistic updates for profile fields
      if (updates.profile && profile) {
        dispatch(updateProfileOptimistic(updates.profile));
      }

      try {
        await dispatch(updateProfile(updates)).unwrap();
      } catch (error) {
        // Revert optimistic updates by refetching
        await fetchUserProfile();
        throw error;
      }
    },
    [dispatch, user, profile, fetchUserProfile]
  );

  // Update role with proper error handling
  const updateRole = useCallback(
    async (role: UserRole) => {
      try {
        await dispatch(updateProfileRole(role)).unwrap();
        await fetchUserProfile();
      } catch (error) {
        const errorMessage =
          typeof error === "string" ? error : "Failed to update role";
        if (errorMessage === "AUTHENTICATION_ERROR") {
          router.push("/login");
        }
        throw error;
      }
    },
    [dispatch, fetchUserProfile, router]
  );

  const updateLocation = useCallback(
    async (location: UserLocation) => {
      try {
        await dispatch(updateProfileLocation({ location })).unwrap();
        await fetchUserProfile();
      } catch (error) {
        const errorMessage =
          typeof error === "string" ? error : "Failed to update location";
        if (errorMessage === "AUTHENTICATION_ERROR") {
          router.push("/login");
        }
        throw error;
      }
    },
    [dispatch, fetchUserProfile, router]
  );

  const fetchCompleteness = useCallback(async () => {
    try {
      await dispatch(fetchProfileCompleteness()).unwrap();
    } catch (error) {
      console.error("Failed to fetch completeness:", error);
    }
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      dispatch(clearProfile());
      router.push("/login");
    }
  }, [dispatch, router]);

  const clearProfileData = useCallback(() => {
    dispatch(clearProfile());
  }, [dispatch]);

  const clearProfileError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Utility functions with better type safety
  const formatDate = useCallback((dateString?: string | Date): string => {
    if (!dateString) return "Not available";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid date";

      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "Invalid date";
    }
  }, []);

  const getRoleDisplay = useCallback(
    (role: string): string => {
      switch (role) {
        case UserRole.SUPER_ADMIN:
        case "super_admin":
          return user?.systemAdminName || "Super Administrator";
        case UserRole.ADMIN:
        case "admin":
          return "Administrator";
        case UserRole.PROVIDER:
        case "service_provider":
          return "Service Provider";
        case UserRole.CUSTOMER:
        case "customer":
          return "Customer";
        case "user":
          return "User";
        default:
          return role || "Unknown";
      }
    },
    [user?.systemAdminName]
  );

  const getProviderDisplay = useCallback((provider?: string): string => {
    switch (provider) {
      case "google":
        return "Google";
      case "apple":
        return "Apple";
      case "credentials":
        return "Email & Password";
      default:
        return "Unknown Provider";
    }
  }, []);

  // Initialize auth on mount
  useEffect(() => {
    if (!authChecked) {
      initializeAuth();
    }
  }, [authChecked, initializeAuth]);

  // Auto-fetch profile when authenticated and data is stale
  useEffect(() => {
    if (isAuthenticated && authChecked && needsRefresh() && !loading) {
      fetchUserProfile().catch(console.error);
    }
  }, [isAuthenticated, authChecked, needsRefresh, loading, fetchUserProfile]);

  // Auto-fetch completeness when user and profile are loaded
  useEffect(() => {
    if (user && profile && completeness === undefined && !loading) {
      fetchCompleteness();
    }
  }, [user, profile, completeness, loading, fetchCompleteness]);

  // Create proper UserContext using the helper function
  const userContext: UserContext | null = user
    ? createUserContext(user, profile || undefined)
    : null;

  return {
    // Data
    user,
    profile,
    loading,
    error,
    isAuthenticated,
    authChecked,
    completeness,

    // Actions
    initializeAuth,
    fetchUserProfile,
    updateUserProfile,
    updateRole,
    updateLocation,
    fetchCompleteness,
    logout,
    clearProfileData,
    clearProfileError,

    // Utility functions
    formatDate,
    getRoleDisplay,
    getProviderDisplay,

    // Helper properties
    needsRefresh: needsRefresh(),
    hasProfile: !!profile,

    // Properly typed UserContext
    userContext,
  };
};
