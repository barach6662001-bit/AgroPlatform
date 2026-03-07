export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  expiresAt: string;
  tenantId: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}
