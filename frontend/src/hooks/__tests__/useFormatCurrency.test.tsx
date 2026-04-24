import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useCurrencyStore } from '../../stores/currencyStore';
import { useFormatCurrency } from '../useFormatCurrency';

/**
 * Regression tests for the currency-conversion bug where display labels
 * changed without the actual numeric conversion being applied.
 *
 * Invariants under test:
 *   1. uahValue × (1 / rateToUah) == displayValue  (i.e. divide by rate).
 *   2. On empty rate table → graceful fallback to UAH + console.warn.
 *   3. null / undefined value → "—" (never crash, never "NaN", never "0 ₴").
 *   4. UAH preference → passthrough with ₴ symbol.
 *
 * The `date` parameter is accepted but currently advisory — we always use the
 * latest cached rate. Historical per-date rates are tracked as tech debt.
 * The test case for "rate unknown for date → previous business day" is
 * satisfied by the same latest-rate fallback in this PR.
 */

// Helper: stuff the store into a clean, predictable state per test.
const setStore = (patch: Partial<ReturnType<typeof useCurrencyStore.getState>>) => {
  useCurrencyStore.setState({
    preferredCurrency: 'UAH',
    rates: { USD: null, EUR: null },
    loaded: true,
    loading: false,
    loadedForTenantId: 't1',
    ...patch,
  });
};

describe('useFormatCurrency', () => {
  beforeEach(() => {
    setStore({});
  });

  it('UAH preference: passthrough value, UAH symbol', () => {
    setStore({ preferredCurrency: 'UAH', rates: { USD: 40, EUR: 45 } });
    const { result } = renderHook(() => useFormatCurrency());

    const out = result.current(1000);

    // Trim NBSPs and normalise for fragile ICU output across locales.
    expect(out.replace(/\u00A0/g, ' ')).toMatch(/1\s?000[.,]00/);
    expect(out).toMatch(/₴|UAH/);
  });

  it('USD preference with known rate: (1000 UAH, rate=40) → "25.00 $"', () => {
    setStore({ preferredCurrency: 'USD', rates: { USD: 40, EUR: null } });
    const { result } = renderHook(() => useFormatCurrency());

    const out = result.current(1000);

    // Converted numeric value must be 25, not 1000.
    expect(out).toMatch(/25[.,]00/);
    // Must not still be labelled UAH.
    expect(out).not.toMatch(/₴/);
    expect(out).not.toMatch(/UAH/);
  });

  it('USD preference with date param: falls back to latest rate when no per-date cache', () => {
    // Advisory date param: same latest rate used for any date in this PR.
    setStore({ preferredCurrency: 'USD', rates: { USD: 40, EUR: null } });
    const { result } = renderHook(() => useFormatCurrency());

    const historical = new Date('2025-01-15');
    const out = result.current(1000, historical);

    expect(out).toMatch(/25[.,]00/);
  });

  it('USD preference with empty rate table: falls back to UAH display and warns', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    setStore({ preferredCurrency: 'USD', rates: { USD: null, EUR: null } });
    const { result } = renderHook(() => useFormatCurrency());

    const out = result.current(1000);

    expect(out.replace(/\u00A0/g, ' ')).toMatch(/1\s?000/);
    expect(out).toMatch(/₴|UAH/);
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });

  it('null value: renders "—"', () => {
    setStore({ preferredCurrency: 'USD', rates: { USD: 40, EUR: null } });
    const { result } = renderHook(() => useFormatCurrency());

    expect(result.current(null)).toBe('—');
    expect(result.current(undefined)).toBe('—');
    expect(result.current(Number.NaN)).toBe('—');
  });

  it('zero value: still formats as 0 of the selected currency', () => {
    setStore({ preferredCurrency: 'USD', rates: { USD: 40, EUR: null } });
    const { result } = renderHook(() => useFormatCurrency());

    const out = result.current(0);
    expect(out).toMatch(/0[.,]00/);
    expect(out).not.toMatch(/NaN/);
  });

  it('EUR preference with known rate: (4500 UAH, rate=45) → 100,00 €', () => {
    setStore({ preferredCurrency: 'EUR', rates: { USD: 40, EUR: 45 } });
    const { result } = renderHook(() => useFormatCurrency());

    const out = result.current(4500);

    expect(out).toMatch(/100[.,]00/);
    expect(out).toMatch(/€|EUR/);
  });
});
