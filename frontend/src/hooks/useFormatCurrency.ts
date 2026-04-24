import { useCallback } from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
import type { SupportedCurrency } from '../api/me';
import { currencySymbolFor } from '../utils/format';

export interface FormatCurrencyOptions {
  /** Override target currency; defaults to user's preferred. */
  target?: SupportedCurrency;
  /** Fraction digits for the output amount; defaults 2. */
  fractionDigits?: number;
}

/**
 * Returns a memoised formatter that converts a UAH amount into the user's
 * preferred display currency using the last-known NBU rate.
 *
 * Invariants per ROADMAP "Decisions locked / Currency":
 * - All stored amounts in the DB are UAH.
 * - Conversion happens at presentation only.
 * - Fallback: if the target currency's rate is not loaded yet (or failed),
 *   we return the UAH value labelled as UAH (graceful degrade).
 */
export function useFormatCurrency() {
  const preferredCurrency = useCurrencyStore((s) => s.preferredCurrency);
  const rates = useCurrencyStore((s) => s.rates);

  return useCallback(
    (amountUah: number | null | undefined, opts?: FormatCurrencyOptions): string => {
      const value = typeof amountUah === 'number' && Number.isFinite(amountUah) ? amountUah : 0;
      const target: SupportedCurrency = opts?.target ?? preferredCurrency;
      const fractionDigits = opts?.fractionDigits ?? 2;

      let displayValue = value;
      let displayCode: SupportedCurrency = target;

      if (target === 'UAH') {
        displayValue = value;
      } else {
        const rate = rates[target];
        if (rate && rate > 0) {
          displayValue = value / rate;
        } else {
          // Rate unknown → degrade to UAH. Keeps product usable offline / before load.
          displayCode = 'UAH';
          displayValue = value;
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

/**
 * Returns the symbol ("₴", "$", "€") for the user's current preferred currency.
 * Reactive: consuming components re-render when the preference changes.
 *
 * Use for input suffixes / addonAfters where a short one-char unit is needed:
 *   <InputNumber suffix={useCurrencySymbol()} />
 */
export function useCurrencySymbol(): string {
  const preferredCurrency = useCurrencyStore((s) => s.preferredCurrency);
  return currencySymbolFor(preferredCurrency);
}

/**
 * Returns the resolved display currency code (matches what `useFormatCurrency`
 * would render — falls back to UAH if the rate is not yet loaded).
 */
export function useDisplayCurrencyCode(): SupportedCurrency {
  const preferredCurrency = useCurrencyStore((s) => s.preferredCurrency);
  const rates = useCurrencyStore((s) => s.rates);
  if (preferredCurrency === 'UAH') return 'UAH';
  const rate = rates[preferredCurrency];
  return rate && rate > 0 ? preferredCurrency : 'UAH';
}

/**
 * Returns a numeric converter that turns a UAH amount into the user's preferred
 * currency amount (without formatting). Use with compact formatters (`formatUA`)
 * where the caller needs control over the symbol separately.
 */
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
