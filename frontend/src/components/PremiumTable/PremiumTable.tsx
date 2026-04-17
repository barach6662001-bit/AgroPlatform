import type { TableProps } from 'antd';
import DataTable from '../ui/DataTable';
import s from './PremiumTable.module.css';

export interface PremiumTableProps<T extends object> extends TableProps<T> {
  density?: 'compact' | 'default' | 'comfortable';
}

/**
 * PremiumTable — drop-in replacement for DataTable / Ant Table.
 * Adds premium CSS class on top of the existing DataTable wrapper.
 * All column definitions, data, pagination and hooks are preserved.
 */
export default function PremiumTable<T extends object>({
  className,
  ...props
}: PremiumTableProps<T>) {
  return (
    <DataTable<T>
      className={`${s.premiumTable} ${className || ''}`}
      {...props}
    />
  );
}
