import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type Ref } from 'react';
import type { SpacingKey } from '../tokens';
import { space } from './utils';

type BoxAs =
  | 'div'
  | 'section'
  | 'article'
  | 'aside'
  | 'header'
  | 'footer'
  | 'main'
  | 'nav'
  | 'span';

export interface BoxProps extends HTMLAttributes<HTMLElement> {
  as?: BoxAs;
  /** Shorthand for padding on all sides. */
  p?: SpacingKey;
  /** Horizontal padding (left + right). */
  px?: SpacingKey;
  /** Vertical padding (top + bottom). */
  py?: SpacingKey;
  pt?: SpacingKey;
  pr?: SpacingKey;
  pb?: SpacingKey;
  pl?: SpacingKey;
  /** Margin shorthand. */
  m?: SpacingKey;
  mx?: SpacingKey;
  my?: SpacingKey;
  mt?: SpacingKey;
  mr?: SpacingKey;
  mb?: SpacingKey;
  ml?: SpacingKey;
  /** Block-level width control (CSS value pass-through, e.g. '100%', '320px'). */
  width?: CSSProperties['width'];
  height?: CSSProperties['height'];
  /** Convenience flag to render with `display: flex` (rare; prefer Stack/Cluster). */
  flex?: boolean;
}

/**
 * Box — the most primitive layout building block.
 *
 * Use it when you need spacing/sizing without flex semantics.
 * Prefer `Stack`/`Cluster` for one-dimensional layouts and `Container`
 * for max-width centred regions.
 */
export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  {
    as = 'div',
    p, px, py, pt, pr, pb, pl,
    m, mx, my, mt, mr, mb, ml,
    width, height, flex,
    style, children, ...rest
  },
  ref,
) {
  const Component = as as ElementType;
  const inline: CSSProperties = { ...style };

  if (p !== undefined) inline.padding = space(p);
  if (px !== undefined) { inline.paddingLeft = space(px); inline.paddingRight = space(px); }
  if (py !== undefined) { inline.paddingTop = space(py); inline.paddingBottom = space(py); }
  if (pt !== undefined) inline.paddingTop = space(pt);
  if (pr !== undefined) inline.paddingRight = space(pr);
  if (pb !== undefined) inline.paddingBottom = space(pb);
  if (pl !== undefined) inline.paddingLeft = space(pl);

  if (m !== undefined) inline.margin = space(m);
  if (mx !== undefined) { inline.marginLeft = space(mx); inline.marginRight = space(mx); }
  if (my !== undefined) { inline.marginTop = space(my); inline.marginBottom = space(my); }
  if (mt !== undefined) inline.marginTop = space(mt);
  if (mr !== undefined) inline.marginRight = space(mr);
  if (mb !== undefined) inline.marginBottom = space(mb);
  if (ml !== undefined) inline.marginLeft = space(ml);

  if (width !== undefined) inline.width = width;
  if (height !== undefined) inline.height = height;
  if (flex) inline.display = 'flex';

  return (
    <Component ref={ref as Ref<HTMLElement>} style={inline} {...rest}>
      {children}
    </Component>
  );
});
