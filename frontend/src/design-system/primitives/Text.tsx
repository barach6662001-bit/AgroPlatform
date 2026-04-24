import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type Ref } from 'react';
import { cx } from './utils';
import s from './Text.module.css';

export type TextSize = 'xs' | 'sm' | 'base' | 'md' | 'lg';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextTone =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent';
export type TextAlign = 'left' | 'center' | 'right';

type TextAs = 'p' | 'span' | 'div' | 'small' | 'strong' | 'em' | 'label' | 'figcaption';

const SIZE_VARS: Record<
  TextSize,
  { size: string; lh: string }
> = {
  xs:   { size: 'var(--font-size-xs)',   lh: 'var(--line-height-xs)' },
  sm:   { size: 'var(--font-size-sm)',   lh: 'var(--line-height-sm)' },
  base: { size: 'var(--font-size-base)', lh: 'var(--line-height-base)' },
  md:   { size: 'var(--font-size-md)',   lh: 'var(--line-height-md)' },
  lg:   { size: 'var(--font-size-lg)',   lh: 'var(--line-height-lg)' },
};

const WEIGHT_VAR: Record<TextWeight, string> = {
  normal:   'var(--font-weight-normal)',
  medium:   'var(--font-weight-medium)',
  semibold: 'var(--font-weight-semibold)',
  bold:     'var(--font-weight-bold)',
};

export interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: TextAs;
  size?: TextSize;
  weight?: TextWeight;
  tone?: TextTone;
  align?: TextAlign;
  /** Render with the monospace family. */
  mono?: boolean;
  /** Enable `font-variant-numeric: tabular-nums`. */
  tabular?: boolean;
  /** Single-line ellipsis truncation. */
  truncate?: boolean;
  /** Multi-line clamp (2 / 3 / 4 lines). */
  clamp?: 2 | 3 | 4;
}

/**
 * Text — body and inline copy primitive.
 *
 * All visual aspects (size, weight, color tone, alignment, truncation)
 * are tokenised. Pick `as` based on document semantics, never on visuals.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  {
    as = 'p',
    size = 'base',
    weight = 'normal',
    tone,
    align,
    mono,
    tabular,
    truncate,
    clamp,
    className,
    style,
    children,
    ...rest
  },
  ref,
) {
  const Component = as as ElementType;
  const scale = SIZE_VARS[size];
  const inline: CSSProperties = {
    ...style,
    ['--ds-text-size'   as string]: scale.size,
    ['--ds-text-lh'     as string]: scale.lh,
    ['--ds-text-weight' as string]: WEIGHT_VAR[weight],
  };

  return (
    <Component
      ref={ref as Ref<HTMLElement>}
      className={cx(s.text, className)}
      data-tone={tone}
      data-align={align}
      data-mono={mono ? 'true' : undefined}
      data-tabular={tabular ? 'true' : undefined}
      data-truncate={truncate ? 'true' : undefined}
      data-clamp={clamp ? String(clamp) : undefined}
      style={inline}
      {...rest}
    >
      {children}
    </Component>
  );
});
