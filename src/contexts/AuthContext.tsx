import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";
import type { User, AuthState, TokenPayload } from "@/types/auth";

const TOKEN_KEY = "auth_token";
const TOKEN_EXPIRY_BUFFER = 60; // Seconds before expiry to consider token expired

interface AuthContextValue extends AuthState {
  login: (credential: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = user !== null;

  // Extract user from token payload
  const getUserFromToken = (payload: TokenPayload): User => ({
    id: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
  });

  // Check if token is expired
  const isTokenExpired = (payload: TokenPayload): boolean => {
    const now = Math.floor(Date.now() / 1000);
    return payload.exp - TOKEN_EXPIRY_BUFFER <= now;
  };

  // Get and validate stored token
  const getValidToken = useCallback((): {
    token: string;
    payload: TokenPayload;
  } | null => {
    const token = Cookies.get(TOKEN_KEY);
    if (!token) return null;

    try {
      const payload = jwtDecode<TokenPayload>(token);
      if (isTokenExpired(payload)) {
        Cookies.remove(TOKEN_KEY);
        return null;
      }
      return { token, payload };
    } catch {
      Cookies.remove(TOKEN_KEY);
      return null;
    }
  }, []);

  // Check authentication status on load
  const checkAuth = useCallback(() => {
    setIsLoading(true);
    const validToken = getValidToken();

    if (validToken) {
      setUser(getUserFromToken(validToken.payload));
    } else {
      setUser(null);
    }

    setIsLoading(false);
  }, [getValidToken]);

  // Login with Google OAuth credential
  const login = useCallback(async (credential: string): Promise<void> => {
    setIsLoading(true);

    try {
      const payload = jwtDecode<TokenPayload>(credential);

      if (isTokenExpired(payload)) {
        throw new Error("Token has expired");
      }

      // Store token in cookie (secure, httpOnly not available client-side)
      // Using SameSite=Strict for CSRF protection
      Cookies.set(TOKEN_KEY, credential, {
        expires: new Date(payload.exp * 1000),
        sameSite: "strict",
        secure: window.location.protocol === "https:",
      });

      setUser(getUserFromToken(payload));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout and clear token
  const logout = useCallback(() => {
    Cookies.remove(TOKEN_KEY);
    setUser(null);
  }, []);

  // Auto-check auth on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextValue = {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
