import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { FieldDto } from '../../../types/field';
import { useTranslation } from '../../../i18n';
import { getCropTagStyle } from '../../../utils/cropTagColors';
import s from './FieldCard.module.css';

interface Props {
  field: FieldDto;
}

export default function FieldCard({ field }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const cropKey = field.currentCrop as keyof typeof t.crops | undefined;
  const cropLabel = cropKey ? (t.crops[cropKey] || field.currentCrop) : null;
  const cropStyle = cropLabel ? getCropTagStyle(cropLabel) : undefined;

  const ownershipLabels: Record<number, string> = {
    0: t.fields.ownershipOwnLand,
    1: t.fields.ownershipLease,
    2: t.fields.ownershipShareLease,
  };

  return (
    <div className={s.card} onClick={() => navigate(`/fields/${field.id}`)}>
      {/* Polygon preview placeholder */}
      <div className={s.thumb}>
        <svg viewBox="0 0 80 60" className={s.thumbSvg}>
          <polygon
            points="40,8 72,22 65,52 15,52 8,22"
            fill={cropStyle?.background ?? 'rgba(34,197,94,0.12)'}
            stroke={cropStyle ? String(cropStyle.color) : '#22C55E'}
            strokeWidth="1.5"
            strokeOpacity="0.6"
          />
        </svg>
      </div>

      {/* Info */}
      <div className={s.info}>
        <div className={s.top}>
          <span className={s.name}>{field.name}</span>
          <span className={s.areaBadge}>{field.areaHectares.toFixed(1)} га</span>
        </div>

        {field.cadastralNumber && (
          <div className={s.cadastral}>{field.cadastralNumber}</div>
        )}

        <div className={s.bottom}>
          {cropLabel ? (
            <span className={s.cropPill} style={cropStyle}>{cropLabel}</span>
          ) : (
            <span className={s.noSeed}>{t.fields.notSeeded}</span>
          )}
          <span className={s.ownership}>{ownershipLabels[field.ownershipType] ?? '—'}</span>
        </div>
      </div>

      {/* Hover CTA */}
      <div className={s.hoverOverlay}>
        <button className={s.viewBtn}>
          {t.fields.details} <ArrowRight size={12} />
        </button>
      </div>
    </div>
  );
}
