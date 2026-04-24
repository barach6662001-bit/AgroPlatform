import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type Ref } from 'react';
import type { SpacingKey } from '../tokens';
import { cx, space } from './utils';
import s from './Cluster.module.css';

type ClusterAs =
  | 'div'
  | 'span'
  | 'header'
  | 'footer'
  | 'nav'
  | 'ul'
  | 'ol';

export type ClusterAlign = 'start' | 'center' | 'end' | 'baseline' | 'stretch';
export type ClusterJustify = 'start' | 'center' | 'end' | 'between' | 'around';

export interface ClusterProps extends HTMLAttributes<HTMLElement> {
  as?: ClusterAs;
  /** Horizontal gap between children. Defaults to `'2'` (8 px). */
  gap?: SpacingKey;
  align?: ClusterAlign;
  justify?: ClusterJustify;
  /** When true, items never wrap to a new row. Default: false (wrap). */
  nowrap?: boolean;
}

/**
 * Cluster — horizontal one-dimensional layout that wraps by default.
 *
 * Use it for tag rows, button groups, breadcrumbs, toolbar items —
 * any horizontal collection that should reflow gracefully on small screens.
 */
export const Cluster = forwardRef<HTMLElement, ClusterProps>(function Cluster(
  { as = 'div', gap = '2', align = 'center', justify, nowrap, className, style, children, ...rest },
  ref,
) {
  const Component = as as ElementType;
  const inline: CSSProperties = { ...style, ['--ds-cluster-gap' as string]: space(gap) };

  return (
    <Component
      ref={ref as Ref<HTMLElement>}
      className={cx(s.cluster, className)}
      data-align={align}
      data-justify={justify}
      data-nowrap={nowrap ? 'true' : undefined}
      style={inline}
      {...rest}
    >
      {children}
    </Component>
  );
});
