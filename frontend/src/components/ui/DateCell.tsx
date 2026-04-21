import { Tooltip } from 'antd';
import s from './DateCell.module.css';

interface Props {
  value: string | Date;
  format?: 'date' | 'datetime';
  locale?: string;
}

function formatRelative(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffDays === 0) return 'Сьогодні';
  if (diffDays === 1) return 'Вчора';
  if (diffDays < 7) return `${diffDays} дн. тому`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} тиж. тому`;
  return '';
}

export default function DateCell({ value, format = 'date', locale = 'uk-UA' }: Props) {
  const date = typeof value === 'string' ? new Date(value) : value;

  const formatted = format === 'datetime'
    ? date.toLocaleString(locale, { dateStyle: 'medium', timeStyle: 'short' })
    : date.toLocaleDateString(locale, { dateStyle: 'medium' });

  const relative = formatRelative(date);

  return (
    <Tooltip title={relative || formatted}>
      <span className={s.colored}>
        {formatted}
      </span>
    </Tooltip>
  );
}
