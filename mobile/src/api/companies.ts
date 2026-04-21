import apiClient from './client';

export interface CompanyDto {
  id: string;
  name: string;
  companyName?: string;
  edrpou?: string;
  address?: string;
  phone?: string;
  isActive: boolean;
  userCount: number;
  createdAtUtc: string;
}

export interface CompanyUserDto {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive: boolean;
  requirePasswordChange: boolean;
}

export interface CreateCompanyRequest {
  name: string;
  companyName?: string;
  edrpou?: string;
  address?: string;
  phone?: string;
}

export interface CreateUserRequest {
  tenantId: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role: string;
}

export const getCompanies = () =>
  apiClient.get<CompanyDto[]>('/api/companies').then((r) => r.data);

export const createCompany = (data: CreateCompanyRequest) =>
  apiClient.post<CompanyDto>('/api/companies', data).then((r) => r.data);

export const updateCompany = (id: string, data: CreateCompanyRequest) =>
  apiClient.put(`/api/companies/${id}`, { id, ...data });

export const deactivateCompany = (id: string) =>
  apiClient.delete(`/api/companies/${id}`);

export const getCompanyUsers = (id: string) =>
  apiClient.get<CompanyUserDto[]>(`/api/companies/${id}/users`).then((r) => r.data);

export const createUser = (companyId: string, data: CreateUserRequest) =>
  apiClient.post<CompanyUserDto>(`/api/companies/${companyId}/users`, data).then((r) => r.data);

export const deactivateUser = (userId: string) =>
  apiClient.delete(`/api/companies/users/${userId}`);

export const activateUser = (userId: string) =>
  apiClient.post(`/api/companies/users/${userId}/activate`);

export const deleteUser = (userId: string) =>
  apiClient.delete(`/api/companies/users/${userId}/permanent`);

export const updateUserRole = (userId: string, role: string) =>
  apiClient.put(`/api/companies/users/${userId}/role`, { userId, role });

export const deleteCompany = (id: string) =>
  apiClient.delete(`/api/companies/${id}/permanent`);
