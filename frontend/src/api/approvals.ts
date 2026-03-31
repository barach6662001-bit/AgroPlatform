import apiClient from './axios';

export interface ApprovalRuleDto {
  id: string;
  entityType: string;
  actionType: number;
  threshold: number;
  requiredRole: string;
}

export interface ApprovalRequestDto {
  id: string;
  entityType: string;
  entityId: string | null;
  actionType: number;
  payload: string;
  status: number;
  requestedBy: string | null;
  decidedBy: string | null;
  decidedAtUtc: string | null;
  rejectionReason: string | null;
  amount: number;
  createdAtUtc: string;
}

export const getApprovalRules = () =>
  apiClient.get<ApprovalRuleDto[]>('/api/approvals/rules').then((r) => r.data);

export const createApprovalRule = (data: Omit<ApprovalRuleDto, 'id'>) =>
  apiClient.post<{ id: string }>('/api/approvals/rules', data).then((r) => r.data);

export const updateApprovalRule = (id: string, data: ApprovalRuleDto) =>
  apiClient.put(`/api/approvals/rules/${id}`, data);

export const deleteApprovalRule = (id: string) =>
  apiClient.delete(`/api/approvals/rules/${id}`);

export const getPendingApprovals = () =>
  apiClient.get<ApprovalRequestDto[]>('/api/approvals/pending').then((r) => r.data);

export const getAllApprovals = (status?: number) =>
  apiClient.get<ApprovalRequestDto[]>('/api/approvals', { params: status !== undefined ? { status } : {} }).then((r) => r.data);

export const approveRequest = (id: string) =>
  apiClient.post(`/api/approvals/${id}/approve`).then((r) => r.data);

export const rejectRequest = (id: string, reason?: string) =>
  apiClient.post(`/api/approvals/${id}/reject`, { reason }).then((r) => r.data);
