import type { ReactNode } from 'react';
import NotFound from '../pages/NotFound';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import type { OptionalFeatureFlagKey } from '../features/optionalFeatureFlags';

interface FeatureFlagGateProps {
  feature: OptionalFeatureFlagKey;
  children: ReactNode;
  fallback?: ReactNode;
}

export default function FeatureFlagGate({ feature, children, fallback }: FeatureFlagGateProps) {
  const enabled = useFeatureFlag(feature);
  if (!enabled) {
    return <>{fallback ?? <NotFound />}</>;
  }

  return <>{children}</>;
}