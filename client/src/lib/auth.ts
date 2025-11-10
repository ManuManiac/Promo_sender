import { startRegistration, startAuthentication } from "@simplewebauthn/browser";
import type { RegistrationResponseJSON, AuthenticationResponseJSON } from "@simplewebauthn/types";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  user: AuthUser;
}

// Register with email/password
export async function register(email: string, password: string, name: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Registration failed");
  }

  return response.json();
}

// Login with email/password
export async function login(email: string, password: string): Promise<AuthResponse> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Login failed");
  }

  return response.json();
}

// Logout
export async function logout(): Promise<void> {
  await fetch("/api/auth/logout", {
    method: "POST",
  });
}

// Get current user
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const response = await fetch("/api/auth/user");
    if (!response.ok) return null;
    const data = await response.json();
    return data.user;
  } catch {
    return null;
  }
}

// Register a passkey
export async function registerPasskey(): Promise<boolean> {
  try {
    // Get registration options
    const optionsResponse = await fetch("/api/auth/passkey/register/options", {
      method: "POST",
    });
    
    if (!optionsResponse.ok) {
      throw new Error("Failed to get registration options");
    }

    const options = await optionsResponse.json();

    // Start registration with browser
    const registrationResponse = await startRegistration(options);

    // Verify registration
    const verifyResponse = await fetch("/api/auth/passkey/register/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(registrationResponse),
    });

    if (!verifyResponse.ok) {
      throw new Error("Passkey registration failed");
    }

    const verification = await verifyResponse.json();
    return verification.verified;
  } catch (error: any) {
    console.error("Passkey registration error:", error);
    throw error;
  }
}

// Login with passkey
export async function loginWithPasskey(email?: string): Promise<AuthResponse> {
  try {
    // Get authentication options
    const optionsResponse = await fetch("/api/auth/passkey/login/options", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    if (!optionsResponse.ok) {
      throw new Error("Failed to get authentication options");
    }

    const { challengeId, ...options } = await optionsResponse.json();

    // Start authentication with browser
    const authResponse = await startAuthentication(options);

    // Verify authentication
    const verifyResponse = await fetch("/api/auth/passkey/login/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ response: authResponse, challengeId }),
    });

    if (!verifyResponse.ok) {
      const error = await verifyResponse.json();
      throw new Error(error.message || "Passkey authentication failed");
    }

    return verifyResponse.json();
  } catch (error: any) {
    console.error("Passkey authentication error:", error);
    throw error;
  }
}
