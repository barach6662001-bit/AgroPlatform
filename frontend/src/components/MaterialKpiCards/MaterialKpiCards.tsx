import { Row, Col, Card, Statistic, Skeleton } from 'antd';
import type { MaterialKpiItem } from '../../types/economics';
import { formatUA } from '../../utils/numberFormat';

/** Background colour for the "Всього / Total" highlighted card (SASAgro blue). */
const TOTAL_BG      = '#1F6FEB';
const TOTAL_BORDER  = '#2D7FF5';
const TOTAL_TEXT    = '#FFFFFF';
const TOTAL_ICON    = 'rgba(255,255,255,0.85)';

/** Default card appearance (dark surface, matching app theme). */
const CARD_BG       = '#161B22';
const CARD_BORDER   = '#30363D';
const CARD_TEXT     = '#E6EDF3';
const CARD_ICON     = '#8B949E';

interface Props {
  /** Pre-built KPI items to display. Pass an empty array or undefined while loading. */
  items: MaterialKpiItem[];
  /** When true, renders skeleton placeholders instead of real data. */
  loading?: boolean;
}

/**
 * MaterialKpiCards – six KPI summary cards for material economics.
 *
 * Cards: Добрива · Насіння · Хімікати · Паливо · Врожай · Всього
 *
 * The "Всього / Total" card receives a distinct blue background (SASAgro style).
 * All other cards use the standard dark surface matching the app theme.
 *
 * Values are formatted with `formatUA` (тис. / млн suffixes) for consistency.
 */
export default function MaterialKpiCards({ items, loading = false }: Props) {
  if (loading) {
    return (
      <Row gutter={[16, 16]} data-testid="material-kpi-cards-loading">
        {Array.from({ length: 6 }).map((_, i) => (
          <Col key={i} xs={24} sm={12} md={8} lg={4}>
            <Card
              style={{ background: CARD_BG, border: `1px solid ${CARD_BORDER}` }}
              styles={{ body: { padding: '16px 20px' } }}
            >
              <Skeleton active paragraph={false} />
            </Card>
          </Col>
        ))}
      </Row>
    );
  }

  return (
    <Row gutter={[16, 16]} data-testid="material-kpi-cards">
      {items.map((item) => {
        const isTotal = item.isTotal === true;

        const cardStyle: React.CSSProperties = isTotal
          ? {
              background: TOTAL_BG,
              border: `1px solid ${TOTAL_BORDER}`,
              boxShadow: '0 4px 16px rgba(31,111,235,0.35)',
            }
          : {
              background: CARD_BG,
              border: `1px solid ${CARD_BORDER}`,
            };

        const iconStyle: React.CSSProperties = {
          fontSize: 22,
          color: isTotal ? TOTAL_ICON : CARD_ICON,
        };

        const titleStyle: React.CSSProperties = {
          color: isTotal ? 'rgba(255,255,255,0.85)' : '#8B949E',
          fontSize: 12,
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.4px',
        };

        const valueStyle: React.CSSProperties = {
          color: isTotal ? TOTAL_TEXT : CARD_TEXT,
          fontSize: isTotal ? 22 : 20,
          fontWeight: isTotal ? 700 : 600,
        };

        return (
          <Col key={item.key} xs={24} sm={12} md={8} lg={4}>
            <Card
              data-testid={`kpi-card-${item.key}`}
              data-variant={isTotal ? 'total' : 'default'}
              style={cardStyle}
              styles={{ body: { padding: '16px 20px' } }}
            >
              {/* Icon row */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 8,
                }}
              >
                <span style={iconStyle} aria-hidden="true">
                  {item.icon}
                </span>
              </div>

              {/* Title */}
              <div style={titleStyle}>{item.label}</div>

              {/* Value */}
              <Statistic
                value={formatUA(item.amount)}
                suffix="UAH"
                valueStyle={valueStyle}
                style={{ marginTop: 4 }}
              />
            </Card>
          </Col>
        );
      })}
    </Row>
  );
}
