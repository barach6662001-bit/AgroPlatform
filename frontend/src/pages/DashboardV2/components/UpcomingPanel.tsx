import type { KeyboardEvent } from 'react';
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
 *
 * Phase 2d: pays down the same accessibility debt fixed by Phase 2b
 * (FieldCard) and Phase 2c (dashboard OperationsTimeline). Each row was
 * a <li> with onClick + an inline `cursor: pointer` and no keyboard
 * affordance — unreachable by keyboard, unnamed for assistive tech.
 *
 * Pattern (identical to 2b/2c):
 *   - role="button" + tabIndex={0} + onKeyDown (Enter, Space) on each
 *     row, with preventDefault on Space to suppress page scroll
 *   - aria-label summarising the row (operation type + field + date,
 *     plus the optional area suffix when present) so screen readers
 *     announce a meaningful destination instead of an unnamed button
 *   - the decorative date chip and area pill are marked aria-hidden
 *     because their content is duplicated in aria-label
 *   - inline `cursor: pointer` migrated into the CSS module so the
 *     `:focus-visible` rule can live alongside it without a runtime
 *     style override fight
 *   - a token-driven :focus-visible ring lives in the CSS module
 *
 * No nested <button> existed in the row, so the FieldCard "decorative
 * button → span" step from Phase 2b does not apply here.
 *
 * Visual layout, the navigation target, the weather strip, the
 * filter / sort / windowDays logic and all i18n strings are preserved
 * verbatim. Card / Surface API is unchanged.
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
            const dateStr = d.format('DD MMM');
            const opLabel =
              t.operationTypes[op.operationType as keyof typeof t.operationTypes] ?? op.operationType;
            const haUnit = dash.haUnit ?? 'га';
            const showArea =
              typeof op.areaProcessed === 'number' && op.areaProcessed > 0;

            // Concise screen-reader summary mirroring the row's visible
            // content — operation type, field name, the same date the
            // chip shows, and (when present) the area suffix already
            // visible on the right. Keeps AT output in sync with the
            // visual without inventing new i18n keys.
            const ariaLabel = showArea
              ? `${opLabel}, ${op.fieldName}, ${dateStr}, ${op.areaProcessed} ${haUnit}`
              : `${opLabel}, ${op.fieldName}, ${dateStr}`;

            const goToOperation = () => navigate(`/operations/${op.id}`);
            const handleKeyDown = (e: KeyboardEvent<HTMLLIElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToOperation();
              }
            };

            return (
              <li
                key={op.id}
                className={s.item}
                role="button"
                tabIndex={0}
                aria-label={ariaLabel}
                onClick={goToOperation}
                onKeyDown={handleKeyDown}
              >
                <span
                  className={`${s.dateChip} ${isToday ? s.dateChipToday : ''}`}
                  aria-hidden="true"
                >
                  {dateStr}
                </span>
                <div className={s.body}>
                  <p className={s.opType}>{opLabel}</p>
                  <p className={s.fieldName}>{op.fieldName}</p>
                </div>
                {showArea && (
                  <span className={s.area} aria-hidden="true">
                    {op.areaProcessed} {haUnit}
                  </span>
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
