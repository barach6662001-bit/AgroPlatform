import { useCallback } from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
import type { SupportedCurrency } from '../api/me';
import { currencySymbolFor } from '../utils/format';

export interface FormatCurrencyOptions {
  target?: SupportedCurrency;
  fractionDigits?: number;
  date?: Date;
}

type FormatCurrencyArg = FormatCurrencyOptions | Date | undefined;

let warnedEmptyRates = false;

export function useFormatCurrency() {
  const preferredCurrency = useCurrencyStore((s) => s.preferredCurrency);
  const rates = useCurrencyStore((s) => s.rates);

  return useCallback(
    (amountUah: number | null | undefined, arg?: FormatCurrencyArg): string => {
      if (amountUah === null || amountUah === undefined || !Number.isFinite(amountUah)) {
        return '—';
      }

      const opts: FormatCurrencyOptions =
        arg instanceof Date ? { date: arg } : (arg ?? {});

      const target: SupportedCurrency = opts.target ?? preferredCurrency;
      const fractionDigits = opts.fractionDigits ?? 2;

      let displayValue = amountUah;
      let displayCode: SupportedCurrency = target;

      if (target !== 'UAH') {
        const rate = rates[target];
        if (rate && rate > 0) {
          displayValue = amountUah / rate;
        } else {
          if (!warnedEmptyRates) {
            warnedEmptyRates = true;
            // eslint-disable-next-line no-console
            console.warn(
              `[useFormatCurrency] No NBU rate available for ${target}; falling back to UAH display.`
            );
          }
          displayCode = 'UAH';
          displayValue = amountUah;
        }
      }

      return new Intl.NumberFormat('uk-UA', {
        style: 'currency',
        currency: displayCode,
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
      }).format(displayValue);
    },
    [preferredCurrency, rates]
  );
}

export function useCurrencySymbol(): string {
  const preferredCurrency = useCurrencyStore((s) => s.preferredCurrency);
  return currencySymbolFor(preferredCurrency);
}

export function useDisplayCurrencyCode(): SupportedCurrency {
  const preferredCurrency = useCurrencyStore((s) => s.preferredCurrency);
  const rates = useCurrencyStore((s) => s.rates);
  if (preferredCurrency === 'UAH') return 'UAH';
  const rate = rates[preferredCurrency];
  return rate && rate > 0 ? preferredCurrency : 'UAH';
}

export function useConvertFromUah(): (amountUah: number) => number {
  const preferredCurrency = useCurrencyStore((s) => s.preferredCurrency);
  const rates = useCurrencyStore((s) => s.rates);
  return (amountUah: number) => {
    if (preferredCurrency === 'UAH') return amountUah;
    const rate = rates[preferredCurrency];
    if (!rate || rate <= 0) return amountUah;
    return amountUah / rate;
  };
}
