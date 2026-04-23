export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  expiresAt: string;
  tenantId: string;
  requirePasswordChange: boolean;
  hasCompletedOnboarding: boolean;
  firstName?: string;
  lastName?: string;
  refreshToken?: string;
  refreshTokenExpiresAt?: string;
  isSuperAdmin?: boolean;
  // When true, `token` is empty and `mfaPendingToken` carries a short-lived intermediate JWT
  // that must be exchanged at /api/auth/mfa/verify for a real session.
  mfaRequired?: boolean;
  mfaPendingToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}
