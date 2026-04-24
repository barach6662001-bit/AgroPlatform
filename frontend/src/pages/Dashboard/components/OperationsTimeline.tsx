import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock3, AlertTriangle } from 'lucide-react';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import type { AgroOperationDto } from '../../../types/operation';
import { useTranslation } from '../../../i18n';
import s from './OperationsTimeline.module.css';

dayjs.extend(relativeTime);

interface Props {
  operations: AgroOperationDto[];
}

/**
 * OperationsTimeline — recent-activity list rendered inside the dashboard
 * "Recent activity" panel. Each row is a clickable navigation target
 * pointing at /operations/{id}.
 *
 * Phase 1f migrated the OUTER panel container to the design-system
 * <Card> primitive; this list and its rows were left as plain divs to
 * preserve the dense timeline layout. That migration carried the same
 * accessibility debt FieldCard had after Phase 2a — onClick on a non-
 * semantic wrapper, no keyboard activation and no descriptive name for
 * assistive tech.
 *
 * Phase 2c pays down that debt using the same proven pattern that
 * Phase 2b applied to FieldCard:
 *   - role="button" + tabIndex={0} + onKeyDown (Enter, Space) on each
 *     row, with preventDefault on Space to suppress page scroll
 *   - aria-label summarising the row (operation type + field + status,
 *     plus the relative date when present) so screen readers announce
 *     a meaningful destination instead of an unnamed button
 *   - the status badge is a presentational <div>; aria-hidden keeps it
 *     out of the AT tree because the row's own aria-label already
 *     conveys completion status
 *   - a token-driven :focus-visible ring lives in the CSS module
 *
 * No nested <button> existed inside the row, so the FieldCard
 * "decorative button → span" step from Phase 2b does not apply here.
 *
 * Visual layout, the navigation target and all i18n strings are
 * preserved verbatim. Card / Surface API is unchanged.
 */
export default function OperationsTimeline({ operations }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (operations.length === 0) {
    return (
      <div className={s.empty}>
        <Clock3 size={28} strokeWidth={1.5} className={s.emptyIcon} />
        <p>{t.dashboard.noActivity}</p>
      </div>
    );
  }

  return (
    <div className={s.list}>
      {operations.map((op, i) => {
        const date = op.completedDate ?? op.plannedDate;
        const relDate = date ? dayjs(date).fromNow() : '';
        const opLabel = t.operationTypes[op.operationType as keyof typeof t.operationTypes] || op.operationType;
        const today = dayjs().startOf('day');
        const isOverdue = !op.isCompleted && op.plannedDate ? dayjs(op.plannedDate).isBefore(today) : false;
        const status: 'done' | 'overdue' | 'pending' = op.isCompleted
          ? 'done'
          : isOverdue ? 'overdue' : 'pending';

        const goToOperation = () => navigate(`/operations/${op.id}`);
        const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            goToOperation();
          }
        };

        // Concise screen-reader summary mirroring what a sighted user
        // reads on the row — operation name, field name, status, and
        // (when present) the relative date already shown next to the
        // field name. Keeps AT output in sync with the visual.
        const statusText = op.isCompleted
          ? t.operations.completed
          : t.operations.inProgress;
        const ariaLabel = relDate
          ? `${opLabel}, ${op.fieldName}, ${statusText}, ${relDate}`
          : `${opLabel}, ${op.fieldName}, ${statusText}`;

        return (
          <div
            key={op.id}
            className={s.item}
            role="button"
            tabIndex={0}
            aria-label={ariaLabel}
            onClick={goToOperation}
            onKeyDown={handleKeyDown}
          >
            <div className={s.iconWrap} aria-hidden="true">
              {status === 'done'    && <CheckCircle2 size={14} strokeWidth={2} className={s.iconDone} />}
              {status === 'overdue' && <AlertTriangle size={14} strokeWidth={2} className={s.iconOverdue} />}
              {status === 'pending' && <Clock3 size={14} strokeWidth={2} className={s.iconPending} />}
              {i < operations.length - 1 && <div className={s.connector} />}
            </div>
            <div className={s.content}>
              <div className={s.opName}>{opLabel}</div>
              <div className={s.meta}>
                <span className={s.fieldName}>{op.fieldName}</span>
                {relDate && <span className={s.time}>{relDate}</span>}
              </div>
            </div>
            <div className={s.badge} data-status={status} aria-hidden="true">
              {op.isCompleted ? t.operations.completed : t.operations.inProgress}
            </div>
          </div>
        );
      })}
    </div>
  );
}
