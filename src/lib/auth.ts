import { jwtDecode } from "jwt-decode";
import type { TokenPayload } from "@/types/auth";

// Google OAuth Configuration
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";

// Token configuration
export const TOKEN_KEY = "auth_token";
export const TOKEN_EXPIRY_BUFFER = 60; // Seconds before expiry to consider token expired

// Validate that required environment variables are set
export function validateAuthConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!GOOGLE_CLIENT_ID) {
    errors.push("VITE_GOOGLE_CLIENT_ID is not set");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

// Check if token is expired
export function isTokenExpired(payload: TokenPayload): boolean {
  const now = Math.floor(Date.now() / 1000);
  return payload.exp - TOKEN_EXPIRY_BUFFER <= now;
}

// Decode and validate a JWT token
export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwtDecode<TokenPayload>(token);
  } catch {
    return null;
  }
}

// Validate a JWT token (decode + check expiration)
export function validateToken(token: string): {
  valid: boolean;
  payload: TokenPayload | null;
  error?: string;
} {
  const payload = decodeToken(token);

  if (!payload) {
    return { valid: false, payload: null, error: "Invalid token format" };
  }

  if (isTokenExpired(payload)) {
    return { valid: false, payload: null, error: "Token has expired" };
  }

  return { valid: true, payload };
}

// Get token expiration date
export function getTokenExpirationDate(payload: TokenPayload): Date {
  return new Date(payload.exp * 1000);
}

// Calculate remaining time until token expires (in seconds)
export function getTokenRemainingTime(payload: TokenPayload): number {
  const now = Math.floor(Date.now() / 1000);
  return Math.max(0, payload.exp - now);
}
