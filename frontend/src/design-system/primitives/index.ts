/**
 * Layout & typography primitives — the only building blocks the rest of
 * the app should use for spacing, alignment and text rendering.
 *
 * Every visual decision (gap, padding, font-size, weight, color) flows
 * through design tokens — no hard-coded values.
 */

export { Box, type BoxProps } from './Box';
export {
  Stack,
  type StackProps,
  type StackAlign,
  type StackJustify,
} from './Stack';
export {
  Cluster,
  type ClusterProps,
  type ClusterAlign,
  type ClusterJustify,
} from './Cluster';
export { Container, type ContainerProps, type ContainerSize } from './Container';
export {
  Heading,
  type HeadingProps,
  type HeadingLevel,
  type HeadingWeight,
  type HeadingTone,
  type HeadingAlign,
} from './Heading';
export {
  Text,
  type TextProps,
  type TextSize,
  type TextWeight,
  type TextTone,
  type TextAlign,
} from './Text';

export { space, cx } from './utils';
