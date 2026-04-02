import apiClient from './axios';

export interface MyPermissionsDto {
  role: string;
  permissions: string[];
}

export const getMyPermissions = () =>
  apiClient.get<MyPermissionsDto>('/api/admin/role-permissions/my').then((r) => r.data);
