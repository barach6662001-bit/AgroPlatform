import type { ReactNode } from 'react';
import { Input, Button } from 'antd';
import { Search, X } from 'lucide-react';
import s from './FilterBar.module.css';

interface FilterBarProps {
  /** Search input: current value */
  searchValue?: string;
  /** Search input: placeholder text */
  searchPlaceholder?: string;
  /** Called on search change */
  onSearch?: (value: string) => void;
  /** Additional filter controls (date pickers, selects, etc.) */
  filters?: ReactNode;
  /** Action buttons on the right (Add button, Import, etc.) */
  actions?: ReactNode;
  /** Show clear button when any filter is active */
  onClear?: () => void;
  hasActiveFilters?: boolean;
}

export default function FilterBar({
  searchValue,
  searchPlaceholder = 'Пошук...',
  onSearch,
  filters,
  actions,
  onClear,
  hasActiveFilters,
}: FilterBarProps) {
  return (
    <div className={s.bar}>
      {/* Left: search + additional filters */}
      <div className={s.left}>
        {onSearch !== undefined && (
          <Input
            className={s.search}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            prefix={<Search size={14} className={s.searchIcon} />}
            allowClear
          />
        )}
        {filters && <div className={s.filters}>{filters}</div>}
        {onClear && hasActiveFilters && (
          <Button
            type="text"
            size="small"
            icon={<X size={14} />}
            onClick={onClear}
            className={s.clearBtn}
          >
            Скинути
          </Button>
        )}
      </div>

      {/* Right: actions */}
      {actions && <div className={s.actions}>{actions}</div>}
    </div>
  );
}
