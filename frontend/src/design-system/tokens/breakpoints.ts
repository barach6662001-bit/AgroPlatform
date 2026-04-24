/**
 * Responsive breakpoints (mobile-first min-widths).
 *
 * Conventions:
 *   xs   — large phone, landscape
 *   sm   — small tablet
 *   md   — tablet
 *   lg   — small desktop / laptop (sidebar collapses below this)
 *   xl   — desktop
 *   2xl  — wide desktop / dashboard density floor
 */

export const breakpoints = {
  xs:  '480px',
  sm:  '640px',
  md:  '768px',
  lg:  '1024px',
  xl:  '1280px',
  '2xl': '1536px',
} as const;

export const breakpointsPx = {
  xs:  480,
  sm:  640,
  md:  768,
  lg:  1024,
  xl:  1280,
  '2xl': 1536,
} as const;

export type BreakpointKey = keyof typeof breakpoints;

/**
 * Pre-baked media-query strings — for use in CSS-in-JS or template literals.
 * Use container queries for component-level breakpoints where possible.
 */
export const media = {
  xs:  `(min-width: ${breakpoints.xs})`,
  sm:  `(min-width: ${breakpoints.sm})`,
  md:  `(min-width: ${breakpoints.md})`,
  lg:  `(min-width: ${breakpoints.lg})`,
  xl:  `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
  hover: '(hover: hover) and (pointer: fine)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  prefersDark: '(prefers-color-scheme: dark)',
  prefersLight: '(prefers-color-scheme: light)',
} as const;
