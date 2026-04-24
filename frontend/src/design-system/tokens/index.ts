/**
 * Design-system tokens — single source of truth.
 *
 * Edit any file in this folder and run `npm run build:tokens` to regenerate
 * `src/styles/tokens.css`.  Never edit `tokens.css` by hand.
 *
 * In TS code, prefer importing from this barrel:
 *   import { tokens, themeTokens, chartColors } from '@/design-system/tokens';
 */

import {
  palette,
  cropColors,
  chartColors,
  semanticDark,
  semanticLight,
} from './colors';
import {
  fontFamilies,
  fontWeights,
  fontScale,
  letterSpacing,
} from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { elevationDark, elevationLight, glow } from './elevation';
import { duration, easing } from './motion';
import { breakpoints, breakpointsPx, media } from './breakpoints';
import { zIndex } from './zIndex';

export * from './colors';
export * from './typography';
export * from './spacing';
export * from './radius';
export * from './elevation';
export * from './motion';
export * from './breakpoints';
export * from './zIndex';

/**
 * Theme-independent tokens (same values across light/dark).
 */
export const tokens = {
  palette,
  cropColors,
  chartColors,
  spacing,
  radius,
  fontFamilies,
  fontWeights,
  fontScale,
  letterSpacing,
  duration,
  easing,
  breakpoints,
  breakpointsPx,
  media,
  zIndex,
  glow,
} as const;

/**
 * Theme-aware tokens — pick by current `data-theme` attribute.
 */
export const themeTokens = {
  dark:  { semantic: semanticDark,  elevation: elevationDark  },
  light: { semantic: semanticLight, elevation: elevationLight },
} as const;

export type ThemeName = keyof typeof themeTokens;
