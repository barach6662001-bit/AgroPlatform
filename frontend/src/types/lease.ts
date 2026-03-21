export interface LandLeaseDto {
  id: string;
  fieldId: string;
  fieldName: string;
  ownerName: string;
  ownerPhone?: string;
  contractNumber?: string;
  annualPayment: number;
  paymentType: string;
  grainPaymentTons?: number;
  isActive: boolean;
  contractStartDate: string;
  contractEndDate?: string;
  notes?: string;
}

export interface LeasePaymentDto {
  id: string;
  landLeaseId: string;
  year: number;
  amount: number;
  paymentType: 'Advance' | 'Payment';
  paymentMethod?: string;
  paymentDate: string;
  notes?: string;
}

export interface LeaseSummaryDto {
  landLeaseId: string;
  fieldName: string;
  ownerName: string;
  annualPayment: number;
  advancePaid: number;
  totalPaid: number;
  remaining: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overpaid';
  payments?: LeasePaymentDto[];
}
