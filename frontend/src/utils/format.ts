import { useCurrencyStore } from '../stores/currencyStore';
import type { SupportedCurrency } from '../api/me';

const uahFormatter = new Intl.NumberFormat('uk-UA', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const uahFormatterDecimals = new Intl.NumberFormat('uk-UA', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Symbol for a currency code.
 * Kept in sync with the supported set: UAH, USD, EUR.
 */
export function currencySymbolFor(code: SupportedCurrency | string): string {
  switch (code) {
    case 'UAH': return '₴';
    case 'USD': return '$';
    case 'EUR': return '€';
    default:    return code;
  }
}

/**
 * Reads current preferred currency + cached NBU rate from the Zustand store.
 * Returns the converted value and the display code. Non-reactive: call from
 * inside a component that already subscribes to the store (or a hook) to
 * pick up updates.
 */
function resolveDisplay(amountUah: number): { value: number; code: SupportedCurrency } {
  const { preferredCurrency, rates } = useCurrencyStore.getState();
  if (preferredCurrency === 'UAH') return { value: amountUah, code: 'UAH' };
  const rate = rates[preferredCurrency];
  if (!rate || rate <= 0) return { value: amountUah, code: 'UAH' };
  return { value: amountUah / rate, code: preferredCurrency };
}

/**
 * Formats a UAH-denominated amount in the user's preferred display currency.
 *
 * This is a reactive-by-store-read formatter: it reads the current preference
 * each time it is called. Components that consume it should either subscribe
 * to `useCurrencyStore` themselves (to re-render on change) or be remounted
 * via navigation. The `<Money>` component wraps this behaviour properly.
 *
 * Legacy name `formatUAH` kept for backwards compatibility with the many
 * existing call sites; it no longer forces the UAH code.
 *
 * @param value Amount expressed in UAH (base DB currency).
 * @param decimals When true, render with 2 fraction digits; otherwise 0.
 */
export function formatUAH(value: number, decimals = false): string {
  const { value: v, code } = resolveDisplay(value);
  if (code === 'UAH') {
    const formatter = decimals ? uahFormatterDecimals : uahFormatter;
    return `${formatter.format(v)} ₴`;
  }
  return new Intl.NumberFormat('uk-UA', {
    style: 'currency',
    currency: code,
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: decimals ? 2 : 0,
  }).format(v);
}

/** Alias with a neutral name — prefer this in new code. */
export const formatMoney = formatUAH;

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('uk-UA').format(value);
}

export function formatHa(value: number): string {
  return `${new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 }).format(value)} га`;
}

export function formatTons(value: number): string {
  return `${new Intl.NumberFormat('uk-UA', { maximumFractionDigits: 1 }).format(value)} т`;
}
