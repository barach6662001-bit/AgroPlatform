import type { ReactNode } from 'react';
import s from './PageHeader.module.css';

interface Props {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  breadcrumbs?: ReactNode;
}

export default function PageHeader({ title, subtitle, actions, breadcrumbs }: Props) {
  return (
    <div>
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
    </div>
  );
}
