import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  children: ReactNode;
}

export default function PageLayout({ title, subtitle, actions, breadcrumbs, children }: Props) {
  return (
    <div style={{ padding: '0 0 24px' }}>
      {breadcrumbs && <div style={{ marginBottom: 12 }}>{breadcrumbs}</div>}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
        paddingBottom: 20,
        borderBottom: '1px solid var(--border)',
      }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-primary)',
            letterSpacing: '-0.4px',
            lineHeight: 1.2,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              margin: '4px 0 0',
              fontSize: 13,
              color: 'var(--text-tertiary)',
              fontWeight: 400,
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
