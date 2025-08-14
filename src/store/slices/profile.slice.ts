// store/slices/profile.slice.ts
import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api";
import {
  User,
  UserProfile,
  UpdateProfileRequestBody,
  UpdateProfileLocationRequestBody,
  UserRole,
  ApiError,
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

// Helper function to handle API errors
const handleApiError = (error: unknown): string => {
  if (typeof error === 'object' && error !== null) {
    const apiError = error as ApiError;
    
    // Check for authentication-related errors
    if (apiError.status === 401 || apiError.code === 'UNAUTHORIZED') {
      return "AUTHENTICATION_ERROR";
    }
    
    if (apiError.message) {
      return apiError.message;
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return "An unexpected error occurred";
};

// Fetch profile data
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProfile();
      
      // Ensure we have user data
      if (!response.user) {
        return rejectWithValue("AUTHENTICATION_ERROR");
      }
      
      return {
        user: response.user,
        profile: response.profile || null,
      };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);



// Check authentication status
export const checkAuthStatus = createAsyncThunk(
  "profile/checkAuthStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProfile();
      
      if (!response.user) {
        return rejectWithValue("AUTHENTICATION_ERROR");
      }
      
      return {
        isAuthenticated: true,
        user: response.user,
        profile: response.profile || null,
      };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update profile
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (updates: UpdateProfileRequestBody, { rejectWithValue }) => {
    try {
      const response = await apiClient.updateProfile(updates);
      
      if (!response.user) {
        return rejectWithValue("AUTHENTICATION_ERROR");
      }
      
      return {
        user: response.user,
        profile: response.profile || null,
      };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
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
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
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
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get profile completeness
export const fetchProfileCompleteness = createAsyncThunk(
  "profile/fetchProfileCompleteness",
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.getProfileCompleteness();
      return response.data?.completeness || response.completeness || 0;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout user
export const logoutUser = createAsyncThunk("profile/logout", async () => {
  try {
    await apiClient.logout();
    return true;
  } catch (error) {
    // Don't fail logout for server errors, but log the error
    console.warn("Logout request failed, but clearing local state:", error);
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
      state.loading = false;
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
        state.completeness = undefined;
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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Check auth status
    builder
      .addCase(checkAuthStatus.pending, (state) => {
        if (!state.authChecked) {
          state.loading = true;
        }
        state.error = null;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.profile = action.payload.profile;
        state.authChecked = true;
        state.error = null;
        state.lastFetched = Date.now();
      })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.authChecked = true;
        state.user = null;
        state.profile = null;
        state.completeness = undefined;
        
        // Only set error if it's not an authentication error
        if (action.payload !== "AUTHENTICATION_ERROR") {
          state.error = action.payload as string;
        }
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
        state.profile = action.payload.profile;
        state.isAuthenticated = true;
        state.authChecked = true;
        state.lastFetched = Date.now();
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload as string;
        
        if (errorMessage === "AUTHENTICATION_ERROR") {
          state.isAuthenticated = false;
          state.user = null;
          state.profile = null;
          state.completeness = undefined;
        } else {
          state.error = errorMessage;
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
        state.profile = action.payload.profile;
        state.error = null;
        state.lastFetched = Date.now(); // Update last fetched time
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload as string;
        
        if (errorMessage === "AUTHENTICATION_ERROR") {
          state.isAuthenticated = false;
          state.user = null;
          state.profile = null;
          state.completeness = undefined;
        } else {
          state.error = errorMessage;
        }
      });

    // Update profile role
    builder
      .addCase(updateProfileRole.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileRole.fulfilled, (state) => {
        state.loading = false;
        // Force refresh by clearing lastFetched
        state.lastFetched = null;
        state.error = null;
      })
      .addCase(updateProfileRole.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload as string;
        
        if (errorMessage === "AUTHENTICATION_ERROR") {
          state.isAuthenticated = false;
          state.user = null;
          state.profile = null;
          state.completeness = undefined;
        } else {
          state.error = errorMessage;
        }
      });

    // Update profile location
    builder
      .addCase(updateProfileLocation.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProfileLocation.fulfilled, (state) => {
        state.loading = false;
        // Force refresh by clearing lastFetched
        state.lastFetched = null;
        state.error = null;
      })
      .addCase(updateProfileLocation.rejected, (state, action) => {
        state.loading = false;
        const errorMessage = action.payload as string;
        
        if (errorMessage === "AUTHENTICATION_ERROR") {
          state.isAuthenticated = false;
          state.user = null;
          state.profile = null;
          state.completeness = undefined;
        } else {
          state.error = errorMessage;
        }
      });

    // Fetch profile completeness
    builder
      .addCase(fetchProfileCompleteness.fulfilled, (state, action) => {
        state.completeness = action.payload;
      })
      .addCase(fetchProfileCompleteness.rejected, (state, action) => {
        const errorMessage = action.payload as string;
        
        if (errorMessage === "AUTHENTICATION_ERROR") {
          state.isAuthenticated = false;
          state.user = null;
          state.profile = null;
          state.completeness = undefined;
        }
        // Don't set error for completeness failures as it's not critical
      });

    // Logout
    builder
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
        state.error = null;
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
        state.error = null;
      });
  },
});

export const {
  clearProfile,
  clearError,
  setAuthenticatedStatus,
  updateUserOptimistic,
  updateProfileOptimistic,
  setLoading,
} = profileSlice.actions;

export default profileSlice.reducer;