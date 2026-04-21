export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  expiresAt: string;
  tenantId: string;
  requirePasswordChange: boolean;
  firstName?: string;
  lastName?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}
