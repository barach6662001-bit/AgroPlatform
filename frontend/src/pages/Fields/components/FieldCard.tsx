import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { FieldDto } from '../../../types/field';
import { useTranslation } from '../../../i18n';
import { getCropTagStyle } from '../../../utils/cropTagColors';
import { Card } from '../../../design-system';
import s from './FieldCard.module.css';

interface Props {
  field: FieldDto;
}

/**
 * FieldCard — tile rendered inside the fields grid (FieldsList).
 *
 * Phase 2a: outer container migrated from `<div className={s.card}>`
 * to the design-system `<Card>` primitive. Card supplies the
 * background, border and radius from tokens (`radius="lg"` mirrors
 * the legacy `var(--radius-lg)`); Card's auto padding/gap are
 * disabled (`p="0"`, `gap="0"`) because this tile composes its own
 * internal layout — a thumb that bleeds to the edges plus an info
 * block with its own padding. The local CSS module retains only the
 * tile-specific affordances (cursor, hover lift + shadow, the
 * absolutely-positioned hover overlay, the focus-visible ring and
 * the inner thumb/info/badge/pill rules).
 *
 * Phase 2b: pays down the accessibility debt left over from 2a.
 * The clickable wrapper now exposes `role="button"`, `tabIndex={0}`
 * and an explicit `onKeyDown` handler that activates on Enter and
 * Space (matching native button semantics). An `aria-label` summarises
 * the tile's primary content for assistive tech. The hover overlay's
 * inner CTA was a real `<button>` nested inside a `role="button"`
 * surface — invalid markup — and is now a non-interactive `<span>`
 * styled identically (the parent surface is the activation target).
 * Card / Surface API is unchanged; this is a pure FieldCard fix.
 */
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

  const goToField = () => navigate(`/fields/${field.id}`);
  const handleKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      goToField();
    }
  };

  // Compact, screen-reader-friendly summary of the tile's primary content
  // — name, area, and (when known) the current crop. Mirrors what a sighted
  // user reads in the top-left of the card without duplicating the entire
  // ownership / cadastral block. The `га` unit is used as a literal here to
  // match the existing on-screen badge (`<span>{areaHectares.toFixed(1)} га</span>`)
  // — i18n.fields has no `areaUnit` key and adding one is out of scope.
  const ariaLabel = cropLabel
    ? `${field.name}, ${field.areaHectares.toFixed(1)} га, ${cropLabel}`
    : `${field.name}, ${field.areaHectares.toFixed(1)} га`;

  return (
    <Card
      as="div"
      radius="lg"
      p="0"
      gap="0"
      className={s.card}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={goToField}
      onKeyDown={handleKeyDown}
    >
      {/* Polygon preview placeholder */}
      <div className={s.thumb}>
        <svg viewBox="0 0 80 60" className={s.thumbSvg}>
          <polygon
            points="40,8 72,22 65,52 15,52 8,22"
            fill={cropStyle ? String(cropStyle.background) : 'rgba(34,197,94,0.12)'}
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

      {/* Hover CTA — purely decorative (the parent Card is the
          activation target). aria-hidden keeps it out of the AT tree
          since the card's aria-label already describes the action. */}
      <div className={s.hoverOverlay} aria-hidden="true">
        <span className={s.viewBtn}>
          {t.fields.details} <ArrowRight size={12} />
        </span>
      </div>
    </Card>
  );
}
