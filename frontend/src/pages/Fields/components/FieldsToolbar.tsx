import { Search, Download, Plus, Map, List, LayoutGrid } from 'lucide-react';
import { Spin } from 'antd';
import s from './FieldsToolbar.module.css';

export type ViewMode = 'list' | 'map' | 'grid';

interface Props {
  search: string;
  onSearchChange: (v: string) => void;
  viewMode: ViewMode;
  onViewModeChange: (v: ViewMode) => void;
  canCreate?: boolean;
  onAdd?: () => void;
  onExport?: () => void;
  loading?: boolean;
  addLabel: string;
  exportLabel: string;
}

const VIEW_MODES: { value: ViewMode; icon: React.ReactNode; title: string }[] = [
  { value: 'map',  icon: <Map size={14} />,        title: 'Карта' },
  { value: 'grid', icon: <LayoutGrid size={14} />,  title: 'Картки' },
  { value: 'list', icon: <List size={14} />,        title: 'Список' },
];

export default function FieldsToolbar({
  search, onSearchChange,
  viewMode, onViewModeChange,
  canCreate, onAdd, onExport,
  loading,
  addLabel, exportLabel,
}: Props) {
  return (
    <div className={s.toolbar}>
      {/* Search */}
      <div className={s.searchWrap}>
        <Search size={14} className={s.searchIcon} />
        <input
          className={s.searchInput}
          placeholder="Пошук полів..."
          value={search}
          onChange={e => onSearchChange(e.target.value)}
        />
        {loading && <Spin size="small" className={s.spinner} />}
      </div>

      <div className={s.right}>
        {/* View mode toggle */}
        <div className={s.segmented}>
          {VIEW_MODES.map(mode => (
            <button
              key={mode.value}
              className={`${s.segBtn} ${viewMode === mode.value ? s.segActive : ''}`}
              onClick={() => onViewModeChange(mode.value)}
              title={mode.title}
            >
              {mode.icon}
            </button>
          ))}
        </div>

        {/* Export */}
        {onExport && (
          <button className={s.btnOutline} onClick={onExport}>
            <Download size={14} /> {exportLabel}
          </button>
        )}

        {/* Add */}
        {canCreate && onAdd && (
          <button className={s.btnPrimary} onClick={onAdd}>
            <Plus size={14} /> {addLabel}
          </button>
        )}
      </div>
    </div>
  );
}
