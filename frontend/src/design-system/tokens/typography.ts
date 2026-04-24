/**
 * Typography tokens.
 *
 * Type scale uses clamp() for fluid responsive sizing across breakpoints.
 * Lower bound = mobile size, upper bound = desktop size.
 */

export const fontFamilies = {
  sans:    "'Geist', 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  mono:    "'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace",
  tabular: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
} as const;

export const fontWeights = {
  normal:    400,
  medium:    500,
  semibold:  600,
  bold:      700,
} as const;

/**
 * Fluid type scale — `clamp(min, preferred, max)`.
 * - `min` = floor on small viewports (≤ 360 px ish)
 * - `max` = ceiling on large viewports (≥ 1280 px ish)
 */
export interface FontStep {
  size: string;
  lineHeight: number | string;
  weight?: number;
  letterSpacing?: string;
  textTransform?: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
}

export const fontScale: Record<string, FontStep> = {
  // Body
  xs:      { size: 'clamp(11px, 0.69rem + 0.05vw, 12px)', lineHeight: 1.4 },
  sm:      { size: 'clamp(12px, 0.75rem + 0.06vw, 13px)', lineHeight: 1.5 },
  base:    { size: 'clamp(13px, 0.81rem + 0.07vw, 14px)', lineHeight: 1.5 },
  md:      { size: 'clamp(14px, 0.88rem + 0.08vw, 15px)', lineHeight: 1.5 },
  lg:      { size: 'clamp(15px, 0.94rem + 0.10vw, 17px)', lineHeight: 1.45 },

  // Headings
  h4:      { size: 'clamp(15px, 0.94rem + 0.15vw, 17px)', lineHeight: 1.35, weight: 600 },
  h3:      { size: 'clamp(17px, 1.05rem + 0.20vw, 19px)', lineHeight: 1.30, weight: 600 },
  h2:      { size: 'clamp(20px, 1.20rem + 0.45vw, 24px)', lineHeight: 1.25, weight: 600 },
  h1:      { size: 'clamp(24px, 1.50rem + 0.60vw, 32px)', lineHeight: 1.20, weight: 700, letterSpacing: '-0.01em' },
  display: { size: 'clamp(28px, 1.75rem + 1.00vw, 40px)', lineHeight: 1.10, weight: 700, letterSpacing: '-0.02em' },

  // Specials
  eyebrow: {
    size: '11px',
    lineHeight: 1.2,
    weight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
};

export const letterSpacing = {
  tighter: '-0.02em',
  tight:   '-0.01em',
  normal:  '0',
  wide:    '0.04em',
  wider:   '0.08em',
} as const;

export type FontScaleKey = keyof typeof fontScale;
