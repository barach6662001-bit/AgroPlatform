import apiClient from './axios';
import type { SupportedCurrency } from './me';

export interface ExchangeRateDto {
  code: 'USD' | 'EUR';
  date: string; // ISO date
  rateToUah: number;
}

export interface CurrencyPreferences {
  preferredCurrency: SupportedCurrency;
}

export const getLatestRates = () =>
  apiClient.get<ExchangeRateDto[]>('/api/currency/rates/latest').then((r) => r.data);

export const getPreferences = () =>
  apiClient.get<CurrencyPreferences>('/api/currency/preferences').then((r) => r.data);

export const updatePreferences = (preferredCurrency: SupportedCurrency) =>
  apiClient
    .put<CurrencyPreferences>('/api/currency/preferences', { preferredCurrency })
    .then((r) => r.data);
