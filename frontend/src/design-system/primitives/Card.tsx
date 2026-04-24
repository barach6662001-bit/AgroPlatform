import { forwardRef, type CSSProperties, type ElementType, type HTMLAttributes, type Ref } from 'react';
import type { SpacingKey } from '../tokens';
import { Cluster, type ClusterJustify } from './Cluster';
import { Heading, type HeadingLevel } from './Heading';
import { Stack } from './Stack';
import { Surface, type SurfaceElevation, type SurfaceProps, type SurfaceRadius, type SurfaceVariant } from './Surface';
import { Text, type TextSize, type TextTone } from './Text';
import { space } from './utils';

/* ──────────────────────────────────────────────────────────────────────
 * Card — pre-configured Surface with sensible defaults for the
 * dashboard / form panel use case.
 *
 * Defaults:  variant=subtle, radius=xl, padding=5, bordered, no shadow.
 * Overrides: every Surface prop is forwarded — pass `padding`, `radius`,
 *            `elevation`, `interactive` to fine-tune.
 *
 * Internally the Card lays its children out as a vertical Stack with
 * gap=4, so the sub-components below compose naturally without their
 * own margins.
 * ────────────────────────────────────────────────────────────────────── */

export interface CardProps extends Omit<SurfaceProps, 'p'> {
  /** Internal vertical gap between sub-sections. Default `'4'` (16 px). */
  gap?: SpacingKey;
  /** Padding token. Default `'5'` (20 px). */
  p?: SpacingKey;
}

export const Card = forwardRef<HTMLElement, CardProps>(function Card(
  {
    variant = 'subtle' as SurfaceVariant,
    radius = 'xl' as SurfaceRadius,
    elevation = 0 as SurfaceElevation,
    bordered = true,
    interactive = false,
    p = '5',
    gap = '4',
    style, children, ...rest
  },
  ref,
) {
  const inline: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: space(gap),
    ...style,
  };
  return (
    <Surface
      ref={ref}
      variant={variant}
      radius={radius}
      elevation={elevation}
      bordered={bordered}
      interactive={interactive}
      p={p}
      style={inline}
      {...rest}
    >
      {children}
    </Surface>
  );
});

/* ─── CardHeader ─────────────────────────────────────────────────────── */

export interface CardHeaderProps extends HTMLAttributes<HTMLElement> {
  as?: 'header' | 'div';
  /** Vertical gap between title and description. Default `'1'` (4 px). */
  gap?: SpacingKey;
}

export function CardHeader({ as = 'header', gap = '1', children, ...rest }: CardHeaderProps) {
  return (
    <Stack as={as} gap={gap} {...rest}>
      {children}
    </Stack>
  );
}

/* ─── CardTitle ──────────────────────────────────────────────────────── */

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Visual / semantic heading level. Default `3`. */
  level?: HeadingLevel;
}

export function CardTitle({ level = 3, children, ...rest }: CardTitleProps) {
  return (
    <Heading level={level} {...rest}>
      {children}
    </Heading>
  );
}

/* ─── CardDescription ────────────────────────────────────────────────── */

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  /** Text size token. Default `'sm'`. */
  size?: TextSize;
  /** Text tone token. Default `'secondary'`. */
  tone?: TextTone;
}

export function CardDescription({
  size = 'sm',
  tone = 'secondary',
  children,
  ...rest
}: CardDescriptionProps) {
  return (
    <Text as="p" size={size} tone={tone} {...rest}>
      {children}
    </Text>
  );
}

/* ─── CardContent ────────────────────────────────────────────────────── */

export interface CardContentProps extends HTMLAttributes<HTMLElement> {
  as?: 'div' | 'section';
  /** Vertical gap between content blocks. Default `'3'` (12 px). */
  gap?: SpacingKey;
}

export function CardContent({ as = 'div', gap = '3', children, ...rest }: CardContentProps) {
  return (
    <Stack as={as} gap={gap} {...rest}>
      {children}
    </Stack>
  );
}

/* ─── CardFooter ─────────────────────────────────────────────────────── */

export interface CardFooterProps extends HTMLAttributes<HTMLElement> {
  as?: 'footer' | 'div';
  /** Horizontal gap between actions. Default `'2'` (8 px). */
  gap?: SpacingKey;
  /** Justification for the action row. Default `'end'`. */
  justify?: ClusterJustify;
}

export function CardFooter({
  as = 'footer',
  gap = '2',
  justify = 'end',
  children,
  ...rest
}: CardFooterProps) {
  return (
    <Cluster as={as} gap={gap} justify={justify} align="center" {...rest}>
      {children}
    </Cluster>
  );
}
