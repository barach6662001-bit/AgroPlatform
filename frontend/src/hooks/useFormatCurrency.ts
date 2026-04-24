import { useCallback } from 'react';
import { useCurrencyStore } from '../stores/currencyStore';
import type { SupportedCurrency } from '../api/me';

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
