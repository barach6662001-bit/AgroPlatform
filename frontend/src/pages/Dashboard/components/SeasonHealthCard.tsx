import CountUp from 'react-countup';
import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus, ArrowRight } from 'lucide-react';
import s from './SeasonHealthCard.module.css';

type HealthStatus = 'good' | 'warning' | 'critical';

function getStatus(margin: number): HealthStatus {
  if (margin >= 20) return 'good';
  if (margin >= 0) return 'warning';
  return 'critical';
}

const STATUS_LABEL: Record<HealthStatus, string> = {
  good: '🟢 Добрий',
  warning: '🟡 Задовільний',
  critical: '🔴 Критичний',
};

const STATUS_COLOR: Record<HealthStatus, string> = {
  good: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
};

interface ActionItem {
  id: string;
  text: string;
  route: string;
  severity: 'info' | 'warning' | 'critical';
}

interface Props {
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
  seasonDayOfYear: number;
  seasonYear: number;
  actionItems: ActionItem[];
}

function DeltaIcon({ value }: { value: number }) {
  if (value > 0) return <TrendingUp size={14} />;
  if (value < 0) return <TrendingDown size={14} />;
  return <Minus size={14} />;
}

export default function SeasonHealthCard({
  revenue, costs, profit, margin, seasonDayOfYear, seasonYear, actionItems,
}: Props) {
  const navigate = useNavigate();
  const status = getStatus(margin);
  const statusColor = STATUS_COLOR[status];

  return (
    <div className={s.card}>
      {/* Left: season summary */}
      <div className={s.main}>
        <div className={s.seasonMeta}>
          <span className={s.seasonLabel}>Сезон {seasonYear}</span>
          <span className={s.dayDot}>·</span>
          <span className={s.dayLabel}>День {seasonDayOfYear}/365</span>
        </div>

        <div className={s.healthStatus} style={{ color: statusColor }}>
          {STATUS_LABEL[status]}
        </div>

        <div className={s.metricsRow}>
          <div className={s.metric}>
            <span className={s.metricLabel}>Прибуток</span>
            <span className={s.metricValue} style={{ color: profit >= 0 ? '#22C55E' : '#EF4444' }}>
              <CountUp
                end={profit / 1_000_000}
                duration={1.2}
                decimals={2}
                suffix=" млн ₴"
                separator=" "
                decimal=","
              />
            </span>
          </div>
          <div className={s.metricDivider} />
          <div className={s.metric}>
            <span className={s.metricLabel}>Маржа</span>
            <span className={s.metricValue}>
              <CountUp end={margin} duration={1.0} decimals={1} suffix="%" />
            </span>
          </div>
          <div className={s.metricDivider} />
          <div className={s.metric}>
            <span className={s.metricLabel}>Дохід</span>
            <span className={s.metricValue}>
              <CountUp
                end={revenue / 1_000_000}
                duration={1.2}
                decimals={2}
                suffix=" млн ₴"
                separator=" "
                decimal=","
              />
            </span>
          </div>
        </div>
      </div>

      {/* Right: action items */}
      {actionItems.length > 0 && (
        <div className={s.actions}>
          <div className={s.actionsTitle}>Потребує уваги</div>
          {actionItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              className={`${s.actionItem} ${s[`actionItem_${item.severity}`]}`}
              onClick={() => navigate(item.route)}
            >
              <span className={s.actionText}>{item.text}</span>
              <ArrowRight size={12} className={s.actionArrow} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
