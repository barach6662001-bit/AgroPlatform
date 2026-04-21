import type { TopStockItemDto } from '../../../types/analytics';
import { useTranslation } from '../../../i18n';
import { formatUA } from '../../../utils/numberFormat';
import s from './WarehouseSnapshot.module.css';

interface Props {
  items: TopStockItemDto[];
  /** Threshold below which a row gets a "low stock" badge. Default 500. */
  lowStockThreshold?: number;
}

const LOW_STOCK_DEFAULT = 500;

/** Top-N stock items with a normalized bar fill — Row 5, left column. */
export default function WarehouseSnapshot({
  items,
  lowStockThreshold = LOW_STOCK_DEFAULT,
}: Props) {
  const { t } = useTranslation();
  const dash = t.dashboard as Record<string, string | undefined>;

  if (items.length === 0) {
    return <div className={s.empty}>{dash.noStockData ?? '—'}</div>;
  }

  const max = Math.max(...items.map((i) => i.totalBalance), 1);
  const visible = items.slice(0, 5);

  return (
    <ul className={s.list}>
      {visible.map((item) => {
        const isLow = item.totalBalance < lowStockThreshold;
        const pct = Math.max(2, (item.totalBalance / max) * 100);
        return (
          <li key={item.itemId} className={s.row}>
            <span className={s.name}>
              {item.itemName}
              {isLow && (
                <span className={s.lowBadge}>{dash.lowStockBadge ?? 'low'}</span>
              )}
            </span>
            <span className={s.value}>
              {formatUA(item.totalBalance)} {item.baseUnit}
            </span>
            <span className={s.bar} aria-hidden="true">
              <span className={s.barFill} style={{ width: `${pct}%` }} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}
