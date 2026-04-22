import { Link } from 'react-router-dom';
import { FileSpreadsheet, Database, Code2, MapPin } from 'lucide-react';
import { useTranslation } from '../../i18n';
import s from './IntegrationsPage.module.css';

type Status = 'available' | 'soon' | 'planned';

interface Integration {
  icon: React.ReactNode;
  title: string;
  status: Status;
  statusText: string;
  description: string;
  requirementsTitle?: string;
  requirements?: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

/**
 * SuperAdmin Integrations page — honest status of external integrations.
 * Excel/CSV and the public REST API are live today; 1C is on the roadmap
 * (requires infrastructure listed in the card); GPS telematics is planned.
 */
export default function IntegrationsPage() {
  const { t } = useTranslation();

  const integrations: Integration[] = [
    {
      icon: <FileSpreadsheet size={20} strokeWidth={1.6} />,
      title: t.superAdmin.intgExcelTitle,
      status: 'available',
      statusText: t.superAdmin.intgExcelStatus,
      description: t.superAdmin.intgExcelDesc,
      ctaLabel: t.superAdmin.intgExcelCta,
      ctaHref: '/warehouses/import',
    },
    {
      icon: <Database size={20} strokeWidth={1.6} />,
      title: t.superAdmin.intg1CTitle,
      status: 'soon',
      statusText: t.superAdmin.intg1CStatus,
      description: t.superAdmin.intg1CDesc,
      requirementsTitle: t.superAdmin.intg1CRoadmap,
      requirements: [
        t.superAdmin.intg1CReq1,
        t.superAdmin.intg1CReq2,
        t.superAdmin.intg1CReq3,
        t.superAdmin.intg1CReq4,
      ],
    },
    {
      icon: <Code2 size={20} strokeWidth={1.6} />,
      title: t.superAdmin.intgApiTitle,
      status: 'available',
      statusText: t.superAdmin.intgApiStatus,
      description: t.superAdmin.intgApiDesc,
      ctaLabel: t.superAdmin.intgApiCta,
      ctaHref: '/admin/api-keys',
    },
    {
      icon: <MapPin size={20} strokeWidth={1.6} />,
      title: t.superAdmin.intgTelematicsTitle,
      status: 'planned',
      statusText: t.superAdmin.intgTelematicsStatus,
      description: t.superAdmin.intgTelematicsDesc,
    },
  ];

  return (
    <div className={`${s.page} page-enter`}>
      <header className={s.header}>
        <h1 className={s.title}>{t.superAdmin.integrationsTitle}</h1>
        <p className={s.subtitle}>{t.superAdmin.integrationsSubtitle}</p>
      </header>

      <div className={s.grid}>
        {integrations.map((it) => (
          <article key={it.title} className={`${s.card} ${s[`status_${it.status}`]}`}>
            <div className={s.cardHead}>
              <span className={s.iconBox}>{it.icon}</span>
              <div className={s.titleStack}>
                <h3 className={s.cardTitle}>{it.title}</h3>
                <span className={`${s.statusBadge} ${s[`badge_${it.status}`]}`}>
                  {it.statusText}
                </span>
              </div>
            </div>

            <p className={s.cardDesc}>{it.description}</p>

            {it.requirements && (
              <>
                <div className={s.reqLabel}>{it.requirementsTitle}</div>
                <ul className={s.reqList}>
                  {it.requirements.map((req) => <li key={req}>{req}</li>)}
                </ul>
              </>
            )}

            {it.ctaHref && it.ctaLabel && (
              <Link to={it.ctaHref} className={s.cardCta}>{it.ctaLabel}</Link>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
