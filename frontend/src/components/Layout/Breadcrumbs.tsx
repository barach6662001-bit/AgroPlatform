import { Link, useLocation } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { useTranslation } from '../../i18n';
import s from './Breadcrumbs.module.css';

export default function Breadcrumbs() {
  const location = useLocation();
  const { t } = useTranslation();

  const segments = location.pathname.split('/').filter(Boolean);

  // Map known route segments to friendly i18n labels with safe fallbacks.
  const labelFor = (seg: string, fullPath: string): string => {
    const n = (t.nav ?? {}) as Record<string, string>;
    const exact: Record<string, string | undefined> = {
      dashboard: n.dashboard,
      fields: n.fields,
      operations: n.operations,
      machinery: n.machinery,
      fleet: n.fleet,
      warehouses: n.warehouses,
      storage: n.grainModule,
      fuel: n.fuelStation,
      economics: n.finance,
      sales: n.sales,
      hr: n.hr,
      analytics: n.analytics,
      settings: n.settings,
      admin: n.settings,
      superadmin: n.settings,
      profile: t.auth?.profile ?? 'Profile',
      pnl: n.pnl,
      budget: n.budget,
      leases: n.leases,
      employees: n.employees,
      worklogs: n.workLogs,
      salary: n.salary,
      efficiency: n.efficiency,
      resources: n.resources,
      marginality: n.marginality,
      'rotation-advisor': n.cropRotationAdvisor,
      items: n.materials,
      users: n.users,
      audit: n.auditLog,
      'role-permissions': n.rolePermissions,
      approvals: n.approvals,
      'approval-rules': n.approvalRules,
      'api-keys': n.apiKeys,
      companies: n.companies,
    };
    if (exact[seg]) return exact[seg]!;
    // numeric or uuid → "#"
    if (/^\d+$/.test(seg)) return `#${seg}`;
    if (/^[0-9a-f-]{8,}$/i.test(seg)) return '…';
    void fullPath;
    return seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ');
  };

  // Build href chain
  const crumbs = segments.map((seg, idx) => {
    const path = '/' + segments.slice(0, idx + 1).join('/');
    return { seg, path, label: labelFor(seg, path) };
  });

  if (crumbs.length === 0) {
    return (
      <nav className={s.wrap} aria-label="breadcrumb">
        <span className={s.current}>{(t.nav as Record<string, string>)?.dashboard ?? 'Dashboard'}</span>
      </nav>
    );
  }

  return (
    <nav className={s.wrap} aria-label="breadcrumb">
      {crumbs.map((c, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={c.path} className={s.item}>
            {isLast ? (
              <span className={s.current}>{c.label}</span>
            ) : (
              <Link to={c.path} className={s.link}>{c.label}</Link>
            )}
            {!isLast && (
              <ChevronRight size={11} className={s.sep} aria-hidden="true" />
            )}
          </span>
        );
      })}
    </nav>
  );
}
