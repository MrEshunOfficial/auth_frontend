// File: lib/auth/authClient.ts
// Updated to support token-based authentication

export interface AuthUser {
  id: string;
  role: string;
  email: string | null;
  name: string | null;
  provider?: string | null;
  providerId?: string | null;
  image?: string | null;
}

export interface AuthResponse {
  authenticated: boolean;
  user?: AuthUser;
  sessionId?: string;
  message?: string;
  token?: string;
  authMethod?: string;
}

class AuthClient {
  private authServiceUrl: string;
  private user: AuthUser | null = null;
  private token: string | null = null;
  private checkInterval: NodeJS.Timeout | null = null;

  constructor(authServiceUrl: string) {
    this.authServiceUrl = authServiceUrl;
    // Try to load existing token from localStorage
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth-token');
    }
  }

  /**
   * Check if user is authenticated - tries both cookie and token methods
   */
  async checkAuthentication(): Promise<AuthResponse> {
    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Add token to headers if available
      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.authServiceUrl}/api/auth/verify-session`, {
        method: 'GET',
        credentials: 'include', // Still try cookies first
        headers,
      });

      const data: AuthResponse = await response.json();

      if (response.ok && data.authenticated && data.user) {
        this.user = data.user;
        
        // Store the token for future requests
        if (data.token && typeof window !== 'undefined') {
          this.token = data.token;
          localStorage.setItem('auth-token', data.token);
        }
        
        return {
          authenticated: true,
          user: data.user,
          sessionId: data.sessionId,
          authMethod: data.authMethod
        };
      }

      // If authentication failed and we had a token, clear it
      if (this.token && typeof window !== 'undefined') {
        this.token = null;
        localStorage.removeItem('auth-token');
      }

      this.user = null;
      return {
        authenticated: false,
        message: data.message || 'Not authenticated'
      };

    } catch (error) {
      console.error('Authentication check failed:', error);
      this.user = null;
      
      // Clear token on network errors
      if (this.token && typeof window !== 'undefined') {
        this.token = null;
        localStorage.removeItem('auth-token');
      }
      
      return {
        authenticated: false,
        message: 'Network error during authentication check'
      };
    }
  }

  /**
   * Get current user (cached)
   */
  getCurrentUser(): AuthUser | null {
    return this.user;
  }

  /**
   * Get current auth token
   */
  getToken(): string | null {
    return this.token;
  }

  /**
   * Manually set token (useful after login redirect)
   */
  setToken(token: string): void {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth-token', token);
    }
  }

  /**
   * Redirect to login page
   */
  redirectToLogin(callbackUrl?: string): void {
    const loginUrl = `${this.authServiceUrl}/auth/users/login`;
    const url = callbackUrl 
      ? `${loginUrl}?callbackUrl=${encodeURIComponent(callbackUrl)}`
      : loginUrl;
    
    window.location.href = url;
  }

  /**
   * Login with redirect - goes to auth service for login
   */
  async loginWithRedirect(callbackUrl?: string): Promise<void> {
    // Store the current URL as callback if none provided
    const callback = callbackUrl || window.location.href;
    this.redirectToLogin(callback);
  }

  /**
   * Logout by calling the auth service API endpoint
   */
  async logout(): Promise<void> {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.token) {
        headers['Authorization'] = `Bearer ${this.token}`;
      }

      const response = await fetch(`${this.authServiceUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers,
      });

      if (!response.ok) {
        throw new Error('Logout request failed');
      }

    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      // Always clean up locally
      this.user = null;
      this.token = null;
      this.stopPeriodicCheck();
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('auth-token');
      }
      
      // Redirect to auth service login page
      window.location.href = `${this.authServiceUrl}/auth/users/login`;
    }
  }

  /**
   * Start periodic authentication checking
   */
  startPeriodicCheck(intervalMs: number = 300000): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }

    this.checkInterval = setInterval(async () => {
      const result = await this.checkAuthentication();
      if (!result.authenticated) {
        console.log('Session expired, redirecting to login...');
        this.redirectToLogin(window.location.pathname);
      }
    }, intervalMs);
  }

  /**
   * Stop periodic checking
   */
  stopPeriodicCheck(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    return this.user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    return this.user ? roles.includes(this.user.role) : false;
  }

  /**
   * Check if user is admin or super_admin
   */
  isAdmin(): boolean {
    return this.hasAnyRole(['admin', 'super_admin']);
  }

  /**
   * Make authenticated API request
   */
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return fetch(url, {
      ...options,
      credentials: 'include',
      headers,
    });
  }
}

// Create singleton instance
const authClient = new AuthClient(
  process.env.NEXT_PUBLIC_AUTH_ACCESS_URL || 'https://access-management-xi.vercel.app'
);

export default authClient;