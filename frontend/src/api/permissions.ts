import axios from './axios';

export interface PermissionDto {
  id: string;
  module: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  lastReviewedAtUtc?: string;
  notes?: string;
}

export interface UpdatePermissionDto {
  permissionId: string;
  canRead: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  notes?: string;
}

export async function getPermissions(roleId: string): Promise<PermissionDto[]> {
  const response = await axios.get(`/api/permissions/${roleId}`);
  return response.data;
}

export async function updatePermissions(
  roleId: string,
  permissions: UpdatePermissionDto[]
): Promise<void> {
  await axios.put(`/api/permissions/${roleId}`, permissions);
}
