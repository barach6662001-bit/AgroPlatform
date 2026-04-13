import { useEffect } from 'react';
import { Card, message, Typography, Tag, Button } from 'antd';
import TableSkeleton from '../components/TableSkeleton';
import { Clipboard, Fuel, Wheat, Receipt } from 'lucide-react';
import {
  PlusOutlined,
} from '@ant-design/icons';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate, Navigate } from 'react-router-dom';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import PageHeader from '../components/PageHeader';
import WeatherWidget from '../components/WeatherWidget';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import OperationsTimeline from '../components/dashboard/OperationsTimeline';
import KpiCard from '../components/ui/KpiCard';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../stores/authStore';
import { formatUA } from '../utils/numberFormat';
import {
  useDashboardQuery,
  useDashboardFieldsQuery,
  useDashboardOperationsQuery,
} from '../hooks/useDashboardQuery';
import s from './Dashboard.module.css';
import DataTable from '../components/ui/DataTable';

dayjs.extend(relativeTime);

const { Text } = Typography;

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  const { data, isLoading: dashLoading, isError: dashError } = useDashboardQuery();
  const { data: fieldsData, isLoading: fieldsLoading } = useDashboardFieldsQuery();
  const { data: operationsData, isLoading: opsLoading } = useDashboardOperationsQuery();

  const loading = dashLoading || fieldsLoading || opsLoading;
  const fields: FieldDto[] = fieldsData?.items ?? [];
  const operations: AgroOperationDto[] = operationsData?.items ?? [];

  useEffect(() => {
    if (dashError) {
      message.error(t.dashboard.loadError);
    }
  }, [dashError, t.dashboard.loadError]);

  if (role === 'SuperAdmin') {
    return <Navigate to="/superadmin/companies" replace />;
  }

  if (!hasCompletedOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  if (loading) return <TableSkeleton rows={8} />;
  if (!data) return null;

  const isWarehouseOp = role === 'WarehouseOperator';
  const isAccountant = role === 'Accountant';

  // Use totalCosts/totalRevenue (season-wide) instead of monthly (which shows 0 for demo data)
  const expenses = data.totalCosts || data.monthlyExpenses;
  const revenue = data.totalRevenue || data.monthlyRevenue;
  const profit = revenue - expenses;

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

  const fieldColumns = [
    {
      title: t.fields.name,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => <Text className={s.fieldName}>{v}</Text>,
    },
    {
      title: t.fields.currentCrop,
      dataIndex: 'currentCrop',
      key: 'currentCrop',
      render: (crop: string | undefined) =>
        crop
          ? <Tag color="green" className={s.cropTag}>{t.crops[crop as keyof typeof t.crops] || crop}</Tag>
          : <Tag className={s.emptyTag}>{t.fields.notSeeded}</Tag>,
    },
    {
      title: t.fields.area,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      render: (v: number) => <Text className={s.areaValue}>{v.toFixed(1)} га</Text>,
    },
  ];

  const quickActions = isWarehouseOp
    ? [
        { label: t.dashboard.quickOperation, icon: <Clipboard size={18} />, color: '#3B82F6', route: '/operations' },
        { label: t.dashboard.quickFuel, icon: <Fuel size={18} />, color: '#F59E0B', route: '/fuel' },
        { label: t.dashboard.quickGrain ?? t.nav.grainModule, icon: <Wheat size={18} />, color: '#22C55E', route: '/storage' },
        { label: t.dashboard.quickCost, icon: <Receipt size={18} />, color: '#8B5CF6', route: '/economics' },
      ]
    : isAccountant
    ? [
        { label: t.dashboard.quickCost, icon: <Receipt size={18} />, color: '#8B5CF6', route: '/economics' },
        { label: t.nav.pnl, icon: <Receipt size={18} />, color: '#3B82F6', route: '/economics/pnl' },
        { label: t.dashboard.quickOperation, icon: <Clipboard size={18} />, color: '#3B82F6', route: '/operations' },
        { label: t.dashboard.quickGrain ?? t.nav.grainModule, icon: <Wheat size={18} />, color: '#22C55E', route: '/storage' },
      ]
    : [
        { label: t.dashboard.quickOperation, icon: <Clipboard size={18} />, color: '#3B82F6', route: '/operations' },
        { label: t.dashboard.quickFuel, icon: <Fuel size={18} />, color: '#F59E0B', route: '/fuel' },
        { label: t.dashboard.quickGrain ?? t.nav.grainModule, icon: <Wheat size={18} />, color: '#22C55E', route: '/storage' },
        { label: t.dashboard.quickCost, icon: <Receipt size={18} />, color: '#8B5CF6', route: '/economics' },
      ];

  return (
    <div className="page-enter">
      {/* Row 1 — Header + Weather */}
      <div className={s.flex_between_wrap}>
        <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
        <WeatherWidget />
      </div>

      {/* Row 2 — KPI Cards */}
      <div className={s.kpiGrid}>
        <KpiCard label={t.dashboard.totalArea} value={`${formatUA(data.totalAreaHectares)} га`} />
        <KpiCard label={t.dashboard.seasonExpenses ?? t.dashboard.monthlyExpenses} value={`${formatUA(expenses)} ₴`} />
        <KpiCard label={t.dashboard.seasonRevenue ?? t.dashboard.monthlyRevenue} value={`${formatUA(revenue)} ₴`} />
        <KpiCard
          label={t.dashboard.seasonProfit ?? t.dashboard.monthlyProfit}
          value={`${formatUA(profit)} ₴`}
          hero
          delta={revenue > 0 ? `${((profit / revenue) * 100).toFixed(1)}%` : undefined}
          deltaLabel={t.dashboard.margin ?? 'маржа'}
        />
      </div>

      {/* Row 3 — Alerts */}
      {(data.underRepairMachines > 0 || data.pendingOperations > 0) && (
        <div className={s.alertsGap}>
          <AlertsPanel
            underRepairMachines={data.underRepairMachines}
            pendingOperations={data.pendingOperations}
          />
        </div>
      )}

      {/* Row 4 — Cost Trend Chart */}
      {costTrendData.length > 0 && (
        <Card
          title={<Text strong className={s.cardTitle}>{t.dashboard.costTrend}</Text>}
          className={s.chartCard}
        >
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={costTrendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
              <defs>
                <linearGradient id="costGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} stroke="var(--border)" />
              <YAxis stroke="var(--border)" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} width={60} tickFormatter={(v: number) => formatUA(v)} />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 13,
                }}
              />
              <Area type="monotone" dataKey="cost" stroke="#EF4444" fill="url(#costGrad)" name={t.dashboard.costsUAH} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Row 5 — Fields + Operations (60/40 split) */}
      <div className={s.contentGrid}>
        <Card
          title={<Text strong className={s.cardTitle}>{t.dashboard.fieldsStatus}</Text>}
          styles={{ body: { padding: 0 } }}
        >
          {fields.length === 0 ? (
            <div className={s.onboardingCard}>
              <div className={s.onboardingIcon}>🌾</div>
              <h3 className={s.onboardingTitle}>{t.dashboard.getStarted}</h3>
              <p className={s.onboardingDesc}>{t.dashboard.addFirstField}</p>
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate('/fields')}>
                {t.fields.addField}
              </Button>
            </div>
          ) : (
            <DataTable
              dataSource={fields.slice(0, 7)}
              columns={fieldColumns}
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: <Text className={s.emptyText}>{t.dashboard.noFieldsData}</Text> }}
              scroll={{ x: true }}
            />
          )}
        </Card>

        <Card
          title={<Text strong className={s.cardTitle}>{t.dashboard.recentOperations}</Text>}
        >
          <OperationsTimeline operations={operations.slice(0, 7)} />
        </Card>
      </div>

      {/* Row 6 — Quick Actions */}
      <div className={s.quickActions}>
        {quickActions.map((qa, i) => (
          <div key={i} className={s.quickAction} onClick={() => navigate(qa.route)}>
            <span style={{ color: qa.color }}>{qa.icon}</span>
            {qa.label}
          </div>
        ))}
      </div>
    </div>
  );
}
