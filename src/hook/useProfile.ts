// hooks/useProfile.ts
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
} from "@/types/api.types";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface UseProfileReturn {
  // Data
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

  // Helper properties
  isAdmin: boolean;
  isSuperAdmin: boolean;
  isVerified: boolean;
  needsRefresh: boolean;
  hasProfile: boolean;
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
      // Don't redirect here, let components handle unauthenticated state
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

  // Update profile with optimistic updates
  const updateUserProfile = useCallback(
    async (updates: UpdateProfileRequestBody) => {
      if (!user) {
        throw new Error("No user data available");
      }

      // Optimistic updates
      if (updates.name || updates.avatar) {
        const userUpdates: Partial<User> = {};
        if (updates.name) userUpdates.name = updates.name;
        if (updates.avatar) userUpdates.avatar = updates.avatar;
        dispatch(updateUserOptimistic(userUpdates));
      }

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

  // Update profile role
  const updateRole = useCallback(
    async (role: UserRole) => {
      try {
        await dispatch(updateProfileRole(role)).unwrap();
        // Refresh profile data after role update
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

  // Update profile location
  const updateLocation = useCallback(
    async (location: UserLocation) => {
      try {
        await dispatch(updateProfileLocation({ location })).unwrap();
        // Refresh profile data after location update
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

  // Fetch profile completeness
  const fetchCompleteness = useCallback(async () => {
    try {
      await dispatch(fetchProfileCompleteness()).unwrap();
    } catch (error) {
      console.error("Failed to fetch completeness:", error);
      // Don't throw for completeness errors as it's not critical
    }
  }, [dispatch]);

  // Logout with automatic redirect
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      // Always redirect and clear state, even if logout request fails
      dispatch(clearProfile());
      router.push("/login");
    }
  }, [dispatch, router]);

  // Clear profile data
  const clearProfileData = useCallback(() => {
    dispatch(clearProfile());
  }, [dispatch]);

  // Clear error
  const clearProfileError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Utility functions
  const formatDate = useCallback((dateString?: string | Date) => {
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
    (role: string) => {
      switch (role) {
        case "super_admin":
          return user?.name;
        case "admin":
          return "Administrator";
        case "service_provider":
          return "Service Provider";
        case "customer":
          return "Customer";
        case "user":
          return "User";
        default:
          return role || "Unknown";
      }
    },
    [user?.name]
  );

  const getProviderDisplay = useCallback((provider?: string) => {
    switch (provider) {
      case "google":
        return "Google";
      case "apple":
        return "Apple";
      case "credentials":
        return "Signed in with Email";
      default:
        return "Unknown";
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

  // Auto-fetch completeness when profile is loaded
  useEffect(() => {
    if (user && profile && completeness === undefined && !loading) {
      fetchCompleteness();
    }
  }, [user, profile, completeness, loading, fetchCompleteness]);

  // Helper computed properties
  const isAdmin = user?.isAdmin || false;
  const isSuperAdmin = user?.isSuperAdmin || false;
  const isVerified = user?.isVerified || false;
  const hasProfile = !!profile;

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
    isAdmin,
    isSuperAdmin,
    isVerified,
    needsRefresh: needsRefresh(),
    hasProfile,
  };
};

// Updated useAuth hook
export const useAuth = () => {
  const {
    isAuthenticated,
    authChecked,
    user,
    logout,
    clearProfileData,
    loading,
    initializeAuth,
  } = useProfile();

  return {
    isAuthenticated,
    authChecked,
    user,
    logout,
    clearAuth: clearProfileData,
    loading,
    initializeAuth,
  };
};

// User role hook
export const useUserRole = () => {
  const { user, profile, isAdmin, isSuperAdmin, getRoleDisplay } = useProfile();

  return {
    userRole: user?.role,
    profileRole: profile?.role,
    isAdmin,
    isSuperAdmin,
    isUser: user?.role === "user",
    isCustomer: profile?.role === UserRole.CUSTOMER,
    isProvider: profile?.role === UserRole.PROVIDER,
    userRoleDisplay: user?.role ? getRoleDisplay(user.role) : "Unknown",
    profileRoleDisplay: profile?.role
      ? getRoleDisplay(profile.role)
      : "Unknown",
  };
};

// User preferences hook
export const useUserPreferences = () => {
  const { profile, updateUserProfile } = useProfile();

  const updatePreferences = useCallback(
    async (newPreferences: Partial<UserProfile["preferences"]>) => {
      if (!profile) throw new Error("No profile available");

      const updatedPreferences = {
        ...profile.preferences,
        ...newPreferences,
      };

      await updateUserProfile({
        profile: {
          preferences: updatedPreferences,
        },
      });
    },
    [profile, updateUserProfile]
  );

  return {
    preferences: profile?.preferences,
    theme: profile?.preferences?.theme,
    notifications: profile?.preferences?.notifications,
    language: profile?.preferences?.language,
    privacySettings: profile?.preferences?.privacySettings,
    updatePreferences,
  };
};

export default useProfile;
