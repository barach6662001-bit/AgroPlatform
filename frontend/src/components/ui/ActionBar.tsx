import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';

interface Props {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  secondaryActions?: ReactNode;
  primaryAction?: ReactNode;
}

export default function ActionBar({
  searchPlaceholder = 'Пошук...',
  searchValue,
  onSearchChange,
  secondaryActions,
  primaryAction,
}: Props) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 8,
      marginBottom: 16,
    }}>
      {onSearchChange && (
        <Input
          prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          style={{ maxWidth: 320 }}
        />
      )}
      <div style={{ flex: 1 }} />
      {secondaryActions && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {secondaryActions}
        </div>
      )}
      {primaryAction}
    </div>
  );
}
