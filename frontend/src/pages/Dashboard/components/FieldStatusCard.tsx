import type { KeyboardEvent } from 'react';
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

/**
 * FieldStatusCard — compact "fields snapshot" widget on the v1
 * dashboard. The header CTA ("Усі поля") and the empty-state CTA
 * ("Add field") are already real <button> elements, so the only
 * accessibility debt was the per-row clickable wrapper:
 *
 *   <div className={s.row} onClick={() => navigate('/fields')}>
 *
 * with `cursor: pointer` in the CSS module but no role, no tabIndex,
 * no keyboard handler, no accessible name. Phase 2e flagged this as
 * the **last plain `<div onClick>` row in the codebase** and a
 * low-risk paydown identical to Phases 2b / 2d.
 *
 * Phase 2f applies that proven pattern verbatim:
 *   - role="button" + tabIndex={0} + onKeyDown (Enter, Space) on each
 *     row, with preventDefault on Space to suppress page scroll
 *   - aria-label summarising the row exactly as it reads visually,
 *     so screen readers can distinguish rows even though every row
 *     navigates to the same `/fields` destination
 *   - the decorative crop tag, area pill and area-bar are marked
 *     aria-hidden because their content is duplicated in aria-label
 *     (the bar is purely a visual indicator with no textual content
 *     of its own)
 *   - a token-driven :focus-visible ring (var(--brand), 2px, offset
 *     2px) lives in the CSS module, paired with the existing hover
 *     background so keyboard and mouse focus look identical
 *
 * No nested <button> exists inside the row, so the FieldCard
 * "decorative button → presentation span" step from Phase 2b does
 * not apply here.
 *
 * Visual layout, the navigation target (/fields), the field
 * filter / sort / slice(0, 6) logic, the empty-state behaviour
 * including the optional `onAddField` prop, and every i18n string
 * are preserved verbatim. The Card / Surface API is not touched,
 * no dependencies are added, no routes change.
 */
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
            const areaText = `${field.areaHectares.toFixed(1)} га`;

            // Concise screen-reader summary mirroring the row's
            // visible content. Each aria-label is field-specific even
            // though every row navigates to the same /fields page —
            // assistive tech users still need to tell rows apart.
            const ariaLabel = `${field.name}, ${cropLabel}, ${areaText}`;

            const goToFields = () => navigate('/fields');
            const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                goToFields();
              }
            };

            return (
              <div
                key={field.id}
                className={s.row}
                role="button"
                tabIndex={0}
                aria-label={ariaLabel}
                onClick={goToFields}
                onKeyDown={handleKeyDown}
              >
                <div className={s.rowLeft}>
                  <span className={s.fieldName}>{field.name}</span>
                  <div className={s.bar} aria-hidden="true">
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
                    aria-hidden="true"
                  >
                    {cropLabel}
                  </span>
                  <span className={s.area} aria-hidden="true">{areaText}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
