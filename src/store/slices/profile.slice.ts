// store/slices/profile.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api";
import {
  User,
  UserProfile,
  UpdateProfileRequestBody,
  UpdateProfileLocationRequestBody,
  UserRole,
} from "@/types/api.types";

export interface ProfileState {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  isAuthenticated: boolean;
  authChecked: boolean;
  completeness?: number;
}

const initialState: ProfileState = {
  user: null,
  profile: null,
  loading: false,
  error: null,
  lastFetched: null,
  isAuthenticated: false,
  authChecked: false,
};

// Fetch profile data
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProfile();
      return {
        user: response.user!,
        profile: response.profile,
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Check authentication status
export const checkAuthStatus = createAsyncThunk(
  "profile/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProfile();
      return {
        isAuthenticated: true,
        user: response.user!,
        profile: response.profile,
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (updates: UpdateProfileRequestBody, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateProfile(updates);
      return {
        user: response.user!,
        profile: response.profile,
      };
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Update profile role
export const updateProfileRole = createAsyncThunk(
  "profile/updateProfileRole",
  async (role: UserRole, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateProfileRole({ role });
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Update profile location
export const updateProfileLocation = createAsyncThunk(
  "profile/updateProfileLocation",
  async (data: UpdateProfileLocationRequestBody, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateProfileLocation(data);
      return response;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Get profile completeness
export const fetchProfileCompleteness = createAsyncThunk(
  "profile/fetchProfileCompleteness",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProfileCompleteness();
      return response.data?.completeness || 0;
    } catch (error) {
      if (error instanceof Error) {
        return rejectWithValue(error.message);
      }
      return rejectWithValue("Network error");
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk("profile/logout", async () => {
  try {
    await apiClient.logout();
    return true;
  } catch {
    // Don't fail logout for server errors
    console.warn("Logout request failed, but clearing local state");
    return true;
  }
});

const profileSlice = createSlice({
  name: "profile",
  initialState,
  reducers: {
    clearProfile: (state) => {
      state.user = null;
      state.profile = null;
      state.isAuthenticated = false;
      state.lastFetched = null;
      state.error = null;
      state.authChecked = true;
      state.completeness = undefined;
    },
    clearError: (state) => {
      state.error = null;
    },
    setAuthenticatedStatus: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
      state.authChecked = true;
      if (!action.payload) {
        state.user = null;
        state.profile = null;
      }
    },
    updateUserOptimistic: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },
    updateProfileOptimistic: (
      state,
      action: PayloadAction<Partial<UserProfile>>
    ) => {
      if (state.profile) {
        state.profile = { ...state.profile, ...action.payload };
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
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.profile = action.payload.profile || null;
        state.authChecked = true;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.authChecked = true;
        state.user = null;
        state.profile = null;
      });

    // Fetch profile
    builder
      .addCase(fetchProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.profile = action.payload.profile || null;
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
          state.user = null;
          state.profile = null;
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
        state.user = action.payload.user;
        state.profile = action.payload.profile || null;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;

        if (action.payload === "AUTHENTICATION_ERROR") {
          state.isAuthenticated = false;
          state.user = null;
          state.profile = null;
        }
      });

    // Update profile role
    builder.addCase(updateProfileRole.fulfilled, (state) => {
      // Refresh profile data after role update
      state.lastFetched = null; // Force refresh
    });

    // Update profile location
    builder.addCase(updateProfileLocation.fulfilled, (state) => {
      // Refresh profile data after location update
      state.lastFetched = null; // Force refresh
    });

    // Fetch profile completeness
    builder.addCase(fetchProfileCompleteness.fulfilled, (state, action) => {
      state.completeness = action.payload;
    });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
        state.lastFetched = null;
        state.error = null;
        state.authChecked = true;
        state.completeness = undefined;
      })
      .addCase(logoutUser.rejected, (state) => {
        // Even if logout fails, clear local state
        state.loading = false;
        state.user = null;
        state.profile = null;
        state.isAuthenticated = false;
        state.lastFetched = null;
        state.authChecked = true;
        state.completeness = undefined;
      });
  },
});

export const {
  clearProfile,
  clearError,
  setAuthenticatedStatus,
  updateUserOptimistic,
  updateProfileOptimistic,
} = profileSlice.actions;

export default profileSlice.reducer;
