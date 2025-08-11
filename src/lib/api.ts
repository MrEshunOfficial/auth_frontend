// lib/api.ts
const getBaseURL = (): string => {
  // In development, proxy through Next.js or direct to backend
  if (process.env.NODE_ENV === "development") {
    return process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";
  }
  // In production, use environment variable
  return process.env.NEXT_PUBLIC_BACKEND_URL || "";
};

interface ApiResponse<T = unknown> {
  message: string;
  user?: unknown;
  token?: string;
  requiresVerification?: boolean;
  email?: string;
  data?: T;
}

interface ApiError {
  message: string;
  status?: number;
  code?: string;
}

class ApiClient {
  private baseURL: string;

  constructor() {
    this.baseURL = getBaseURL();
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Ensure proper URL construction
    const url = `${this.baseURL}/api${endpoint}`;

    console.log("Making request to:", url); // Debug log

    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      credentials: "include", // This ensures cookies are sent
      mode: "cors", // Explicitly set CORS mode
      ...options,
    };

    try {
      const response = await fetch(url, config);

      // Check if response is ok before trying to parse JSON
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

      // Handle network errors
      if (error instanceof TypeError && error.message.includes("fetch")) {
        const networkError: ApiError = {
          message: "Network error. Please check your connection and try again.",
          code: "NETWORK_ERROR",
        };
        throw networkError;
      }

      // Handle CORS errors
      if (error instanceof TypeError && error.message.includes("CORS")) {
        const corsError: ApiError = {
          message: "Connection error. Please try again later.",
          code: "CORS_ERROR",
        };
        throw corsError;
      }

      // Re-throw ApiError objects
      if (typeof error === "object" && error !== null && "message" in error) {
        throw error;
      }

      // Fallback for unknown errors
      const unknownError: ApiError = {
        message: "An unexpected error occurred. Please try again.",
        code: "UNKNOWN_ERROR",
      };
      throw unknownError;
    }
  }

  // Auth methods
  async signup(userData: {
    name: string;
    email: string;
    password: string;
  }): Promise<ApiResponse> {
    return this.request("/auth/signup", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: {
    email: string;
    password: string;
  }): Promise<ApiResponse> {
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

  async getProfile(): Promise<ApiResponse> {
    return this.request("/auth/profile");
  }

  async updateProfile(updates: unknown): Promise<ApiResponse> {
    return this.request("/auth/profile", {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  }

  // Google Auth
  async googleAuth(idToken: string): Promise<ApiResponse> {
    return this.request("/auth/google", {
      method: "POST",
      body: JSON.stringify({ idToken }),
    });
  }

  // Apple Auth
  async appleAuth(idToken: string, user?: unknown): Promise<ApiResponse> {
    return this.request("/auth/apple", {
      method: "POST",
      body: JSON.stringify({ idToken, user }),
    });
  }

  // Link provider
  async linkProvider(provider: string, idToken: string): Promise<ApiResponse> {
    return this.request("/auth/link-provider", {
      method: "POST",
      body: JSON.stringify({ provider, idToken }),
    });
  }

  // Health check method for debugging
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    return this.request("/health");
  }
}

export const apiClient = new ApiClient();
export default apiClient;
export type { ApiResponse, ApiError };
