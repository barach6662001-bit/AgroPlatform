import type { SpacingKey } from '../tokens';

export const space = (key: SpacingKey): string =>
  `var(--space-${String(key).replace('_', '-')})`;

export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');
