import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type Ref } from 'react';
import { cx } from './utils';
import s from './Heading.module.css';

export type HeadingLevel = 1 | 2 | 3 | 4 | 'display';
export type HeadingWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type HeadingTone = 'default' | 'muted' | 'subtle';
export type HeadingAlign = 'left' | 'center' | 'right';

type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

const SCALE: Record<
  HeadingLevel,
  { size: string; lh: string; weight: string; tracking: string; tag: HeadingTag }
> = {
  display: {
    size: 'var(--font-size-display)',
    lh: 'var(--line-height-display)',
    weight: 'var(--font-weight-display-step, var(--font-weight-bold))',
    tracking: 'var(--letter-spacing-display, -0.02em)',
    tag: 'h1',
  },
  1: {
    size: 'var(--font-size-h1)',
    lh: 'var(--line-height-h1)',
    weight: 'var(--font-weight-h1-step, var(--font-weight-bold))',
    tracking: 'var(--letter-spacing-h1, -0.01em)',
    tag: 'h1',
  },
  2: {
    size: 'var(--font-size-h2)',
    lh: 'var(--line-height-h2)',
    weight: 'var(--font-weight-h2-step, var(--font-weight-semibold))',
    tracking: 'normal',
    tag: 'h2',
  },
  3: {
    size: 'var(--font-size-h3)',
    lh: 'var(--line-height-h3)',
    weight: 'var(--font-weight-h3-step, var(--font-weight-semibold))',
    tracking: 'normal',
    tag: 'h3',
  },
  4: {
    size: 'var(--font-size-h4)',
    lh: 'var(--line-height-h4)',
    weight: 'var(--font-weight-h4-step, var(--font-weight-semibold))',
    tracking: 'normal',
    tag: 'h4',
  },
};

const WEIGHT_VAR: Record<HeadingWeight, string> = {
  normal:   'var(--font-weight-normal)',
  medium:   'var(--font-weight-medium)',
  semibold: 'var(--font-weight-semibold)',
  bold:     'var(--font-weight-bold)',
};

export interface HeadingProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Visual level. Default `2`. */
  level?: HeadingLevel;
  /** Override the rendered HTML tag (defaults to the semantic match for `level`). */
  as?: HeadingTag;
  /** Override the level's default weight. */
  weight?: HeadingWeight;
  align?: HeadingAlign;
  tone?: HeadingTone;
  /** Single-line ellipsis truncation. */
  truncate?: boolean;
}

/**
 * Heading — semantic, fluid-scaled section title.
 *
 * Visual size and HTML tag are decoupled: pick `level` for visuals,
 * use `as` only when document outline requires a different tag (rare).
 */
export const Heading = forwardRef<HTMLHeadingElement, HeadingProps>(function Heading(
  { level = 2, as, weight, align, tone = 'default', truncate, className, style, children, ...rest },
  ref,
) {
  const scale = SCALE[level];
  const Component = (as ?? scale.tag) as ElementType;
  const inline: CSSProperties = {
    ...style,
    ['--ds-h-size'     as string]: scale.size,
    ['--ds-h-lh'       as string]: scale.lh,
    ['--ds-h-weight'   as string]: weight ? WEIGHT_VAR[weight] : scale.weight,
    ['--ds-h-tracking' as string]: scale.tracking,
  };

  return (
    <Component
      ref={ref as Ref<HTMLHeadingElement>}
      className={cx(s.heading, className)}
      data-align={align}
      data-tone={tone === 'default' ? undefined : tone}
      data-truncate={truncate ? 'true' : undefined}
      style={inline}
      {...rest}
    >
      {children}
    </Component>
  );
});
