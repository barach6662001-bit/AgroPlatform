import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Spin, message } from 'antd';
import {
  Building2, Users as UsersIcon, Map, Activity,
  Tractor, Warehouse as WarehouseIcon, UserCog, Plug,
  Download, ArrowRight,
} from 'lucide-react';
import { useTranslation } from '../../i18n';
import { formatUA } from '../../utils/numberFormat';
import { getPlatformStats, type PlatformStatsDto } from '../../api/platform';
import { getCompanies } from '../../api/companies';
import { exportToCsv } from '../../utils/exportCsv';
import s from './ControlCenter.module.css';

/**
 * SuperAdmin Control Center — platform-wide KPI dashboard with quick links
 * to company management, integrations and bulk export.  Only visible to
 * users with the SuperAdmin role (route is gated in App.tsx).
 */
export default function ControlCenter() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<PlatformStatsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await getPlatformStats();
        if (mounted) setStats(data);
      } catch {
        if (mounted) message.error(t.superAdmin.loadStatsError);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [t.superAdmin.loadStatsError]);

  /** Export the full company list to a BOM-prefixed CSV (opens in Excel). */
  const handleExportCompanies = async () => {
    setExporting(true);
    try {
      const companies = await getCompanies();
      exportToCsv(
        `agroplatform-companies-${new Date().toISOString().slice(0, 10)}`,
        companies,
        [
          { key: 'name',         title: t.superAdmin.companyName },
          { key: 'companyName',  title: t.superAdmin.legalName },
          { key: 'edrpou',       title: t.superAdmin.edrpou },
          { key: 'address',      title: t.superAdmin.address },
          { key: 'phone',        title: t.superAdmin.phone },
          { key: 'userCount',    title: t.superAdmin.userCount },
          { key: 'isActive',     title: t.common.status },
          { key: 'createdAtUtc', title: t.common.date },
        ],
      );
      message.success(t.superAdmin.exportCompaniesSuccess);
    } catch {
      message.error(t.superAdmin.exportCompaniesError);
    } finally {
      setExporting(false);
    }
  };

  const tiles = stats ? [
    { icon: <Building2    size={18} strokeWidth={1.6} />, label: t.superAdmin.statsCompanies,  value: stats.totalCompanies,  sub: `${stats.activeCompanies} ${t.superAdmin.statsActiveCompanies}`, accent: true },
    { icon: <UsersIcon    size={18} strokeWidth={1.6} />, label: t.superAdmin.statsUsers,      value: stats.totalUsers,      sub: `${stats.activeUsers} ${t.superAdmin.statsActiveUsers}` },
    { icon: <Map          size={18} strokeWidth={1.6} />, label: t.superAdmin.statsFields,     value: stats.totalFields,     sub: `${formatUA(stats.totalAreaHectares)} га` },
    { icon: <Activity     size={18} strokeWidth={1.6} />, label: t.superAdmin.statsOperations, value: stats.totalOperations },
    { icon: <Tractor      size={18} strokeWidth={1.6} />, label: t.superAdmin.statsMachines,   value: stats.totalMachines },
    { icon: <WarehouseIcon size={18} strokeWidth={1.6} />, label: t.superAdmin.statsWarehouses, value: stats.totalWarehouses },
    { icon: <UserCog      size={18} strokeWidth={1.6} />, label: t.superAdmin.statsEmployees,  value: stats.totalEmployees },
  ] : [];

  return (
    <div className={`${s.page} page-enter`}>
      {/* ── Header ── */}
      <header className={s.header}>
        <div>
          <span className={s.eyebrow}>
            <span className={s.eyebrowDot} aria-hidden="true" />
            SUPERADMIN
          </span>
          <h1 className={s.title}>{t.superAdmin.controlCenterTitle}</h1>
          <p className={s.subtitle}>{t.superAdmin.controlCenterSubtitle}</p>
        </div>
      </header>

      {/* ── KPI grid ── */}
      {loading ? (
        <div className={s.spinWrap}><Spin /></div>
      ) : (
        <>
          <section className={s.kpiGrid}>
            {tiles.map((tile) => (
              <div
                key={tile.label}
                className={`${s.kpi} ${tile.accent ? s.kpiAccent : ''}`}
              >
                <span className={s.kpiIcon}>{tile.icon}</span>
                <span className={s.kpiLabel}>{tile.label}</span>
                <span className={s.kpiValue}>{formatUA(tile.value)}</span>
                {tile.sub && <span className={s.kpiSub}>{tile.sub}</span>}
              </div>
            ))}
          </section>

          {/* ── Quick actions ── */}
          <section className={s.section}>
            <h2 className={s.sectionLabel}>{t.superAdmin.quickActions}</h2>
            <div className={s.actionGrid}>
              <Link to="/superadmin/companies" className={s.actionCard}>
                <Building2 size={18} strokeWidth={1.6} />
                <span className={s.actionLabel}>{t.superAdmin.manageCompanies}</span>
                <ArrowRight size={14} className={s.actionArrow} />
              </Link>

              <button
                type="button"
                className={s.actionCard}
                onClick={handleExportCompanies}
                disabled={exporting}
              >
                <Download size={18} strokeWidth={1.6} />
                <span className={s.actionLabel}>{t.superAdmin.exportCompanies}</span>
                <ArrowRight size={14} className={s.actionArrow} />
              </button>

              <button
                type="button"
                className={s.actionCard}
                onClick={() => navigate('/superadmin/integrations')}
              >
                <Plug size={18} strokeWidth={1.6} />
                <span className={s.actionLabel}>{t.superAdmin.integrations}</span>
                <ArrowRight size={14} className={s.actionArrow} />
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
