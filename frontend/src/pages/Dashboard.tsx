import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography, Table, Tag, List, Badge } from 'antd';
import {
  AimOutlined,
  CarOutlined,
  ToolOutlined,
  DollarOutlined,
  InboxOutlined,
  ThunderboltOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
} from 'recharts';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { getDashboard } from '../api/analytics';
import { getFields } from '../api/fields';
import { getMachines } from '../api/machinery';
import { getNotifications, type NotificationDto } from '../api/notifications';
import type { DashboardDto } from '../types/analytics';
import type { FieldDto } from '../types/field';
import type { MachineDto } from '../types/machinery';
import PageHeader from '../components/PageHeader';
import { useTranslation } from '../i18n';
import { CHART_COLORS } from '../theme/darkTheme';

dayjs.extend(relativeTime);

const CARD = { background: '#111827', border: '1px solid #1f2d42', borderRadius: 12 };
const SECTION_GAP = { marginTop: 24 };

export default function Dashboard() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    Promise.all([
      getDashboard(),
      getFields({ pageSize: 8 }),
      getMachines({ pageSize: 8 }),
      getNotifications({ pageSize: 6 }),
    ])
      .then(([dash, fieldsRes, machinesRes, notifs]) => {
        setData(dash);
        setFields(fieldsRes.items);
        setMachines(machinesRes.items);
        setNotifications(notifs);
      })
      .catch(() => message.error(t.dashboard.loadError))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return null;

  // ── Chart data ───────────────────────────────────────────────────────────
  const operationsData = Object.entries(data.operationsByType).map(([type, count]) => ({
    name: t.operationTypes[type as keyof typeof t.operationTypes] || type,
    value: count,
  }));

  const areaData = Object.entries(data.areaByCrop).map(([crop, area]) => ({
    name: t.crops[crop as keyof typeof t.crops] || crop,
    area: Number(area.toFixed(1)),
  }));

  const costTrendData = data.costTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    cost: item.totalAmount,
  }));

  // ── Derived KPI ──────────────────────────────────────────────────────────
  const cropEntries = Object.entries(data.areaByCrop).sort(([, a], [, b]) => b - a);
  const topCrop = cropEntries[0];
  const topCropName = topCrop
    ? (t.crops[topCrop[0] as keyof typeof t.crops] || topCrop[0])
    : '—';
  const cropCount = cropEntries.length;

  // ── Field status columns ──────────────────────────────────────────────────
  const fieldColumns = [
    {
      title: t.fields.name,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => <Typography.Text style={{ color: '#E5E7EB' }}>{v}</Typography.Text>,
    },
    {
      title: t.fields.currentCrop,
      dataIndex: 'currentCrop',
      key: 'currentCrop',
      render: (crop: string | undefined) =>
        crop
          ? <Tag color="green" style={{ borderRadius: 4, fontSize: 11 }}>{t.crops[crop as keyof typeof t.crops] || crop}</Tag>
          : <Tag style={{ borderRadius: 4, fontSize: 11, color: '#64748B', border: '1px solid #1f2d42', background: 'transparent' }}>{t.fields.notSeeded}</Tag>,
    },
    {
      title: t.fields.area,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      render: (v: number) => <Typography.Text type="secondary" style={{ fontSize: 12 }}>{v.toFixed(1)} ha</Typography.Text>,
    },
  ];

  // ── Machinery status columns ──────────────────────────────────────────────
  const statusColor: Record<string, string> = {
    Active: 'green',
    UnderRepair: 'orange',
    Decommissioned: 'red',
  };

  const machineryColumns = [
    {
      title: t.machinery.name,
      dataIndex: 'name',
      key: 'name',
      ellipsis: true,
      render: (v: string) => <Typography.Text style={{ color: '#E5E7EB' }}>{v}</Typography.Text>,
    },
    {
      title: t.machinery.type,
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => <Typography.Text type="secondary" style={{ fontSize: 12 }}>{t.machineryTypes[v as keyof typeof t.machineryTypes] || v}</Typography.Text>,
    },
    {
      title: t.machinery.status,
      dataIndex: 'status',
      key: 'status',
      render: (s: string) => (
        <Tag color={statusColor[s] || 'default'} style={{ borderRadius: 4, fontSize: 11 }}>
          {t.machineryStatuses[s as keyof typeof t.machineryStatuses] || s}
        </Tag>
      ),
    },
  ];

  // ── Notification icon ─────────────────────────────────────────────────────
  const notifIcon = (type: string) => {
    if (type === 'warning') return <ExclamationCircleOutlined style={{ color: '#F59E0B', fontSize: 16 }} />;
    if (type === 'error') return <ExclamationCircleOutlined style={{ color: '#EF4444', fontSize: 16 }} />;
    return <InfoCircleOutlined style={{ color: '#3B82F6', fontSize: 16 }} />;
  };

  const hasChartData = operationsData.length > 0 || areaData.length > 0 || costTrendData.length > 0;

  return (
    <div>
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

      {/* ═══ ZONE 1: PRIMARY KPI CARDS ═══════════════════════════════════════ */}
      <Row gutter={[16, 16]}>
        {/* Total Fields */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Statistic
              title={t.dashboard.fields}
              value={data.totalFields}
              prefix={<AimOutlined style={{ color: '#22C55E' }} />}
              valueStyle={{ color: '#E5E7EB', fontSize: 30, fontWeight: 700 }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {data.totalAreaHectares.toFixed(0)} ha {t.dashboard.areaLabel}
            </Typography.Text>
          </Card>
        </Col>

        {/* Active Machinery */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Statistic
              title={t.dashboard.activeMachinery}
              value={data.activeMachines}
              suffix={<Typography.Text type="secondary" style={{ fontSize: 14 }}>/ {data.totalMachines}</Typography.Text>}
              prefix={<CarOutlined style={{ color: '#3B82F6' }} />}
              valueStyle={{ color: '#E5E7EB', fontSize: 30, fontWeight: 700 }}
            />
            {data.underRepairMachines > 0 && (
              <Typography.Text style={{ fontSize: 12, color: '#F59E0B' }}>
                ⚠ {data.underRepairMachines} {t.dashboard.underRepair}
              </Typography.Text>
            )}
          </Card>
        </Col>

        {/* Warehouse Stock */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Statistic
              title={t.dashboard.warehouses}
              value={data.totalWarehouseItems}
              prefix={<InboxOutlined style={{ color: '#A78BFA' }} />}
              suffix={<Typography.Text type="secondary" style={{ fontSize: 13 }}> {t.dashboard.stockItems}</Typography.Text>}
              valueStyle={{ color: '#E5E7EB', fontSize: 30, fontWeight: 700 }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {data.totalWarehouses} {t.dashboard.warehousesLabel}
            </Typography.Text>
          </Card>
        </Col>

        {/* Current Crop Status */}
        <Col xs={24} sm={12} lg={6}>
          <Card style={CARD}>
            <Statistic
              title={t.dashboard.cropStatus}
              value={topCropName}
              prefix={<ThunderboltOutlined style={{ color: '#22C55E' }} />}
              valueStyle={{ color: '#22C55E', fontSize: 24, fontWeight: 700 }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              {cropCount} {t.dashboard.cropTypes}
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      {/* ═══ SECONDARY METRICS ═══════════════════════════════════════════════ */}
      <Row gutter={[12, 12]} style={{ marginTop: 12 }}>
        <Col xs={12} sm={6}>
          <Card style={{ ...CARD, borderRadius: 8 }}>
            <Statistic
              title={t.dashboard.operations}
              value={data.totalOperations}
              prefix={<ToolOutlined style={{ color: '#94A3B8' }} />}
              valueStyle={{ fontSize: 20, color: '#E5E7EB' }}
              suffix={
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  {' '}/ {data.completedOperations}
                </Typography.Text>
              }
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ ...CARD, borderRadius: 8 }}>
            <Statistic
              title={t.dashboard.costs}
              value={data.totalCosts}
              precision={0}
              prefix={<DollarOutlined style={{ color: '#EF4444' }} />}
              valueStyle={{ fontSize: 20, color: '#EF4444' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ ...CARD, borderRadius: 8 }}>
            <Statistic
              title={t.dashboard.hoursWorked}
              value={data.totalHoursWorked}
              precision={0}
              suffix={<Typography.Text type="secondary" style={{ fontSize: 11 }}> h</Typography.Text>}
              valueStyle={{ fontSize: 20, color: '#E5E7EB' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card style={{ ...CARD, borderRadius: 8 }}>
            <Statistic
              title={t.dashboard.fuelConsumed}
              value={data.totalFuelConsumed}
              precision={0}
              suffix={<Typography.Text type="secondary" style={{ fontSize: 11 }}> l</Typography.Text>}
              valueStyle={{ fontSize: 20, color: '#E5E7EB' }}
            />
          </Card>
        </Col>
      </Row>

      {/* ═══ ZONE 2: CHARTS ══════════════════════════════════════════════════ */}
      <Row gutter={[16, 16]} style={SECTION_GAP}>
        {areaData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.areaByCrop} style={CARD}>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={areaData} margin={{ top: 4, right: 8, left: 0, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2d42" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#1f2d42" />
                  <YAxis stroke="#1f2d42" tick={{ fill: '#94A3B8', fontSize: 11 }} width={36} />
                  <Tooltip />
                  <Bar dataKey="area" fill="#22C55E" name={t.dashboard.areaHa} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {operationsData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.operationsByType} style={CARD}>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={operationsData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="45%"
                    outerRadius={75}
                  >
                    {operationsData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {costTrendData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.costTrend} style={CARD}>
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={costTrendData} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2d42" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94A3B8' }} stroke="#1f2d42" />
                  <YAxis stroke="#1f2d42" tick={{ fill: '#94A3B8', fontSize: 11 }} width={48} />
                  <Tooltip />
                  <Line type="monotone" dataKey="cost" stroke="#EF4444" name={t.dashboard.costsUAH} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {!hasChartData && (
          <Col span={24}>
            <Card style={CARD}>
              <Typography.Text type="secondary">{t.dashboard.noChartData}</Typography.Text>
            </Card>
          </Col>
        )}
      </Row>

      {/* ═══ ZONE 3: OPERATIONS STATUS  +  ZONE 4: ACTIVITY FEED ════════════ */}
      <Row gutter={[16, 16]} style={SECTION_GAP}>
        {/* Left: status tables */}
        <Col xs={24} xl={14}>
          <Row gutter={[16, 16]}>
            {/* Fields Status */}
            <Col span={24}>
              <Card
                title={
                  <Typography.Text strong style={{ color: '#E5E7EB' }}>
                    {t.dashboard.fieldsStatus}
                  </Typography.Text>
                }
                style={CARD}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  dataSource={fields}
                  columns={fieldColumns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  locale={{ emptyText: <Typography.Text type="secondary">{t.dashboard.noFieldsData}</Typography.Text> }}
                  scroll={{ x: true }}
                />
              </Card>
            </Col>

            {/* Machinery Status */}
            <Col span={24}>
              <Card
                title={
                  <Typography.Text strong style={{ color: '#E5E7EB' }}>
                    {t.dashboard.machineryStatus}
                  </Typography.Text>
                }
                style={CARD}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  dataSource={machines}
                  columns={machineryColumns}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  locale={{ emptyText: <Typography.Text type="secondary">{t.dashboard.noMachineryData}</Typography.Text> }}
                  scroll={{ x: true }}
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Right: warehouse overview + activity feed */}
        <Col xs={24} xl={10}>
          <Row gutter={[16, 16]}>
            {/* Warehouse Overview */}
            <Col span={24}>
              <Card
                title={
                  <Typography.Text strong style={{ color: '#E5E7EB' }}>
                    {t.dashboard.warehouseOverview}
                  </Typography.Text>
                }
                style={CARD}
                styles={{ body: { padding: 0 } }}
              >
                <Table
                  dataSource={data.topStockItems.slice(0, 6)}
                  rowKey="itemId"
                  size="small"
                  pagination={false}
                  locale={{ emptyText: <Typography.Text type="secondary">—</Typography.Text> }}
                  columns={[
                    {
                      title: t.warehouses.item,
                      dataIndex: 'itemName',
                      key: 'itemName',
                      ellipsis: true,
                      render: (v: string) => <Typography.Text style={{ color: '#E5E7EB', fontSize: 13 }}>{v}</Typography.Text>,
                    },
                    {
                      title: t.warehouses.balance,
                      key: 'balance',
                      render: (_: unknown, r: { totalBalance: number; baseUnit: string }) => (
                        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                          {r.totalBalance.toFixed(1)} {r.baseUnit}
                        </Typography.Text>
                      ),
                    },
                  ]}
                />
              </Card>
            </Col>

            {/* Activity Feed */}
            <Col span={24}>
              <Card
                title={
                  <Typography.Text strong style={{ color: '#E5E7EB' }}>
                    {t.dashboard.activityFeed}
                  </Typography.Text>
                }
                style={CARD}
              >
                {notifications.length === 0 ? (
                  <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                    {t.dashboard.noActivity}
                  </Typography.Text>
                ) : (
                  <List
                    dataSource={notifications.slice(0, 6)}
                    split={false}
                    renderItem={(item) => (
                      <List.Item
                        style={{ padding: '8px 0', borderBottom: '1px solid #1f2d42', alignItems: 'flex-start' }}
                        extra={!item.isRead ? <Badge dot color="#22C55E" style={{ marginTop: 6 }} /> : null}
                      >
                        <List.Item.Meta
                          avatar={notifIcon(item.type)}
                          title={
                            <Typography.Text style={{ fontSize: 13, color: item.isRead ? '#94A3B8' : '#E5E7EB' }}>
                              {item.title}
                            </Typography.Text>
                          }
                          description={
                            <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                              <ClockCircleOutlined style={{ marginRight: 4 }} />
                              {dayjs(item.createdAtUtc).fromNow()}
                            </Typography.Text>
                          }
                        />
                      </List.Item>
                    )}
                  />
                )}
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>
    </div>
  );
}
