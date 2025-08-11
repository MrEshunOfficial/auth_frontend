// hooks/useProfile.ts (Updated useAuth hook)
import { useCallback, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import {
  fetchProfile,
  updateProfile,
  logoutUser,
  clearProfile,
  clearError,
  updateProfileOptimistic,
  ProfileData,
} from "@/store/slices/profile.slice";
import type { RootState, AppDispatch } from "@/store";

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 5 * 60 * 1000;

interface UseProfileReturn {
  // Data
  profile: ProfileData | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  // Actions
  fetchUserProfile: () => Promise<void>;
  updateUserProfile: (updates: Partial<ProfileData>) => Promise<void>;
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
}

export const useProfile = (): UseProfileReturn => {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const {
    data: profile,
    loading,
    error,
    lastFetched,
    isAuthenticated,
  } = useSelector((state: RootState) => state.profile);

  // Check if profile data needs refresh
  const needsRefresh = useCallback(() => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > CACHE_DURATION;
  }, [lastFetched]);

  // Fetch profile with automatic authentication handling
  const fetchUserProfile = useCallback(async () => {
    try {
      await dispatch(fetchProfile()).unwrap();
    } catch (error: unknown) {
      if (error === "AUTHENTICATION_ERROR") {
        // Redirect to login for authentication errors
        router.push("/login");
      }
      throw error;
    }
  }, [dispatch, router]);

  // Update profile with optimistic updates
  const updateUserProfile = useCallback(
    async (updates: Partial<ProfileData>) => {
      if (!profile) {
        throw new Error("No profile data available");
      }

      // Optimistic update
      dispatch(updateProfileOptimistic(updates));

      try {
        await dispatch(updateProfile(updates)).unwrap();
      } catch (error) {
        // Revert optimistic update by refetching
        await fetchUserProfile();
        throw error;
      }
    },
    [dispatch, profile, fetchUserProfile]
  );

  // Logout with automatic redirect
  const logout = useCallback(async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      router.push("/login");
    } catch (error) {
      // Even if logout fails, redirect to login
      router.push("/login");
      throw error;
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

  const getRoleDisplay = useCallback((role: string) => {
    switch (role) {
      case "super_admin":
        return "Super Administrator";
      case "admin":
        return "Administrator";
      case "user":
        return "User";
      default:
        return role;
    }
  }, []);

  const getProviderDisplay = useCallback((provider?: string) => {
    switch (provider) {
      case "google":
        return "Google";
      case "apple":
        return "Apple";
      case "credentials":
        return "Email & Password";
      default:
        return "Unknown";
    }
  }, []);

  // Auto-fetch profile on mount if needed and authenticated
  useEffect(() => {
    if (isAuthenticated && needsRefresh()) {
      fetchUserProfile().catch(console.error);
    }
  }, [isAuthenticated, needsRefresh, fetchUserProfile]);

  // Helper computed properties
  const isAdmin = profile?.isAdmin || false;
  const isSuperAdmin = profile?.isSuperAdmin || false;
  const isVerified = profile?.isVerified || false;

  return {
    // Data
    profile,
    loading,
    error,
    isAuthenticated,

    // Actions
    fetchUserProfile,
    updateUserProfile,
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
  };
};

// Updated useAuth hook to include loading
export const useAuth = () => {
  const { isAuthenticated, profile, logout, clearProfileData, loading } =
    useProfile();

  return {
    isAuthenticated,
    user: profile,
    logout,
    clearAuth: clearProfileData,
    loading, // Add loading to useAuth return
  };
};

export const useUserRole = () => {
  const { profile, isAdmin, isSuperAdmin, getRoleDisplay } = useProfile();

  return {
    role: profile?.userRole,
    isAdmin,
    isSuperAdmin,
    isUser: profile?.userRole === "user",
    roleDisplay: profile?.userRole
      ? getRoleDisplay(profile.userRole)
      : "Unknown",
  };
};

export const useUserPreferences = () => {
  const { profile, updateUserProfile } = useProfile();

  const updatePreferences = useCallback(
    async (
      newPreferences: Partial<NonNullable<ProfileData["preferences"]>>
    ) => {
      if (!profile) throw new Error("No profile available");

      const updatedPreferences = {
        ...profile.preferences,
        ...newPreferences,
      };

      await updateUserProfile({ preferences: updatedPreferences });
    },
    [profile, updateUserProfile]
  );

  return {
    preferences: profile?.preferences,
    theme: profile?.preferences?.theme,
    notifications: profile?.preferences?.notifications,
    language: profile?.preferences?.language,
    updatePreferences,
  };
};

export default useProfile;
