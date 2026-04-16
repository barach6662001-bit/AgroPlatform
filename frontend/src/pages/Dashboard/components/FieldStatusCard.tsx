import { useNavigate } from 'react-router-dom';
import { ArrowRight, PlusCircle } from 'lucide-react';
import type { FieldDto } from '../../../types/field';
import { useTranslation } from '../../../i18n';
import { getCropTagStyle } from '../../../utils/cropTagColors';
import s from './FieldStatusCard.module.css';

interface Props {
  fields: FieldDto[];
  onAddField?: () => void;
}

export default function FieldStatusCard({ fields, onAddField }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const maxArea = Math.max(...fields.map(f => f.areaHectares), 1);

  return (
    <div className={s.card}>
      <div className={s.header}>
        <span className={s.title}>{t.dashboard.fieldsStatus}</span>
        <button className={s.viewAll} onClick={() => navigate('/fields')}>
          {'Усі поля'} <ArrowRight size={12} />
        </button>
      </div>

      {fields.length === 0 ? (
        <div className={s.empty}>
          <div className={s.emptyIcon}>🌾</div>
          <p className={s.emptyTitle}>{t.dashboard.getStarted}</p>
          <p className={s.emptyDesc}>{t.dashboard.addFirstField}</p>
          <button className={s.addBtn} onClick={onAddField ?? (() => navigate('/fields'))}>
            <PlusCircle size={14} /> {t.fields.addField}
          </button>
        </div>
      ) : (
        <div className={s.list}>
          {fields.slice(0, 6).map(field => {
            const cropKey = field.currentCrop as keyof typeof t.crops | undefined;
            const cropLabel = cropKey ? (t.crops[cropKey] || field.currentCrop) : t.fields.notSeeded;
            const cropStyle = field.currentCrop ? getCropTagStyle(cropLabel ?? '') : undefined;
            const areaPct = (field.areaHectares / maxArea) * 100;

            return (
              <div key={field.id} className={s.row} onClick={() => navigate('/fields')}>
                <div className={s.rowLeft}>
                  <span className={s.fieldName}>{field.name}</span>
                  <div className={s.bar}>
                    <div
                      className={s.barFill}
                      style={{
                        width: `${areaPct}%`,
                        background: cropStyle?.background ?? 'var(--brand)',
                      }}
                    />
                  </div>
                </div>
                <div className={s.rowRight}>
                  <span
                    className={s.cropTag}
                    style={cropStyle ? { background: cropStyle.background, color: cropStyle.color } : undefined}
                  >
                    {cropLabel}
                  </span>
                  <span className={s.area}>{field.areaHectares.toFixed(1)} га</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
