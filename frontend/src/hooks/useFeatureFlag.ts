import { useFeatureFlagsStore } from '../stores/featureFlagsStore';
import type { OptionalFeatureFlagKey } from '../features/optionalFeatureFlags';

export function useFeatureFlag(key: OptionalFeatureFlagKey) {
  const enabled = useFeatureFlagsStore((s) => s.features[key]);
  return Boolean(enabled);
}