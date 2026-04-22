import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import CountUp from 'react-countup';
import s from './KpiHeroRow.module.css';

export interface KpiItem {
  label: string;
  value: string;
  accentColor: string;
  icon?: ReactNode;
  trend?: string;
  delta?: string;
  deltaLabel?: string;
  hero?: boolean;
  /** Optional navigation target — when set, the whole card becomes a link. */
  href?: string;
}

interface Props {
  items: KpiItem[];
}

function parseNumeric(value: string): { num: number; suffix: string; decimals: number } | null {
  const match = value.match(/^([\d\s.,]+)\s*(.*)$/);
  if (!match) return null;
  const raw = match[1].replace(/\s/g, '').replace(',', '.');
  const num = parseFloat(raw);
  if (isNaN(num)) return null;
  const decimalPart = raw.split('.')[1];
  return { num, suffix: match[2] ? ' ' + match[2] : '', decimals: decimalPart ? decimalPart.length : 0 };
}

export default function KpiHeroRow({ items }: Props) {
  return (
    <div className={s.grid}>
      {items.map((item, i) => {
        const parsed = parseNumeric(item.value);
        const Wrapper = item.href ? Link : 'div';
        const wrapperProps = item.href
          ? { to: item.href, className: `${s.card} ${s.clickable} ${item.hero ? s.hero : ''}` }
          : { className: `${s.card} ${item.hero ? s.hero : ''}` };
        return (
          <Wrapper
            key={i}
            {...(wrapperProps as never)}
            style={{ '--kpi-accent': item.accentColor } as React.CSSProperties}
          >
            <div className={s.accentBar} />
            <div className={s.cardTop}>
              {item.icon && (
                <div className={s.iconCell}>{item.icon}</div>
              )}
              {item.trend && (
                <span className={`${s.trend} ${item.trend.startsWith('-') || item.trend.includes('↓') ? s.trendDown : s.trendUp}`}>
                  {item.trend}
                </span>
              )}
            </div>
            <div className={s.label}>{item.label}</div>
            <div className={s.value}>
              {parsed ? (
                <CountUp
                  end={parsed.num}
                  duration={1.2}
                  separator=" "
                  decimal=","
                  decimals={parsed.decimals}
                  suffix={parsed.suffix}
                />
              ) : item.value}
            </div>
            {item.delta && (
              <div className={s.delta}>
                <span className={s.deltaValue}>{item.delta}</span>
                {item.deltaLabel && <span className={s.deltaLabel}>{item.deltaLabel}</span>}
              </div>
            )}
          </Wrapper>
        );
      })}
    </div>
  );
}
