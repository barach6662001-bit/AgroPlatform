import { Tooltip } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import { formatUA } from '../../utils/numberFormat';

export interface PLTableRow {
  key: string;
  /** Row label / category name */
  label: string;
  /** Planned value */
  plan: number;
  /** Actual / fact value */
  fact: number;
  /** Currency or unit suffix, e.g. "UAH" */
  unit?: string;
  /**
   * When true the metric is "lower-is-better" (costs).
   * fact < plan → green (on target), fact > plan → red (over budget).
   * When false (revenue/income) fact > plan → green, fact < plan → red.
   */
  lowerIsBetter?: boolean;
}

interface Props {
  rows: PLTableRow[];
  /** Column headers */
  labels?: {
    metric?: string;
    plan?: string;
    fact?: string;
    execution?: string;
  };
}

const SUCCESS_COLOR = '#3FB950';
const DANGER_COLOR  = '#F85149';
const TRACK_COLOR   = '#21262D';

/** Clamp a percentage to [0, 100] for the progress bar width. */
function clamp(val: number): number {
  return Math.min(100, Math.max(0, val));
}

function ProgressBar({ pct, color }: { pct: number; color: string }) {
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={{
        width: '100%',
        height: 6,
        borderRadius: 3,
        background: TRACK_COLOR,
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          width: `${clamp(pct)}%`,
          height: '100%',
          borderRadius: 3,
          background: color,
          transition: 'width 0.4s ease',
        }}
      />
    </div>
  );
}

export default function PLTable({ rows, labels }: Props) {
  const colMetric    = labels?.metric    ?? 'Показник';
  const colPlan      = labels?.plan      ?? 'План';
  const colFact      = labels?.fact      ?? 'Факт';
  const colExecution = labels?.execution ?? 'Виконання';

  return (
    <div style={{ overflowX: 'auto' }}>
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: 14,
          color: '#E6EDF3',
        }}
      >
        {/* Header */}
        <thead>
          <tr style={{ background: '#0D1117' }}>
            {[colMetric, colPlan, colFact, colExecution].map((h) => (
              <th
                key={h}
                style={{
                  padding: '10px 14px',
                  textAlign: h === colMetric ? 'left' : 'right',
                  color: '#8B949E',
                  fontWeight: 600,
                  fontSize: 12,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  borderBottom: '1px solid #30363D',
                  whiteSpace: 'nowrap',
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {rows.map((row, idx) => {
            const pct = row.plan > 0 ? (row.fact / row.plan) * 100 : 0;
            const lowerIsBetter = row.lowerIsBetter ?? true;

            // For costs (lower-is-better): fact < plan → green
            // For revenue (higher-is-better): fact > plan → green
            const isOnTarget = lowerIsBetter ? row.fact <= row.plan : row.fact >= row.plan;
            const barColor   = isOnTarget ? SUCCESS_COLOR : DANGER_COLOR;
            const Icon       = isOnTarget ? CheckCircleOutlined : CloseCircleOutlined;
            const unit       = row.unit ? ` ${row.unit}` : '';

            return (
              <tr
                key={row.key}
                style={{
                  background: idx % 2 === 0 ? '#161B22' : '#0D1117',
                  borderBottom: '1px solid #21262D',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background = '#21262D';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLTableRowElement).style.background =
                    idx % 2 === 0 ? '#161B22' : '#0D1117';
                }}
              >
                {/* Metric name */}
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>
                  {row.label}
                </td>

                {/* Plan */}
                <td style={{ padding: '10px 14px', textAlign: 'right', color: '#8B949E' }}>
                  {formatUA(row.plan)}{unit}
                </td>

                {/* Fact */}
                <td style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600, color: barColor }}>
                  {formatUA(row.fact)}{unit}
                </td>

                {/* Progress bar + percentage */}
                <td style={{ padding: '10px 14px', minWidth: 160 }}>
                  <Tooltip
                    title={`${row.label}: ${Math.round(pct)}%`}
                    mouseEnterDelay={0.3}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1 }}>
                        <ProgressBar pct={pct} color={barColor} />
                      </div>
                      <span
                        style={{
                          minWidth: 56,
                          textAlign: 'right',
                          color: barColor,
                          fontWeight: 600,
                          fontSize: 12,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        <Icon style={{ marginRight: 3, fontSize: 10 }} />
                        {Math.round(pct)}%
                      </span>
                    </div>
                  </Tooltip>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
