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
  employeeFullName: string;
  workDate: string;
  hoursWorked?: number;
  unitsProduced?: number;
  workDescription?: string;
  fieldId?: string;
  operationId?: string;
  accruedAmount: number;
  isPaid: boolean;
}

export interface SalarySummaryDto {
  employeeId: string;
  employeeFullName: string;
  position?: string;
  totalAccrued: number;
  totalPaid: number;
  debt: number;
}
