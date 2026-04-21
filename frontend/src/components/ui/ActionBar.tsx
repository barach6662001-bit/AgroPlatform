import { Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { ReactNode } from 'react';
import s from './ActionBar.module.css';

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
    <div className={s.flex_center}>
      {onSearchChange && (
        <Input
          prefix={<SearchOutlined className={s.colored} />}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          allowClear
          className={s.block2}
        />
      )}
      <div className={s.block3} />
      {secondaryActions && (
        <div className={s.flex_center1}>
          {secondaryActions}
        </div>
      )}
      {primaryAction}
    </div>
  );
}
