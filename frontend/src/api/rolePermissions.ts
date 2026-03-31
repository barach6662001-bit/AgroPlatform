import apiClient from './axios';

export interface RolePermissionDto {
  roleName: string;
  policyName: string;
  isGranted: boolean;
}

export interface RolePermissionItem {
  roleName: string;
  policyName: string;
  isGranted: boolean;
}

export const getRolePermissions = () =>
  apiClient.get<RolePermissionDto[]>('/api/admin/role-permissions').then((r) => r.data);

export const updateRolePermissions = (items: RolePermissionItem[]) =>
  apiClient.put('/api/admin/role-permissions', { items });
