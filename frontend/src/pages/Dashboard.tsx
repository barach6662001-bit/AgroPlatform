import { useEffect } from 'react';
import { Row, Col, Card, message, Typography, Table, Tag, List, Button, Space } from 'antd';
import TableSkeleton from '../components/TableSkeleton';
import {
  ToolOutlined,
  DollarOutlined,
  BankOutlined,
  FireOutlined,
  WarningOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
  AimOutlined,
  LineChartOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { useNavigate, Navigate } from 'react-router-dom';
import type { NotificationDto } from '../api/notifications';
import type { FieldDto } from '../types/field';
import type { AgroOperationDto } from '../types/operation';
import PageHeader from '../components/PageHeader';
import WeatherWidget from '../components/WeatherWidget';
import AlertsPanel from '../components/dashboard/AlertsPanel';
import OperationsTimeline from '../components/dashboard/OperationsTimeline';
import { useTranslation } from '../i18n';
import { useAuthStore } from '../stores/authStore';
import { formatUA } from '../utils/numberFormat';
import {
  useDashboardQuery,
  useDashboardNotificationsQuery,
  useDashboardFieldsQuery,
  useDashboardOperationsQuery,
} from '../hooks/useDashboardQuery';
import s from './Dashboard.module.css';

dayjs.extend(relativeTime);

const { Text } = Typography;

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const role = useAuthStore((s) => s.role);
  const hasCompletedOnboarding = useAuthStore((s) => s.hasCompletedOnboarding);

  const { data, isLoading: dashLoading, isError: dashError } = useDashboardQuery();
  const { data: notificationsData, isLoading: notifsLoading } = useDashboardNotificationsQuery();
  const { data: fieldsData, isLoading: fieldsLoading } = useDashboardFieldsQuery();
  const { data: operationsData, isLoading: opsLoading } = useDashboardOperationsQuery();

  const loading = dashLoading || notifsLoading || fieldsLoading || opsLoading;
  const notifications: NotificationDto[] = notificationsData ?? [];
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

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

  const monthlyExpenses = data.monthlyExpenses;
  const monthlyRevenue = data.monthlyRevenue;
  const monthlyProfit = data.monthlyProfit;

  const notifIcon = (type: string) => {
    if (type === 'warning') return <WarningOutlined className={s.notifIcon} style={{ color: 'var(--warning)' }} />;
    if (type === 'error') return <CloseCircleOutlined className={s.notifIcon} style={{ color: 'var(--error)' }} />;
    return <InfoCircleOutlined className={s.notifIcon} style={{ color: 'var(--info)' }} />;
  };

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
      render: (v: number) => <Text className={s.areaValue}>{v.toFixed(1)} ha</Text>,
    },
  ];

  // 4 KPI cards with icons
  const kpiCards = isAccountant
    ? [
        { label: t.dashboard.monthlyRevenue, val: monthlyRevenue, unit: '₴', icon: <BankOutlined /> },
        { label: t.dashboard.monthlyProfit, val: monthlyProfit, unit: '₴', colored: true, icon: <LineChartOutlined /> },
        { label: t.dashboard.monthlyExpenses, val: monthlyExpenses, unit: '₴', icon: <DollarOutlined /> },
        { label: t.dashboard.totalArea, val: data.totalAreaHectares, unit: 'га', icon: <AimOutlined /> },
      ]
    : [
        { label: t.dashboard.totalArea, val: data.totalAreaHectares, unit: 'га', icon: <AimOutlined /> },
        { label: t.dashboard.monthlyExpenses, val: monthlyExpenses, unit: '₴', icon: <DollarOutlined /> },
        { label: t.dashboard.monthlyRevenue, val: monthlyRevenue, unit: '₴', icon: <BankOutlined /> },
        { label: t.dashboard.monthlyProfit, val: monthlyProfit, unit: '₴', colored: true, icon: <LineChartOutlined /> },
      ];

  return (
    <div className="page-enter">
      {/* Header + Weather */}
      <div className={s.flex_between_wrap}>
        <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />
        <WeatherWidget />
      </div>

      {/* 4 KPI Cards */}
      <div className={s.kpiGrid}>
        {kpiCards.map((kpi, i) => (
          <div key={i} className={s.kpiCard}>
            <div className={s.kpiHeader}>
              <div className={s.kpiLabel}>{kpi.label}</div>
              <div className={s.kpiIcon}>{kpi.icon}</div>
            </div>
            <div className={s.kpiValue} style={{
              color: kpi.colored ? (kpi.val >= 0 ? 'var(--success)' : 'var(--error)') : undefined,
            }}>
              {typeof kpi.val === 'number' ? formatUA(kpi.val) : kpi.val}
              {kpi.unit && <span className={s.kpiUnit}>{kpi.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Alerts */}
      {(data.underRepairMachines > 0 || data.pendingOperations > 0) && (
        <div className={s.alertsGap}>
          <AlertsPanel
            underRepairMachines={data.underRepairMachines}
            pendingOperations={data.pendingOperations}
          />
        </div>
      )}

      {/* Quick Actions */}
      <div className={s.quickActions}>
        {isWarehouseOp ? (
          <>
            <div className={s.quickAction} onClick={() => navigate('/warehouses')}><BankOutlined className={s.quickActionIcon} />{t.nav.warehouses}</div>
            <div className={s.quickAction} onClick={() => navigate('/warehouses/movements')}><ToolOutlined className={s.quickActionIcon} />{t.nav.movements}</div>
            <div className={s.quickAction} onClick={() => navigate('/fuel')}><FireOutlined className={s.quickActionIcon} />{t.dashboard.quickFuel}</div>
            <div className={s.quickAction} onClick={() => navigate('/economics')}><DollarOutlined className={s.quickActionIcon} />{t.dashboard.quickCost}</div>
          </>
        ) : isAccountant ? (
          <>
            <div className={s.quickAction} onClick={() => navigate('/economics')}><DollarOutlined className={s.quickActionIcon} />{t.dashboard.quickCost}</div>
            <div className={s.quickAction} onClick={() => navigate('/economics/pnl')}><DollarOutlined className={s.quickActionIcon} />{t.nav.pnl}</div>
            <div className={s.quickAction} onClick={() => navigate('/operations')}><ToolOutlined className={s.quickActionIcon} />{t.dashboard.quickOperation}</div>
            <div className={s.quickAction} onClick={() => navigate('/grain')}><BankOutlined className={s.quickActionIcon} />{t.dashboard.quickGrain}</div>
          </>
        ) : (
          <>
            <div className={s.quickAction} onClick={() => navigate('/operations')}><ToolOutlined className={s.quickActionIcon} />{t.dashboard.quickOperation}</div>
            <div className={s.quickAction} onClick={() => navigate('/fuel')}><FireOutlined className={s.quickActionIcon} />{t.dashboard.quickFuel}</div>
            <div className={s.quickAction} onClick={() => navigate('/grain')}><BankOutlined className={s.quickActionIcon} />{t.dashboard.quickGrain}</div>
            <div className={s.quickAction} onClick={() => navigate('/economics')}><DollarOutlined className={s.quickActionIcon} />{t.dashboard.quickCost}</div>
          </>
        )}
      </div>

      {/* Main content: Fields + Operations + Activity */}
      <Row gutter={[16, 16]}>
        {/* Left: Fields status */}
        <Col xs={24} xl={14}>
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
              <Table
                dataSource={fields}
                columns={fieldColumns}
                rowKey="id"
                size="small"
                pagination={false}
                locale={{ emptyText: <Text className={s.emptyText}>{t.dashboard.noFieldsData}</Text> }}
                scroll={{ x: true }}
              />
            )}
          </Card>
        </Col>

        {/* Right: Operations Timeline + Activity Feed */}
        <Col xs={24} xl={10}>
          <Card
            title={<Text strong className={s.cardTitle}>{t.dashboard.recentOperations}</Text>}
            className={s.cardGap}
          >
            <OperationsTimeline operations={operations.slice(0, 6)} />
          </Card>

          <Card
            title={<Text strong className={s.cardTitle}>{t.dashboard.activityFeed}</Text>}
          >
            {notifications.length === 0 ? (
              <Text className={s.emptyText}>{t.dashboard.noActivity}</Text>
            ) : (
              <List
                dataSource={notifications.slice(0, 6)}
                split={false}
                renderItem={(n) => (
                  <List.Item className={s.activityItem}>
                    <Space>
                      {notifIcon(n.type)}
                      <Text type="secondary" className={s.activityTime}>{dayjs(n.createdAtUtc).format('HH:mm')}</Text>
                      <Text className={s.activityTitle}>{n.title}</Text>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* Cost Trend Chart */}
      {costTrendData.length > 0 && (
        <Card title={t.dashboard.costTrend} className={s.chartCard}>
          <ResponsiveContainer width="100%" height={260}>
                <LineChart data={costTrendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-tertiary)' }} stroke="var(--border)" />
                  <YAxis stroke="var(--border)" tick={{ fill: 'var(--text-tertiary)', fontSize: 11 }} width={48} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="var(--error)" name={t.dashboard.costsUAH} strokeWidth={2} />
                </LineChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}
