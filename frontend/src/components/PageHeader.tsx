import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div style={{
      marginBottom: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 20,
            fontWeight: 600,
            color: '#e6edf3',
            letterSpacing: '-0.3px',
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              margin: '2px 0 0',
              fontSize: 13,
              color: '#8b949e',
            }}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && <div>{actions}</div>}
      </div>
    </div>
  );
}
