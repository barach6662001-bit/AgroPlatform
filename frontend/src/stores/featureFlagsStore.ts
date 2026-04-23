import { create } from 'zustand';
import { getMe } from '../api/me';
import { allOptionalFeatureFlagKeys, type OptionalFeatureFlagKey } from '../features/optionalFeatureFlags';
import { useAuthStore } from './authStore';

type FeatureMap = Record<OptionalFeatureFlagKey, boolean>;

interface FeatureFlagsState {
  features: FeatureMap;
  loaded: boolean;
  loading: boolean;
  loadedForTenantId: string | null;
  fetchFeatureFlags: () => Promise<void>;
  isEnabled: (key: OptionalFeatureFlagKey) => boolean;
  reset: () => void;
}

const emptyFeatures = (): FeatureMap =>
  allOptionalFeatureFlagKeys.reduce((acc, key) => {
    acc[key] = false;
    return acc;
  }, {} as FeatureMap);

export const useFeatureFlagsStore = create<FeatureFlagsState>((set, get) => ({
  features: emptyFeatures(),
  loaded: false,
  loading: false,
  loadedForTenantId: null,

  fetchFeatureFlags: async () => {
    const { token, tenantId } = useAuthStore.getState();
    if (!token || !tenantId) {
      set({ features: emptyFeatures(), loaded: false, loading: false, loadedForTenantId: null });
      return;
    }

    if (get().loading) return;
    if (get().loaded && get().loadedForTenantId === tenantId) return;

    set({ loading: true });
    try {
      const me = await getMe();
      const nextFeatures = emptyFeatures();
      for (const key of allOptionalFeatureFlagKeys) {
        nextFeatures[key] = Boolean(me.features?.[key]);
      }

      set({
        features: nextFeatures,
        loaded: true,
        loading: false,
        loadedForTenantId: tenantId,
      });
    } catch {
      set({ loading: false });
    }
  },

  isEnabled: (key) => Boolean(get().features[key]),

  reset: () => set({ features: emptyFeatures(), loaded: false, loading: false, loadedForTenantId: null }),
}));