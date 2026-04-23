import axios from 'axios';
import apiClient from './axios';
import type { AuthResponse } from '../types/auth';

/** Used during /setup-mfa — starts the TOTP enrollment flow. */
export interface MfaSetupResponse {
  secret: string;
  otpAuthUri: string;
}

export const mfaSetup = () =>
  apiClient.post<MfaSetupResponse>('/api/auth/mfa/setup').then((r) => r.data);

export const mfaEnable = (code: string) =>
  apiClient
    .post<{ backupCodes: string[] }>('/api/auth/mfa/enable', { code })
    .then((r) => r.data);

export interface MfaVerifyRequest {
  mfaPendingToken: string;
  code?: string;
  backupCode?: string;
}

/**
 * Verify endpoint is [AllowAnonymous] on the server; we call it with a plain axios instance
 * so the intermediate token is not attached as a Bearer header by the shared client.
 */
export const mfaVerify = (payload: MfaVerifyRequest) =>
  axios
    .post<AuthResponse>('/api/auth/mfa/verify', payload, {
      baseURL: apiClient.defaults.baseURL,
    })
    .then((r) => r.data);

export const mfaRegenerateBackupCodes = () =>
  apiClient
    .post<{ backupCodes: string[] }>('/api/auth/mfa/regenerate-backup-codes')
    .then((r) => r.data);
