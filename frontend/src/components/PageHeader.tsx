import type { ReactNode } from 'react';
import { Cluster, Heading, Stack, Text } from '../design-system';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}

/**
 * Section / page header — title, optional subtitle, optional inline actions,
 * optional breadcrumb slot above. Built entirely from design-system primitives;
 * no local CSS, no hard-coded sizes or colors.
 *
 * Public API unchanged from the legacy implementation: every consumer that
 * passes `{title, subtitle, actions, breadcrumbs}` keeps working as-is.
 */
export default function PageHeader({ title, subtitle, actions, breadcrumbs }: Props) {
  return (
    <Stack as="header" gap="3" style={{ marginBottom: 'var(--space-6)' }}>
      {breadcrumbs}
      <Cluster
        align="start"
        justify="between"
        gap="4"
        style={{
          paddingBottom: 'var(--space-5)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <Stack gap="1">
          <Heading level={1}>{title}</Heading>
          {subtitle && (
            <Text size="sm" tone="tertiary">
              {subtitle}
            </Text>
          )}
        </Stack>
        {actions && (
          <Cluster gap="2" align="center">
            {actions}
          </Cluster>
        )}
      </Cluster>
    </Stack>
  );
}
