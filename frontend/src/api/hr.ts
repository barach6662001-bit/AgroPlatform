import apiClient from './axios';

export interface EmployeeDto {
  id: string;
  firstName: string;
  lastName: string;
  position?: string;
  salaryType: 'Hourly' | 'Piecework';
  hourlyRate?: number;
  pieceworkRate?: number;
  isActive: boolean;
  notes?: string;
}

export interface WorkLogDto {
  id: string;
  employeeId: string;
  employeeName: string;
  workDate: string;
  hoursWorked?: number;
  unitsProduced?: number;
  workDescription?: string;
  fieldId?: string;
  operationId?: string;
  accruedAmount: number;
  isPaid: boolean;
}

export interface SalaryPaymentDto {
  id: string;
  employeeId: string;
  employeeName: string;
  amount: number;
  paymentDate: string;
  paymentType: 'Salary' | 'Advance';
  notes?: string;
}

export interface SalarySummaryItemDto {
  employeeId: string;
  employeeName: string;
  totalAccrued: number;
  totalPaid: number;
  debt: number;
}

export interface SalarySummaryDto {
  month: number;
  year: number;
  items: SalarySummaryItemDto[];
  totalAccrued: number;
  totalPaid: number;
  totalDebt: number;
}

export const getEmployees = (params?: { activeOnly?: boolean }) =>
  apiClient.get<EmployeeDto[]>('/api/employees', { params }).then((r) => r.data);

export const createEmployee = (data: {
  firstName: string;
  lastName: string;
  position?: string;
  salaryType: string;
  hourlyRate?: number;
  pieceworkRate?: number;
  notes?: string;
}) => apiClient.post<EmployeeDto>('/api/employees', data).then((r) => r.data);

export const getWorkLogs = (params?: { employeeId?: string; month?: number; year?: number }) =>
  apiClient.get<WorkLogDto[]>('/api/worklogs', { params }).then((r) => r.data);

export const createWorkLog = (data: {
  employeeId: string;
  workDate: string;
  hoursWorked?: number;
  unitsProduced?: number;
  workDescription?: string;
  fieldId?: string;
  operationId?: string;
}) => apiClient.post<WorkLogDto>('/api/worklogs', data).then((r) => r.data);

export const createSalaryPayment = (data: {
  employeeId: string;
  amount: number;
  paymentDate: string;
  paymentType: string;
  notes?: string;
}) => apiClient.post<SalaryPaymentDto>('/api/salary-payments', data).then((r) => r.data);

export const getSalarySummary = (params?: { month?: number; year?: number }) =>
  apiClient.get<SalarySummaryDto>('/api/salary-summary', { params }).then((r) => r.data);
