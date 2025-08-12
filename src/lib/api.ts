// lib/api.ts
import {
  ApiResponse,
  ApiError,
  User,
  UserProfile,
  SignupRequestBody,
  LoginRequestBody,
  UpdateProfileRequestBody,
  UpdateProfileRoleRequestBody,
  UpdateProfileLocationRequestBody,
  GoogleAuthRequestBody,
  AppleAuthRequestBody,
  LinkProviderRequestBody,
} from "@/types/api.types";

const getBaseURL = (): string => {
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }
  return process.env.NEXT_PUBLIC_BACKEND_URL || "";
};

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = getBaseURL();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api${endpoint}`;

    console.log("Making request to:", url);

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include",
      mode: "cors",
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        let errorCode: string | undefined;

        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          errorCode = errorData.code;
        } catch {
          // If JSON parsing fails, use the default error message
        }

        const apiError: ApiError = {
          message: errorMessage,
          status: response.status,
          code: errorCode,
        };

        throw apiError;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API request failed:", error);

      if (error instanceof TypeError && error.message.includes("fetch")) {
        const networkError: ApiError = {
          message: "Network error. Please check your connection and try again.",
          code: "NETWORK_ERROR",
        };
        throw networkError;
      }

      if (error instanceof TypeError && error.message.includes("CORS")) {
        const corsError: ApiError = {
          message: "Connection error. Please try again later.",
          code: "CORS_ERROR",
        };
        throw corsError;
      }

      if (typeof error === "object" && error !== null && "message" in error) {
        throw error;
      }

      const unknownError: ApiError = {
        message: "An unexpected error occurred. Please try again.",
        code: "UNKNOWN_ERROR",
      };
      throw unknownError;
    }
  }

  // Auth methods
  async signup(userData: SignupRequestBody): Promise<ApiResponse> {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequestBody): Promise<ApiResponse> {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout(): Promise<ApiResponse> {
    return this.request("/auth/logout", {
      method: "POST",
    });
  }

  async verifyEmail(token: string): Promise<ApiResponse> {
    return this.request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string): Promise<ApiResponse> {
    return this.request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string): Promise<ApiResponse> {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, password: string): Promise<ApiResponse> {
    return this.request("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ token, password }),
    });
  }

  // Profile methods
  async getProfile(): Promise<
    ApiResponse<{ user: User; profile?: UserProfile }>
  > {
    return this.request("/profile");
  }

  async updateProfile(
    updates: UpdateProfileRequestBody
  ): Promise<ApiResponse<{ user: User; profile?: UserProfile }>> {
    return this.request("/profile", {
      method: "PUT",
      body: JSON.stringify(updates),
    });
  }

  async getProfileCompleteness(): Promise<
    ApiResponse<{ completeness: number }>
  > {
    return this.request("/profile/completeness");
  }

  async updateProfileRole(
    data: UpdateProfileRoleRequestBody
  ): Promise<ApiResponse> {
    return this.request("/profile/role", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  async updateProfileLocation(
    data: UpdateProfileLocationRequestBody
  ): Promise<ApiResponse> {
    return this.request("/profile/location", {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }

  // Dashboard access methods
  async getClientDashboard(): Promise<ApiResponse> {
    return this.request("/profile/client-dashboard");
  }

  async getProviderDashboard(): Promise<ApiResponse> {
    return this.request("/profile/provider-dashboard");
  }

  async getAdminProfiles(): Promise<ApiResponse> {
    return this.request("/profile/admin-profiles");
  }

  async getProfileWithContext(): Promise<
    ApiResponse<{ user: User; profile?: UserProfile }>
  > {
    return this.request("/profile/with-context");
  }

  // OAuth methods
  async googleAuth(data: GoogleAuthRequestBody): Promise<ApiResponse> {
    return this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async appleAuth(data: AppleAuthRequestBody): Promise<ApiResponse> {
    return this.request("/auth/apple", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  async linkProvider(data: LinkProviderRequestBody): Promise<ApiResponse> {
    return this.request("/auth/link-provider", {
      method: "POST",
      body: JSON.stringify(data),
    });
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request("/health");
  }
}

export const apiClient = new ApiClient();
export default apiClient;
