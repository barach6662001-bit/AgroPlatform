import apiClient from './axios';
import type { EmployeeDto, WorkLogDto, SalarySummaryDto } from '../types/hr';

export const getEmployees = (activeOnly?: boolean) =>
  apiClient
    .get<EmployeeDto[]>('/api/employees', { params: { activeOnly } })
    .then((r) => r.data);

export const createEmployee = (data: {
  firstName: string;
  lastName: string;
  position?: string;
  salaryType: string;
  hourlyRate?: number;
  pieceworkRate?: number;
  notes?: string;
}) => apiClient.post<{ id: string }>('/api/employees', data).then((r) => r.data);

export const updateEmployee = (id: string, data: Partial<EmployeeDto>) =>
  apiClient.put(`/api/employees/${id}`, data).then((r) => r.data);

export const deleteEmployee = (id: string) =>
  apiClient.delete(`/api/employees/${id}`).then((r) => r.data);

export const getWorkLogs = (params: { employeeId?: string; month?: number; year?: number }) =>
  apiClient.get<WorkLogDto[]>('/api/worklogs', { params }).then((r) => r.data);

export const createWorkLog = (data: {
  employeeId: string;
  workDate: string;
  hoursWorked?: number;
  unitsProduced?: number;
  workDescription?: string;
  fieldId?: string;
  operationId?: string;
}) => apiClient.post<{ id: string }>('/api/worklogs', data).then((r) => r.data);

export const updateWorkLog = (id: string, data: {
  workDate: string;
  hoursWorked?: number;
  unitsProduced?: number;
  workDescription?: string;
  fieldId?: string;
  operationId?: string;
}) => apiClient.put(`/api/worklogs/${id}`, data).then((r) => r.data);

export const deleteWorkLog = (id: string) =>
  apiClient.delete(`/api/worklogs/${id}`).then((r) => r.data);

export const createSalaryPayment = (data: {
  employeeId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
  notes?: string;
}) => apiClient.post<{ id: string }>('/api/salary-payments', data).then((r) => r.data);

export const getSalarySummary = (month: number, year: number) =>
  apiClient
    .get<SalarySummaryDto[]>('/api/salary-summary', { params: { month, year } })
    .then((r) => r.data);
