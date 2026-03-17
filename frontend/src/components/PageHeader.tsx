import type { ReactNode } from 'react';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions }: Props) {
  return (
    <div style={{
      marginBottom: 28,
      paddingBottom: 20,
      borderBottom: '1px solid #1f2d24',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{
            margin: 0,
            fontSize: 26,
            fontWeight: 700,
            color: '#f0fdf4',
            letterSpacing: '-0.5px',
            lineHeight: 1.2,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              margin: '4px 0 0',
              fontSize: 14,
              color: '#4ade80',
              fontWeight: 400,
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
