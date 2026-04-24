/**
 * Border-radius tokens.
 * `pill` is the canonical name for fully-rounded chips/badges.
 */

export const radius = {
  none:  '0',
  xs:    '4px',
  sm:    '6px',
  md:    '8px',
  lg:    '12px',
  xl:    '16px',
  '2xl': '24px',
  pill:  '9999px',
  full:  '9999px',
} as const;

export type RadiusKey = keyof typeof radius;
