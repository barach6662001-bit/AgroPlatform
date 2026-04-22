import { useNavigate } from 'react-router-dom';
import { Wrench, Clock, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../../i18n';
import s from './AlertsStrip.module.css';

interface Props {
  underRepairMachines: number;
  pendingOperations: number;
  overdueOperations?: number;
}

interface Item {
  key: string;
  icon: JSX.Element;
  iconClass?: string;
  count: number;
  label: string;
  route: string;
}

/** Compact single-line alerts strip — Row 2 in the v2 IA. */
export default function AlertsStrip({
  underRepairMachines,
  pendingOperations,
  overdueOperations = 0,
}: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dash = t.dashboard as Record<string, string | undefined>;

  const items: Item[] = [];

  if (overdueOperations > 0) {
    items.push({
      key: 'overdue',
      icon: <AlertTriangle size={14} strokeWidth={1.8} />,
      iconClass: s.iconAlert,
      count: overdueOperations,
      label: dash.overdueOps ?? '',
      route: '/operations',
    });
  }
  if (underRepairMachines > 0) {
    items.push({
      key: 'repair',
      icon: <Wrench size={14} strokeWidth={1.8} />,
      count: underRepairMachines,
      label: t.dashboard.machinesUnderRepair,
      route: '/machinery',
    });
  }
  if (pendingOperations > 0) {
    items.push({
      key: 'pending',
      icon: <Clock size={14} strokeWidth={1.8} />,
      count: pendingOperations,
      label: t.dashboard.pendingOpsAlert,
      route: '/operations',
    });
  }

  if (items.length === 0) {
    return (
      <div className={s.strip}>
        <span className={s.empty}>— {dash.allClear}</span>
      </div>
    );
  }

  return (
    <div className={s.strip} aria-label={dash.needsAttention}>
      {items.map((it, i) => (
        <span key={it.key} style={{ display: 'inline-flex', alignItems: 'center' }}>
          {i > 0 && <span className={s.divider} aria-hidden="true" />}
          <button
            type="button"
            className={s.item}
            onClick={() => navigate(it.route)}
            aria-label={`${it.label}: ${it.count}`}
          >
            <span className={`${s.icon} ${it.iconClass ?? ''}`}>{it.icon}</span>
            <span className={s.count}>{it.count}</span>
            <span>{it.label}</span>
          </button>
        </span>
      ))}
    </div>
  );
}
