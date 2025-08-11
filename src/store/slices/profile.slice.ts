// store/slices/profile.slice.ts (Enhanced version)
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";

export interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  userRole: "user" | "admin" | "super_admin";
  provider: "credentials" | "google" | "apple";
  isVerified: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
  address?: {
    street?: string;
    city?: string;
    zipCode?: string;
    country?: string;
  };
  preferences?: {
    theme?: "light" | "dark" | "system";
    language?: string;
    notifications?: boolean;
  };
}

interface ProfileState {
  data: ProfileData | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isAuthenticated: boolean;
  authChecked: boolean; // Track if we've checked authentication status
}

const initialState: ProfileState = {
  data: null,
  loading: false,
  error: null,
  lastFetched: null,
  isAuthenticated: false,
  authChecked: false,
};

// Enhanced fetch profile with better error handling
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/profile", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Clear any stored tokens
        document.cookie = "token=; Max-Age=0; path=/";
        return rejectWithValue("AUTHENTICATION_ERROR");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || "Failed to fetch profile");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Check authentication status without fetching full profile
export const checkAuthStatus = createAsyncThunk(
  "profile/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/status", {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        return rejectWithValue("NOT_AUTHENTICATED");
      }

      if (!response.ok) {
        return rejectWithValue("Failed to check auth status");
      }

      const data = await response.json();
      return data.isAuthenticated;
    } catch {
      return rejectWithValue("Network error");
    }
  }
);

export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (updates: Partial<ProfileData>, { rejectWithValue }) => {
    try {
      const response = await fetch("/api/auth/profile", {
        method: "PUT",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.status === 401) {
        return rejectWithValue("AUTHENTICATION_ERROR");
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return rejectWithValue(errorData.message || "Failed to update profile");
      }

      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

export const logoutUser = createAsyncThunk("profile/logout", async () => {
  try {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Clear token regardless of response status
    document.cookie = "token=; Max-Age=0; path=/";

    if (!response.ok) {
      // Don't fail logout for server errors
      console.warn("Logout request failed, but token cleared locally");
    }

    return true;
  } catch {
    // Don't fail logout for network errors
    console.warn("Logout network error, but token cleared locally");
    return true;
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.data = null;
      state.isAuthenticated = false;
      state.lastFetched = null;
      state.error = null;
      state.authChecked = true;
    },
    clearError: (state) => {
      state.error = null;
    },
    updateProfileOptimistic: (
      state,
      action: PayloadAction<Partial<ProfileData>>
    ) => {
      if (state.data) {
        state.data = { ...state.data, ...action.payload };
      }
    },
    setAuthenticatedStatus: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      state.authChecked = true;
      if (!action.payload) {
        state.data = null;
      }
    },
  },
  extraReducers: (builder) => {
    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        if (!state.authChecked) {
          state.loading = true;
        }
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload;
        state.authChecked = true;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.authChecked = true;
        state.data = null;
      });

    // Fetch profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;

        if (action.payload === "AUTHENTICATION_ERROR") {
          state.isAuthenticated = false;
          state.data = null;
        }
        state.authChecked = true;
      });

    // Update profile
    builder
      .addCase(updateProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;

        if (action.payload === "AUTHENTICATION_ERROR") {
          state.isAuthenticated = false;
          state.data = null;
        }
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.data = null;
        state.isAuthenticated = false;
        state.lastFetched = null;
        state.error = null;
        state.authChecked = true;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear local state
        state.loading = false;
        state.data = null;
        state.isAuthenticated = false;
        state.lastFetched = null;
        state.authChecked = true;
      });
  },
});

export const {
  clearProfile,
  clearError,
  updateProfileOptimistic,
  setAuthenticatedStatus,
} = profileSlice.actions;

export default profileSlice.reducer;
