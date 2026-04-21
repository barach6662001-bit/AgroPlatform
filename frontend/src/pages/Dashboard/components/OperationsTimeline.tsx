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

        return (
          <div
            key={op.id}
            className={s.item}
            onClick={() => navigate(`/operations/${op.id}`)}
          >
            <div className={s.iconWrap}>
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
            <div className={s.badge} data-status={status}>
              {op.isCompleted ? t.operations.completed : t.operations.inProgress}
            </div>
          </div>
        );
      })}
    </div>
  );
}
