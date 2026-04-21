import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle, Clock, PackageMinus, Wrench, CheckCircle2, ChevronRight,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import s from './AlertsPanel.module.css';

type Severity = 'critical' | 'warning' | 'info';

interface AlertRow {
  severity: Severity;
  icon: JSX.Element;
  title: string;
  count: number;
  route: string;
}

interface Props {
  underRepairMachines: number;
  pendingOperations: number;
  overdueOperations?: number;
  lowStockItems?: number;
  completedToday?: number;
}

const SEV_RANK: Record<Severity, number> = { critical: 0, warning: 1, info: 2 };

export default function AlertsPanel({
  underRepairMachines,
  pendingOperations,
  overdueOperations = 0,
  lowStockItems = 0,
  completedToday = 0,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const dash = t.dashboard as Record<string, string | undefined>;

  const rows: AlertRow[] = [];

  if (overdueOperations > 0) {
    rows.push({
      severity: 'critical',
      icon: <AlertTriangle size={16} strokeWidth={1.8} />,
      title: dash.overdueOps ?? 'overdue operations',
      count: overdueOperations,
      route: '/operations',
    });
  }
  if (underRepairMachines > 0) {
    rows.push({
      severity: 'critical',
      icon: <Wrench size={16} strokeWidth={1.8} />,
      title: t.dashboard.machinesUnderRepair,
      count: underRepairMachines,
      route: '/machinery',
    });
  }
  if (pendingOperations > 0) {
    rows.push({
      severity: 'warning',
      icon: <Clock size={16} strokeWidth={1.8} />,
      title: t.dashboard.pendingOpsAlert,
      count: pendingOperations,
      route: '/operations',
    });
  }
  if (lowStockItems > 0) {
    rows.push({
      severity: 'warning',
      icon: <PackageMinus size={16} strokeWidth={1.8} />,
      title: dash.lowStockAlert ?? 'items with low stock',
      count: lowStockItems,
      route: '/warehouses/items',
    });
  }
  if (completedToday > 0) {
    rows.push({
      severity: 'info',
      icon: <CheckCircle2 size={16} strokeWidth={1.8} />,
      title: dash.completedToday ?? 'operations completed today',
      count: completedToday,
      route: '/operations',
    });
  }

  if (rows.length === 0) return null;

  rows.sort((a, b) => SEV_RANK[a.severity] - SEV_RANK[b.severity]);

  const visible = expanded ? rows : rows.slice(0, 5);
  const hasMore = rows.length > 5 && !expanded;

  return (
    <section className={s.card} aria-label={dash.needsAttention ?? 'Needs attention'}>
      <header className={s.header}>
        <span className={s.title}>{dash.needsAttention ?? 'Потребує уваги'}</span>
        <span className={s.totalCount}>{rows.length}</span>
      </header>
      <ul className={s.list}>
        {visible.map((row, i) => (
          <li key={i} className={s.listItem}>
            <button
              type="button"
              className={`${s.row} ${s[row.severity]}`}
              onClick={() => navigate(row.route)}
              aria-label={`${row.title}: ${row.count}`}
            >
              <span className={s.iconWrap}>{row.icon}</span>
              <span className={s.rowTitle}>{row.title}</span>
              <span className={s.rowCount}>{row.count}</span>
              <ChevronRight size={14} className={s.chevron} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>
      {hasMore && (
        <button type="button" className={s.showAll} onClick={() => setExpanded(true)}>
          {dash.showAll ?? 'Показати всі'} ({rows.length})
        </button>
      )}
    </section>
  );
}
