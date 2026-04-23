import apiClient from './axios';
import type { OptionalFeatureFlagKey } from '../features/optionalFeatureFlags';

export interface MeResponse {
  email: string;
  role: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
  features: Record<OptionalFeatureFlagKey, boolean>;
}

export const getMe = () =>
  apiClient.get<MeResponse>('/api/me').then((r) => r.data);