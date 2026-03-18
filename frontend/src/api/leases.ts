import apiClient from './axios';
import type { LandLeaseDto, LeaseSummaryDto } from '../types/lease';

export const getLeases = (fieldId?: string) =>
  apiClient.get<LandLeaseDto[]>('/api/land-leases', { params: { fieldId } }).then((r) => r.data);

export const getLeaseSummary = (year: number) =>
  apiClient.get<LeaseSummaryDto[]>('/api/land-leases/summary', { params: { year } }).then((r) => r.data);

export const createLease = (data: {
  fieldId: string;
  ownerName: string;
  ownerPhone?: string;
  contractNumber?: string;
  annualPayment: number;
  paymentType: string;
  grainPaymentTons?: number;
  contractStartDate: string;
  contractEndDate?: string;
  notes?: string;
}) => apiClient.post<{ id: string }>('/api/land-leases', data).then((r) => r.data);

export const addLeasePayment = (
  leaseId: string,
  data: {
    year: number;
    amount: number;
    paymentType: string;
    paymentDate: string;
    notes?: string;
  }
) => apiClient.post<{ id: string }>(`/api/land-leases/${leaseId}/payments`, data).then((r) => r.data);

export const updateLease = (
  id: string,
  data: {
    ownerName: string;
    ownerPhone?: string;
    contractNumber?: string;
    annualPayment: number;
    paymentType: string;
    grainPaymentTons?: number;
    contractEndDate?: string;
    notes?: string;
    isActive: boolean;
  }
) => apiClient.put<void>(`/api/land-leases/${id}`, data).then((r) => r.data);
