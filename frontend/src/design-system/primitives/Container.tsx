import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type Ref } from 'react';
import { cx } from './utils';
import s from './Container.module.css';

type ContainerAs = 'div' | 'section' | 'article' | 'main' | 'header' | 'footer';

/** Max-content widths for each preset (px). Aligned with breakpoints. */
const SIZE_MAP = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1440px',
  full: 'none',
} as const;

export type ContainerSize = keyof typeof SIZE_MAP;

export interface ContainerProps extends HTMLAttributes<HTMLElement> {
  as?: ContainerAs;
  /** Max-width preset. Defaults to `'xl'` (1280 px). */
  size?: ContainerSize;
}

/**
 * Container — horizontally-centred, max-width-clamped page region.
 *
 * Provides responsive horizontal padding (`--space-4 → --space-6 → --space-8`)
 * so content never touches the viewport edge.
 */
export const Container = forwardRef<HTMLElement, ContainerProps>(function Container(
  { as = 'div', size = 'xl', className, style, children, ...rest },
  ref,
) {
  const Component = as as ElementType;
  const inline: CSSProperties = { ...style, ['--ds-container-max' as string]: SIZE_MAP[size] };

  return (
    <Component
      ref={ref as Ref<HTMLElement>}
      className={cx(s.container, className)}
      style={inline}
      {...rest}
    >
      {children}
    </Component>
  );
});
