import { useState, useEffect, useMemo } from 'react';
import { Menu } from 'antd';
import {
  LayoutDashboard,
  Sprout,
  Warehouse,
  Tractor,
  Users,
  Banknote,
  BarChart3,
  Settings,
  Pin,
  PinOff,
  Clock,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { usePermissions } from '../../hooks/usePermissions';
import { useFeatureFlag } from '../../hooks/useFeatureFlag';
import { OptionalFeatureFlags } from '../../features/optionalFeatureFlags';
import { useSidebarStore } from '../../stores/sidebarStore';
import s from './Sidebar.module.css';

/* ──────────────────────────────────────────────────────────────
 * IA v3 — business-object groups, no duplicates, clean mental model.
 *   • Production   (what happens in the field: Fields + Operations + Rotation)
 *   • Warehouse    (stored goods: Warehouses + Materials + Grain + Fuel + Inventory)
 *   • Machinery    (equipment: Units + Fleet map)
 *   • Personnel    (HR: Employees + Timesheet + Salary)
 *   • Finance      (money moves only: Costs + Sales + Budget + Leases + P&L)
 *   • Analytics    (cross-cutting reports — dedupe vs Finance)
 *   • Settings     (admin only)
 * Pinned + Recent sections appear at the top/bottom based on user state.
 * ────────────────────────────────────────────────────────────── */

const GROUP_KEYS = new Set([
  'production-group', 'storage-group', 'machinery-group',
  'hr-group', 'finance-group', 'analytics-group', 'settings-group',
]);

/** Ordered prefix → group mapping used to auto-open the correct group on
 *  initial navigation. Longer / more-specific prefixes must come first. */
const ROUTE_TO_GROUP: Array<[string, string]> = [
  ['/fields/rotation-advisor', 'production-group'],
  ['/fields/leases',           'finance-group'],
  ['/finance/leases',          'finance-group'],
  ['/fields',                  'production-group'],
  ['/operations',              'production-group'],
  ['/warehouses',              'storage-group'],
  ['/storage',                 'storage-group'],
  ['/fuel',                    'storage-group'],
  ['/machinery',               'machinery-group'],
  ['/fleet',                   'machinery-group'],
  ['/hr',                      'hr-group'],
  ['/expenses',                'finance-group'],
  ['/economics',               'finance-group'],
  ['/sales',                   'finance-group'],
  ['/finance',                 'finance-group'],
  ['/analytics',               'analytics-group'],
  ['/settings',                'settings-group'],
  ['/admin',                   'settings-group'],
  ['/superadmin',              'settings-group'],
];

function getGroupForPath(pathname: string): string | null {
  for (const [prefix, group] of ROUTE_TO_GROUP) {
    if (pathname === prefix || pathname.startsWith(prefix + '/')) return group;
  }
  return null;
}

/** Per-role initial openKeys. Keeps the sidebar tidy for roles that
 *  historically only use one or two sections. */
function defaultOpenKeysForRole(role: string | null): string[] {
  switch (role) {
    case 'WarehouseOperator': return ['storage-group'];
    case 'Accountant':        return ['finance-group'];
    case 'Manager':           return ['production-group', 'finance-group'];
    default:                  return ['production-group'];
  }
}

interface SidebarProps {
  collapsed?: boolean;
}

export default function Sidebar({ collapsed = false }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { role, isAdmin, isSuperAdmin } = useRole();
  const { hasPermission } = usePermissions();

  const pinnedItems   = useSidebarStore((st) => st.pinnedItems);
  const recentItems   = useSidebarStore((st) => st.recentItems);
  const togglePin     = useSidebarStore((st) => st.togglePin);
  const recordVisit   = useSidebarStore((st) => st.recordVisit);

  const canFields      = hasPermission('Fields.View');
  const canMachinery   = hasPermission('Machinery.View');
  const canWarehouses  = hasPermission('Warehouses.View');
  const canEconomics   = hasPermission('Economics.View');
  const canHR          = hasPermission('HR.View');
  const canAnalytics   = hasPermission('Analytics.View');
  const canAdmin       = hasPermission('Admin.Manage');

  const budgetEnabled = useFeatureFlag(OptionalFeatureFlags.budget);
  const pnlEnabled = useFeatureFlag(OptionalFeatureFlags.pnlByFields);
  const analyticsMarginalityEnabled = useFeatureFlag(OptionalFeatureFlags.analyticsMarginality);
  const analyticsSeasonComparisonEnabled = useFeatureFlag(OptionalFeatureFlags.analyticsSeasonComparison);
  const analyticsBreakEvenEnabled = useFeatureFlag(OptionalFeatureFlags.analyticsBreakEven);
  const analyticsFieldEfficiencyEnabled = useFeatureFlag(OptionalFeatureFlags.analyticsFieldEfficiency);
  const analyticsResourceUsageEnabled = useFeatureFlag(OptionalFeatureFlags.analyticsResourceUsage);
  const analyticsExpenseAnalyticsEnabled = useFeatureFlag(OptionalFeatureFlags.analyticsExpenseAnalytics);
  const analyticsSalesAnalyticsEnabled = useFeatureFlag(OptionalFeatureFlags.analyticsSalesAnalytics);

  /* ── Group children ────────────────────────────────────────── */
  const productionChildren = [
    { key: '/fields',                    label: t.nav.fields },
    { key: '/operations',                label: t.nav.operations },
    { key: '/fields/rotation-advisor',   label: t.nav.cropRotationAdvisor },
  ];

  const storageChildren = [
    { key: '/warehouses',                label: t.nav.warehouses },
    { key: '/warehouses/items',          label: t.nav.materials },
    { key: '/warehouses/inventory',      label: t.nav.inventory },
    { key: '/storage',                   label: t.nav.grainModule },
    { key: '/fuel',                      label: t.nav.fuelStation },
  ];

  const machineryChildren = [
    { key: '/machinery',                 label: t.nav.machineryUnits },
    { key: '/fleet',                     label: t.nav.fleet },
  ];

  const hrChildren = [
    { key: '/hr/employees',              label: t.nav.employees },
    { key: '/hr/worklogs',               label: t.nav.workLogs },
    { key: '/hr/salary',                 label: t.nav.salary },
  ];

  const financeChildren = [
    { key: '/expenses',                  label: t.nav.costs },
    { key: '/sales',                     label: t.nav.sales },
    ...(budgetEnabled ? [{ key: '/economics/budget', label: t.nav.budget }] : []),
    { key: '/finance/leases',            label: t.nav.leases },
    ...(pnlEnabled ? [{ key: '/economics/pnl', label: t.nav.pnl }] : []),
  ];

  // Dedupe: marginality lives ONLY in Analytics now (previously also in Finance).
  const analyticsChildren = [
    ...(analyticsMarginalityEnabled ? [{ key: '/analytics/marginality', label: t.nav.marginality }] : []),
    ...(analyticsSeasonComparisonEnabled ? [{ key: '/economics/season-comparison', label: t.nav.seasonComparison }] : []),
    ...(analyticsBreakEvenEnabled ? [{ key: '/economics/break-even', label: t.nav.breakEven }] : []),
    ...(analyticsFieldEfficiencyEnabled ? [{ key: '/analytics/efficiency', label: t.nav.efficiency }] : []),
    ...(analyticsResourceUsageEnabled ? [{ key: '/analytics/resources', label: t.nav.resources }] : []),
    ...(analyticsExpenseAnalyticsEnabled ? [{ key: '/economics/analytics', label: t.nav.costAnalytics }] : []),
    ...(analyticsSalesAnalyticsEnabled ? [{ key: '/sales/analytics', label: t.nav.revenueAnalytics }] : []),
    { key: '/analytics/salary-fuel',     label: t.nav.salaryFuelAnalytics },
  ];

  const settingsChildren = [
    { key: '/settings/users',            label: t.nav.users },
    { key: '/admin/role-permissions',    label: t.nav.rolePermissions },
    { key: '/admin/approvals',           label: t.nav.approvals },
    { key: '/admin/approval-rules',      label: t.nav.approvalRules },
    { key: '/settings/audit',            label: t.nav.auditLog },
    { key: '/admin/api-keys',            label: t.nav.apiKeys },
    ...(isSuperAdmin
      ? [
          { key: '/admin/tenants',           label: t.admin.tenantsTitle },
          { key: '/superadmin',              label: t.superAdmin.controlCenterTitle },
          { key: '/superadmin/companies',    label: t.nav.companies },
          { key: '/superadmin/integrations', label: t.superAdmin.integrations },
        ]
      : []),
  ];

  /* ── Flat index of every leaf → label, for pins & recents to look up ── */
  const leafIndex = useMemo(() => {
    const idx = new Map<string, string>();
    idx.set('/dashboard', t.nav.dashboard);
    for (const g of [productionChildren, storageChildren, machineryChildren,
                     hrChildren, financeChildren, analyticsChildren, settingsChildren]) {
      for (const l of g) idx.set(l.key, l.label);
    }
    return idx;
  }, [t]);

  /* ── openKeys ────────────────────────────────────────────── */
  const [openKeys, setOpenKeys] = useState<string[]>(() => {
    const group = getGroupForPath(location.pathname);
    return group ? [group] : defaultOpenKeysForRole(role);
  });

  useEffect(() => {
    const group = getGroupForPath(location.pathname);
    if (group && !openKeys.includes(group)) {
      setOpenKeys((prev) => [...prev, group]);
    }
  }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ── Track visits for Recent section. Runs on every pathname change. ── */
  useEffect(() => {
    if (leafIndex.has(location.pathname)) {
      recordVisit(location.pathname);
    }
  }, [location.pathname, leafIndex, recordVisit]);

  /* ── Helpers ───────────────────────────────────────────── */
  /** JSX label with a hover-only pin toggle button. Pinning a route
   *  surfaces it at the top of the sidebar across sessions. */
  const leafLabel = (key: string, label: string) => {
    const isPinned = pinnedItems.includes(key);
    return (
      <span className={s.leaf}>
        <span className={s.leafText}>{label}</span>
        <button
          type="button"
          className={s.pinBtn}
          title={isPinned ? t.nav.unpinItem : t.nav.pinItem}
          aria-label={isPinned ? t.nav.unpinItem : t.nav.pinItem}
          onClick={(e) => { e.stopPropagation(); togglePin(key); }}
        >
          {isPinned
            ? <PinOff size={12} strokeWidth={1.6} />
            : <Pin    size={12} strokeWidth={1.6} />}
        </button>
      </span>
    );
  };

  /* ── Build items ────────────────────────────────────────── */
  const pinnedSection =
    pinnedItems.length > 0
      ? [
          {
            type: 'group' as const,
            key: 'pinned-group',
            label: t.nav.pinned,
            children: pinnedItems
              .filter((k) => leafIndex.has(k))
              .map((k) => ({
                key: k,
                icon: <Pin size={14} strokeWidth={1.5} />,
                label: leafLabel(k, leafIndex.get(k)!),
              })),
          },
          { type: 'divider' as const },
        ]
      : [];

  const recentSection =
    recentItems.length > 0
      ? [
          { type: 'divider' as const },
          {
            type: 'group' as const,
            key: 'recent-group',
            label: t.nav.recent,
            children: recentItems
              .filter((k) => leafIndex.has(k) && !pinnedItems.includes(k))
              .map((k) => ({
                key: `recent::${k}`, // disambiguate from main menu keys
                icon: <Clock size={14} strokeWidth={1.5} />,
                label: leafIndex.get(k),
              })),
          },
        ]
      : [];

  const menuItems = [
    ...pinnedSection,
    {
      key: '/dashboard',
      label: leafLabel('/dashboard', t.nav.dashboard),
      icon: <LayoutDashboard size={16} strokeWidth={1.5} />,
    },
    { type: 'divider' as const },
    ...(canFields ? [{
      key: 'production-group',
      label: t.nav.production,
      icon: <Sprout size={16} strokeWidth={1.5} />,
      children: productionChildren.map((c) => ({ ...c, label: leafLabel(c.key, c.label) })),
    }] : []),
    ...(canWarehouses ? [{
      key: 'storage-group',
      label: t.nav.storageLogistics,
      icon: <Warehouse size={16} strokeWidth={1.5} />,
      children: storageChildren.map((c) => ({ ...c, label: leafLabel(c.key, c.label) })),
    }] : []),
    ...(canMachinery ? [{
      key: 'machinery-group',
      label: t.nav.machineryGroup,
      icon: <Tractor size={16} strokeWidth={1.5} />,
      children: machineryChildren.map((c) => ({ ...c, label: leafLabel(c.key, c.label) })),
    }] : []),
    { type: 'divider' as const },
    ...(canHR ? [{
      key: 'hr-group',
      label: t.nav.hr,
      icon: <Users size={16} strokeWidth={1.5} />,
      children: hrChildren.map((c) => ({ ...c, label: leafLabel(c.key, c.label) })),
    }] : []),
    { type: 'divider' as const },
    ...(canEconomics && financeChildren.length > 0 ? [{
      key: 'finance-group',
      label: t.nav.finance,
      icon: <Banknote size={16} strokeWidth={1.5} />,
      children: financeChildren.map((c) => ({ ...c, label: leafLabel(c.key, c.label) })),
    }] : []),
    ...(canAnalytics && analyticsChildren.length > 0 ? [{
      key: 'analytics-group',
      label: t.nav.analytics,
      icon: <BarChart3 size={16} strokeWidth={1.5} />,
      children: analyticsChildren.map((c) => ({ ...c, label: leafLabel(c.key, c.label) })),
    }] : []),
    ...(canAdmin
      ? [
          { type: 'divider' as const },
          {
            key: 'settings-group',
            label: t.nav.settings,
            icon: <Settings size={16} strokeWidth={1.5} />,
            children: settingsChildren.map((c) => ({ ...c, label: leafLabel(c.key, c.label) })),
          },
        ]
      : []),
    ...recentSection,
  ];

  /* ── Selected key (canonical, ignoring the recent:: prefix) ── */
  const selectedKey =
    Array.from(leafIndex.keys())
      .slice()
      .reverse()
      .find((k) =>
        location.pathname === k || (k !== '/' && location.pathname.startsWith(k)),
      ) ?? '/dashboard';

  return (
    <div className={s.flex_col}>
      <Menu
        theme="dark"
        mode="inline"
        inlineCollapsed={collapsed}
        selectedKeys={[selectedKey]}
        openKeys={openKeys}
        onOpenChange={(keys) => setOpenKeys(keys as string[])}
        items={menuItems}
        onClick={({ key }) => {
          if (GROUP_KEYS.has(key)) return;
          // Recent-section keys are namespaced; strip the prefix before nav.
          const target = key.startsWith('recent::') ? key.slice('recent::'.length) : key;
          navigate(target);
        }}
        className={s.bg}
      />
    </div>
  );
}
