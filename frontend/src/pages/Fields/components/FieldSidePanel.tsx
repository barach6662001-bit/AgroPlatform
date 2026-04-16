import { useNavigate } from 'react-router-dom';
import { ArrowRight, Edit2, Download, MapPin, Leaf, Grid, FileText } from 'lucide-react';
import type { FieldDto } from '../../../types/field';
import { useTranslation } from '../../../i18n';
import { getCropTagStyle } from '../../../utils/cropTagColors';
import s from './FieldSidePanel.module.css';

interface Props {
  fieldName?: string;
  fields: FieldDto[];
  onEdit?: (field: FieldDto) => void;
  onExport?: (field: FieldDto) => void;
}

const NDVI_VALUE = 0.72;

export default function FieldSidePanel({ fieldName, fields, onEdit, onExport }: Props) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (!fieldName) {
    return (
      <div className={s.placeholder}>
        <MapPin size={32} strokeWidth={1} className={s.placeholderIcon} />
        <p className={s.placeholderText}>{t.fields.selectFieldOnMap}</p>
      </div>
    );
  }

  const field = fields.find(f => f.name === fieldName);
  if (!field) {
    return (
      <div className={s.placeholder}>
        <p className={s.placeholderText}>{t.fields.noCoordinates}</p>
      </div>
    );
  }

  const cropKey = field.currentCrop as keyof typeof t.crops | undefined;
  const cropLabel = cropKey ? (t.crops[cropKey] || field.currentCrop) : null;
  const cropStyle = cropLabel ? getCropTagStyle(cropLabel) : undefined;

  const ownershipLabels: Record<number, string> = {
    0: t.fields.ownershipOwnLand,
    1: t.fields.ownershipLease,
    2: t.fields.ownershipShareLease,
  };

  const ndviPct = ((NDVI_VALUE + 1) / 2) * 100; // scale [-1,1] → [0,100]

  return (
    <div className={s.panel}>
      {/* Hero title */}
      <div className={s.hero}>
        <div className={s.heroLeft}>
          <h2 className={s.fieldName}>{field.name}</h2>
          <p className={s.fieldSub}>{field.soilType || t.fields.soilType}</p>
        </div>
        {cropLabel && (
          <span className={s.cropBadge} style={cropStyle}>{cropLabel}</span>
        )}
      </div>

      {/* Metrics 2x2 */}
      <div className={s.metricsGrid}>
        <div className={s.metric}>
          <div className={s.metricIcon}><Grid size={14} /></div>
          <div className={s.metricLabel}>{t.fields.area}</div>
          <div className={s.metricValue}>{field.areaHectares.toFixed(2)} <span className={s.metricUnit}>га</span></div>
        </div>
        <div className={s.metric}>
          <div className={s.metricIcon}><Leaf size={14} /></div>
          <div className={s.metricLabel}>{t.fields.currentCrop}</div>
          <div className={s.metricValue}>
            {cropLabel || <span className={s.metricEmpty}>{t.fields.notSeeded}</span>}
          </div>
        </div>
        <div className={s.metric}>
          <div className={s.metricIcon}><FileText size={14} /></div>
          <div className={s.metricLabel}>{t.fields.ownershipType}</div>
          <div className={s.metricValue}>{ownershipLabels[field.ownershipType] ?? '—'}</div>
        </div>
        <div className={s.metric}>
          <div className={s.metricIcon}><MapPin size={14} /></div>
          <div className={s.metricLabel}>{t.fields.cadastralNumber}</div>
          <div className={s.metricValueMono}>{field.cadastralNumber || '—'}</div>
        </div>
      </div>

      {/* NDVI gauge */}
      <div className={s.ndviCard}>
        <div className={s.ndviTop}>
          <span className={s.ndviLabel}>{t.fields.ndviIndex}</span>
          <span className={s.ndviValue} data-good={NDVI_VALUE >= 0.5}>{NDVI_VALUE.toFixed(2)}</span>
        </div>
        <div className={s.ndviSubtext}>{t.fields.ndviStatusGood} · {t.fields.ndviUpdated}</div>
        <div className={s.ndviBar}>
          <div
            className={s.ndviRamp}
          />
          <div
            className={s.ndviMarker}
            style={{ left: `${ndviPct}%` }}
          />
        </div>
        <div className={s.ndviLabels}>
          <span>-1</span>
          <span>0</span>
          <span>+1</span>
        </div>
      </div>

      {/* CTA */}
      <button
        className={s.ctaPrimary}
        onClick={() => navigate(`/fields/${field.id}`)}
      >
        {t.fields.details} <ArrowRight size={14} />
      </button>

      {/* Secondary actions */}
      <div className={s.secondaryActions}>
        {onEdit && (
          <button className={s.btnSecondary} onClick={() => onEdit(field)}>
            <Edit2 size={13} /> {t.common.edit}
          </button>
        )}
        {onExport && (
          <button className={s.btnSecondary} onClick={() => onExport(field)}>
            <Download size={13} /> {t.common.export}
          </button>
        )}
      </div>
    </div>
  );
}
