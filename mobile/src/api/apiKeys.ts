import apiClient from './client';

export interface ApiKeyDto {
  id: string;
  name: string;
  scopes: string;
  expiresAtUtc: string | null;
  lastUsedAtUtc: string | null;
  isRevoked: boolean;
  rateLimitPerHour: number | null;
  createdAtUtc: string;
}

export interface CreateApiKeyRequest {
  name: string;
  scopes: string;
  expiresAtUtc?: string | null;
  rateLimitPerHour?: number | null;
  webhookUrl?: string | null;
  webhookEventTypes?: string | null;
}

export interface CreateApiKeyResponse {
  id: string;
  key: string;
  name: string;
  scopes: string;
  createdAtUtc: string;
}

/**
 * Get all API keys for the current tenant.
 */
export async function getApiKeys(): Promise<ApiKeyDto[]> {
  const response = await apiClient.get<ApiKeyDto[]>('/api/api-keys');
  return response.data;
}

/**
 * Create a new API key.
 * Note: Key is only returned once and cannot be retrieved later.
 */
export async function createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
  const response = await apiClient.post<CreateApiKeyResponse>('/api/api-keys', request);
  return response.data;
}

/**
 * Revoke an API key (cannot be undone).
 */
export async function revokeApiKey(apiKeyId: string): Promise<void> {
  await apiClient.post(`/api/api-keys/${apiKeyId}/revoke`);
}
