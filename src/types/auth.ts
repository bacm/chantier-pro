// User information from authentication
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

// Authentication state managed by AuthContext
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Response from login/authentication flow
export interface LoginResponse {
  user: User;
  token: string;
  expiresAt: number;
}

// Decoded JWT token payload from Google OAuth
export interface TokenPayload {
  sub: string; // Google user ID
  email: string;
  name: string;
  picture?: string;
  exp: number; // Expiration timestamp
  iat: number; // Issued at timestamp
}
