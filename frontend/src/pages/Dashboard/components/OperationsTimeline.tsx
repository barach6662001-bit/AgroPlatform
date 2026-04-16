import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock3 } from 'lucide-react';
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

        return (
          <div
            key={op.id}
            className={s.item}
            onClick={() => navigate(`/operations/${op.id}`)}
          >
            <div className={s.iconWrap}>
              {op.isCompleted
                ? <CheckCircle2 size={14} strokeWidth={2} className={s.iconDone} />
                : <Clock3 size={14} strokeWidth={2} className={s.iconPending} />
              }
              {i < operations.length - 1 && <div className={s.connector} />}
            </div>
            <div className={s.content}>
              <div className={s.opName}>{opLabel}</div>
              <div className={s.meta}>
                <span className={s.fieldName}>{op.fieldName}</span>
                {relDate && <span className={s.time}>{relDate}</span>}
              </div>
            </div>
            <div className={s.badge} data-done={op.isCompleted}>
              {op.isCompleted ? t.operations.completed : t.operations.inProgress}
            </div>
          </div>
        );
      })}
    </div>
  );
}
