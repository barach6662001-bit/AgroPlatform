import type { ReactNode } from 'react';
import s from './PageLayout.module.css';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
  children: ReactNode;
}

export default function PageLayout({ title, subtitle, actions, breadcrumbs, children }: Props) {
  return (
    <div className={s.padded}>
      {breadcrumbs && <div className={s.spaced}>{breadcrumbs}</div>}
      <div className={s.flex_between}>
        <div>
          <h1 className={s.text22}>
            {title}
          </h1>
          {subtitle && (
            <p className={s.text13}>
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className={s.flex_center}>
            {actions}
          </div>
        )}
      </div>
      {children}
    </div>
  );
}
