import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type Ref } from 'react';
import type { SpacingKey } from '../tokens';
import { cx, space } from './utils';
import s from './Surface.module.css';

type SurfaceAs =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav';

/**
 * Visual surface variant — drives the background token only.
 *
 * - `subtle`   → `--card-bg`     (translucent over the page; default for cards)
 * - `raised`   → `--bg-elevated` (opaque step above the page)
 * - `flat`     → transparent     (use when only border/padding is wanted)
 */
export type SurfaceVariant = 'subtle' | 'raised' | 'flat';

/**
 * Border radius scale, mapped 1:1 onto the `--radius-*` tokens.
 */
export type SurfaceRadius = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

/**
 * Elevation step — maps onto the `--shadow-N` tokens. `0` is no shadow.
 */
export type SurfaceElevation = 0 | 1 | 2 | 3 | 4;

const VARIANT_BG: Record<SurfaceVariant, string | undefined> = {
  subtle: 'var(--card-bg)',
  raised: 'var(--bg-elevated)',
  flat: undefined,
};

const RADIUS: Record<SurfaceRadius, string> = {
  sm: 'var(--radius-sm)',
  md: 'var(--radius-md)',
  lg: 'var(--radius-lg)',
  xl: 'var(--radius-xl)',
  '2xl': 'var(--radius-2xl)',
};

const ELEVATION: Record<SurfaceElevation, string> = {
  0: 'var(--shadow-0)',
  1: 'var(--shadow-1)',
  2: 'var(--shadow-2)',
  3: 'var(--shadow-3)',
  4: 'var(--shadow-4)',
};

export interface SurfaceProps extends HTMLAttributes<HTMLElement> {
  as?: SurfaceAs;
  /** Background variant. Default `'subtle'`. */
  variant?: SurfaceVariant;
  /** When true, draws a 1 px `--border` outline. Default `true`. */
  bordered?: boolean;
  /** Border radius token. Default `'lg'`. */
  radius?: SurfaceRadius;
  /** Drop-shadow elevation token. Default `0` (none). */
  elevation?: SurfaceElevation;
  /** When true, applies hover/focus background and border tokens. */
  interactive?: boolean;
  /** Padding on all sides. */
  p?: SpacingKey;
  /** Horizontal padding (left + right). */
  px?: SpacingKey;
  /** Vertical padding (top + bottom). */
  py?: SpacingKey;
  pt?: SpacingKey;
  pr?: SpacingKey;
  pb?: SpacingKey;
  pl?: SpacingKey;
}

/**
 * Surface — the design system's primitive container.
 *
 * Encapsulates the four properties that distinguish a "panel" in this
 * design language: **background**, **border**, **radius**, and **elevation**
 * — every value sourced from a token, no magic numbers.
 *
 * Use `Surface` when you need a styled container without card semantics
 * (e.g. an inline callout, a sidebar region). Prefer `Card` for the
 * standard dashboard / form surface, which is just a `Surface` with
 * sensible card defaults.
 */
export const Surface = forwardRef<HTMLElement, SurfaceProps>(function Surface(
  {
    as = 'div',
    variant = 'subtle',
    bordered = true,
    radius = 'lg',
    elevation = 0,
    interactive = false,
    p, px, py, pt, pr, pb, pl,
    className, style, children, ...rest
  },
  ref,
) {
  const Component = as as ElementType;
  const inline: CSSProperties = {
    ...style,
    background: VARIANT_BG[variant],
    border: bordered ? '1px solid var(--border)' : undefined,
    borderRadius: RADIUS[radius],
    boxShadow: ELEVATION[elevation],
  };

  if (p !== undefined) inline.padding = space(p);
  if (px !== undefined) { inline.paddingLeft = space(px); inline.paddingRight = space(px); }
  if (py !== undefined) { inline.paddingTop = space(py); inline.paddingBottom = space(py); }
  if (pt !== undefined) inline.paddingTop = space(pt);
  if (pr !== undefined) inline.paddingRight = space(pr);
  if (pb !== undefined) inline.paddingBottom = space(pb);
  if (pl !== undefined) inline.paddingLeft = space(pl);

  return (
    <Component
      ref={ref as Ref<HTMLElement>}
      className={cx(s.surface, className)}
      data-variant={variant}
      data-interactive={interactive ? 'true' : undefined}
      data-bordered={bordered ? 'true' : 'false'}
      style={inline}
      {...rest}
    >
      {children}
    </Component>
  );
});
