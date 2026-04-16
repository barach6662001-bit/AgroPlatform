import { useState } from 'react';
import type { TableProps, TableColumnType } from 'antd';
import DataTable from '../ui/DataTable';
import { useBreakpoint } from '../../hooks/useBreakpoint';
import s from './PremiumTable.module.css';

export type MobilePriority = 'primary' | 'secondary' | 'hide';

export interface ResponsiveColumn<T> extends TableColumnType<T> {
  /** How this column behaves on mobile (<640px):
   *  - 'primary'   → shown prominently in card header
   *  - 'secondary' → shown in card detail section
   *  - 'hide'      → not shown on mobile
   *  - undefined   → shown as secondary (default)
   */
  mobilePriority?: MobilePriority;
}

export interface PremiumTableProps<T extends object> extends Omit<TableProps<T>, 'columns'> {
  density?: 'compact' | 'default' | 'comfortable';
  columns?: ResponsiveColumn<T>[];
}

function MobileCardList<T extends object>({
  dataSource,
  columns,
  rowKey,
}: {
  dataSource: T[];
  columns: ResponsiveColumn<T>[];
  rowKey?: string | ((record: T) => string);
}) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const primaryCols = columns.filter((c) => c.mobilePriority === 'primary');
  const secondaryCols = columns.filter(
    (c) => !c.mobilePriority || c.mobilePriority === 'secondary'
  );
  const actionCols = columns.filter(
    (c) => c.key === 'actions' || String(c.dataIndex) === 'actions'
  );
  const detailCols = secondaryCols.filter(
    (c) => c.key !== 'actions' && String(c.dataIndex) !== 'actions'
  );

  function getKey(record: T, idx: number): string {
    if (!rowKey) return String(idx);
    if (typeof rowKey === 'function') return rowKey(record);
    return String((record as Record<string, unknown>)[rowKey] ?? idx);
  }

  function renderCell(col: ResponsiveColumn<T>, record: T) {
    const raw = col.dataIndex
      ? (record as Record<string, unknown>)[String(col.dataIndex)]
      : undefined;
    if (col.render) {
      return col.render(raw, record, 0);
    }
    return raw != null ? String(raw) : '—';
  }

  return (
    <div className={s.mobileList}>
      {(dataSource as T[]).map((record, idx) => {
        const key = getKey(record, idx);
        const isExpanded = expanded.has(key);

        return (
          <div key={key} className={s.mobileCard}>
            {/* Card header: primary fields */}
            <div className={s.mobileCardHeader}>
              <div className={s.mobileCardPrimary}>
                {primaryCols.map((col) => (
                  <span key={String(col.key ?? col.dataIndex)} className={s.mobileCardPrimaryValue}>
                    {renderCell(col, record)}
                  </span>
                ))}
              </div>
              {actionCols.map((col) => (
                <div key={String(col.key ?? col.dataIndex)} className={s.mobileCardActions}>
                  {renderCell(col, record)}
                </div>
              ))}
            </div>

            {/* Detail rows */}
            {detailCols.length > 0 && (
              <>
                {(isExpanded ? detailCols : detailCols.slice(0, 2)).map((col) => (
                  <div key={String(col.key ?? col.dataIndex)} className={s.mobileCardRow}>
                    <span className={s.mobileCardLabel}>{col.title as string}</span>
                    <span className={s.mobileCardValue}>{renderCell(col, record)}</span>
                  </div>
                ))}
                {detailCols.length > 2 && (
                  <button
                    className={s.mobileCardExpand}
                    onClick={() => {
                      const next = new Set(expanded);
                      if (isExpanded) next.delete(key);
                      else next.add(key);
                      setExpanded(next);
                    }}
                  >
                    {isExpanded ? 'Згорнути ▲' : `Детальніше (${detailCols.length - 2}) ▼`}
                  </button>
                )}
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function PremiumTable<T extends object>({
  className,
  columns,
  dataSource,
  rowKey,
  ...props
}: PremiumTableProps<T>) {
  const bp = useBreakpoint();

  // On mobile, use card layout if any column has mobilePriority defined
  const hasMobileMeta = columns?.some((c) => c.mobilePriority !== undefined);
  if (bp === 'mobile' && hasMobileMeta && columns && dataSource) {
    return (
      <MobileCardList<T>
        dataSource={dataSource as T[]}
        columns={columns}
        rowKey={rowKey as string | ((record: T) => string)}
      />
    );
  }

  // On tablet, hide columns marked 'hide' or those beyond priority threshold
  let visibleColumns = columns;
  if (bp === 'tablet' && columns) {
    visibleColumns = columns.filter((c) => c.mobilePriority !== 'hide');
  }

  return (
    <DataTable<T>
      className={`${s.premiumTable} ${className || ''}`}
      columns={visibleColumns as TableColumnType<T>[]}
      dataSource={dataSource}
      rowKey={rowKey}
      {...props}
    />
  );
}
