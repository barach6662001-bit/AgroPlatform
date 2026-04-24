import { create } from 'zustand';
import { getLatestRates, getPreferences, updatePreferences, type ExchangeRateDto } from '../api/currency';
import type { SupportedCurrency } from '../api/me';
import { useAuthStore } from './authStore';

interface CurrencyState {
  preferredCurrency: SupportedCurrency;
  rates: Record<'USD' | 'EUR', number | null>;
  loaded: boolean;
  loading: boolean;
  loadedForTenantId: string | null;

  load: () => Promise<void>;
  setPreferredCurrency: (c: SupportedCurrency) => Promise<void>;
  reset: () => void;
}

const emptyRates = (): Record<'USD' | 'EUR', number | null> => ({ USD: null, EUR: null });

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  preferredCurrency: 'UAH',
  rates: emptyRates(),
  loaded: false,
  loading: false,
  loadedForTenantId: null,

  load: async () => {
    const { token, tenantId } = useAuthStore.getState();
    if (!token || !tenantId) {
      set({ preferredCurrency: 'UAH', rates: emptyRates(), loaded: false, loading: false, loadedForTenantId: null });
      return;
    }
    if (get().loading) return;
    if (get().loaded && get().loadedForTenantId === tenantId) return;

    set({ loading: true });
    try {
      const [prefs, rates] = await Promise.all([getPreferences(), getLatestRates()]);
      const next = emptyRates();
      for (const r of rates as ExchangeRateDto[]) {
        if (r.code === 'USD' || r.code === 'EUR') next[r.code] = r.rateToUah;
      }
      // HOTFIX (PR #628 follow-up): currency conversion is under repair — force UAH
      // display for all users and reset any stale USD/EUR preference server-side so
      // that numeric values are not mislabelled. See docs/ROADMAP.md "Currency".
      if (prefs.preferredCurrency !== 'UAH') {
        try { await updatePreferences('UAH'); } catch { /* ignore — will retry next login */ }
      }
      set({
        preferredCurrency: 'UAH',
        rates: next,
        loaded: true,
        loading: false,
        loadedForTenantId: tenantId,
      });
    } catch {
      set({ loading: false });
    }
  },

  setPreferredCurrency: async (c) => {
    // HOTFIX: switcher is disabled in UI; always persist UAH.
    const forced: SupportedCurrency = 'UAH';
    const prev = get().preferredCurrency;
    set({ preferredCurrency: forced });
    try {
      await updatePreferences(forced);
      void c;
    } catch (e) {
      set({ preferredCurrency: prev });
      throw e;
    }
  },

  reset: () => set({ preferredCurrency: 'UAH', rates: emptyRates(), loaded: false, loading: false, loadedForTenantId: null }),
}));
