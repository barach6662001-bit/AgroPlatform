import { useNavigate } from 'react-router-dom';
import { Cloud, Sun } from 'lucide-react';
import dayjs from 'dayjs';
import type { AgroOperationDto } from '../../../types/operation';
import { useTranslation } from '../../../i18n';
import s from './UpcomingPanel.module.css';

interface Props {
  operations: AgroOperationDto[];
  /** How many days ahead to show. Default 7. */
  windowDays?: number;
  /** Optional weather snapshot (preview-only, no API call). */
  weather?: {
    tempC: number;
    condition: 'clear' | 'cloudy';
    location: string;
  };
}

/**
 * Combined "Upcoming" panel — shows the next N days of planned operations
 * with a small weather strip at the bottom.  Row 5, right column in the
 * v2 IA.  Filters operations to: not completed AND plannedDate within
 * [today, today + windowDays].
 */
export default function UpcomingPanel({ operations, windowDays = 7, weather }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dash = t.dashboard as Record<string, string | undefined>;

  const today = dayjs().startOf('day');
  const horizon = today.add(windowDays, 'day');

  const upcoming = operations
    .filter((op) => {
      if (op.isCompleted || !op.plannedDate) return false;
      const d = dayjs(op.plannedDate);
      return d.isAfter(today.subtract(1, 'day')) && d.isBefore(horizon);
    })
    .sort((a, b) => (a.plannedDate < b.plannedDate ? -1 : 1))
    .slice(0, 5);

  return (
    <div>
      {upcoming.length === 0 ? (
        <div className={s.empty}>{dash.noUpcoming ?? '—'}</div>
      ) : (
        <ul className={s.list}>
          {upcoming.map((op) => {
            const d = dayjs(op.plannedDate);
            const isToday = d.isSame(today, 'day');
            const opLabel =
              t.operationTypes[op.operationType as keyof typeof t.operationTypes] ?? op.operationType;
            return (
              <li
                key={op.id}
                className={s.item}
                onClick={() => navigate(`/operations/${op.id}`)}
                style={{ cursor: 'pointer' }}
              >
                <span className={`${s.dateChip} ${isToday ? s.dateChipToday : ''}`}>
                  {d.format('DD MMM')}
                </span>
                <div className={s.body}>
                  <p className={s.opType}>{opLabel}</p>
                  <p className={s.fieldName}>{op.fieldName}</p>
                </div>
                {typeof op.areaProcessed === 'number' && op.areaProcessed > 0 && (
                  <span className={s.area}>{op.areaProcessed} {dash.haUnit ?? 'га'}</span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {weather && (
        <div className={s.weatherStrip}>
          <span className={s.weatherIcon}>
            {weather.condition === 'clear'
              ? <Sun size={14} strokeWidth={1.6} />
              : <Cloud size={14} strokeWidth={1.6} />}
          </span>
          <span className={s.weatherTemp}>{weather.tempC > 0 ? '+' : ''}{weather.tempC}°C</span>
          <span className={s.weatherLoc}>· {weather.location}</span>
        </div>
      )}
    </div>
  );
}
