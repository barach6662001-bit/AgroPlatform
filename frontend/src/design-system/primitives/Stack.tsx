import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type Ref } from 'react';
import type { SpacingKey } from '../tokens';
import { cx, space } from './utils';
import s from './Stack.module.css';

type StackAs =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'ul'
  | 'ol'
  | 'form';

export type StackAlign = 'start' | 'center' | 'end' | 'stretch';
export type StackJustify = 'start' | 'center' | 'end' | 'between' | 'around';

export interface StackProps extends HTMLAttributes<HTMLElement> {
  as?: StackAs;
  /** Vertical gap between children. Defaults to `'4'` (16 px). */
  gap?: SpacingKey;
  align?: StackAlign;
  justify?: StackJustify;
  /** When true, render a 1 px divider between children using `--border`. */
  divide?: boolean;
}

/**
 * Stack — vertical one-dimensional layout.
 *
 * Use it for forms, lists, page sections — anywhere you compose blocks
 * top-to-bottom with consistent spacing. For horizontal flows use `Cluster`.
 */
export const Stack = forwardRef<HTMLElement, StackProps>(function Stack(
  { as = 'div', gap = '4', align, justify, divide, className, style, children, ...rest },
  ref,
) {
  const Component = as as ElementType;
  const inline: CSSProperties = { ...style, ['--ds-stack-gap' as string]: space(gap) };

  return (
    <Component
      ref={ref as Ref<HTMLElement>}
      className={cx(s.stack, className)}
      data-align={align}
      data-justify={justify}
      data-divide={divide ? 'true' : undefined}
      style={inline}
      {...rest}
    >
      {children}
    </Component>
  );
});
