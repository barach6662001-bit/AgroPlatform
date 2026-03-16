import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Spin, message, Typography } from 'antd';
import {
  AimOutlined,
  CarOutlined,
  ToolOutlined,
  DollarOutlined,
  InboxOutlined,
  ClockCircleOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getDashboard } from '../api/analytics';
import type { DashboardDto } from '../types/analytics';
import PageHeader from '../components/PageHeader';
import { useTranslation } from '../i18n';
import { CHART_COLORS } from '../theme/darkTheme';


export default function Dashboard() {
  const [data, setData] = useState<DashboardDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    getDashboard()
      .then(setData)
      .catch(() => message.error(t.dashboard.loadError))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!data) return null;

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

  return (
    <div>
      <PageHeader title={t.dashboard.title} subtitle={t.dashboard.subtitle} />

      {/* KPI Row 1 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" bordered={false}>
            <Statistic
              title={t.dashboard.fields}
              value={data.totalFields}
              prefix={<AimOutlined />}
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" bordered={false}>
            <Statistic
              title={t.dashboard.activeMachinery}
              value={data.activeMachines}
              suffix={`/ ${data.totalMachines}`}
              prefix={<CarOutlined />}
              valueStyle={{ color: '#3B82F6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" bordered={false}>
            <Statistic
              title={t.dashboard.warehouses}
              value={data.totalWarehouseItems}
              prefix={<InboxOutlined />}
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="kpi-card" bordered={false}>
            <Statistic
              title={t.dashboard.cropStatus}
              value={Object.keys(data.areaByCrop).length}
              suffix="crops"
              prefix={<ToolOutlined />}
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
      </Row>

      {/* KPI Row 2 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} sm={8}>
          <Card className="kpi-card" bordered={false}>
            <Statistic
              title={t.dashboard.area}
              value={data.totalAreaHectares}
              precision={1}
              suffix="ha"
              valueStyle={{ color: '#22C55E' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="kpi-card" bordered={false}>
            <Statistic
              title={t.dashboard.hoursWorked}
              value={data.totalHoursWorked}
              precision={1}
              suffix="h"
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="kpi-card" bordered={false}>
            <Statistic
              title={t.dashboard.costs}
              value={data.totalCosts}
              precision={0}
              suffix="UAH"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#EF4444' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Alerts section */}
      {(data.underRepairMachines > 0 || data.pendingOperations > 0) && (
        <Row gutter={[16, 16]} style={{ marginTop: 20 }}>
          {data.underRepairMachines > 0 && (
            <Col xs={24} sm={12}>
              <div className="alert-card error">
                <Typography.Text style={{ color: '#EF4444', fontWeight: 600, fontSize: 13 }}>
                  <WarningOutlined style={{ marginRight: 8 }} />
                  {data.underRepairMachines} {t.dashboard.machinesUnderRepair}
                </Typography.Text>
              </div>
            </Col>
          )}
          {data.pendingOperations > 0 && (
            <Col xs={24} sm={12}>
              <div className="alert-card">
                <Typography.Text style={{ color: '#F59E0B', fontWeight: 600, fontSize: 13 }}>
                  <ClockCircleOutlined style={{ marginRight: 8 }} />
                  {data.pendingOperations} {t.dashboard.pendingOpsAlert}
                </Typography.Text>
              </div>
            </Col>
          )}
        </Row>
      )}

      {/* Charts */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        {areaData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.areaByCrop}>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={areaData} margin={{ top: 5, right: 10, left: 0, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} tick={{ fontSize: 11, fill: '#8B949E' }} stroke="#8B949E" />
                  <YAxis stroke="#8B949E" tick={{ fill: '#8B949E' }} />
                  <Tooltip />
                  <Bar dataKey="area" fill="#22C55E" name={t.dashboard.areaHa} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {costTrendData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.costTrend}>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={costTrendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#8B949E' }} stroke="#8B949E" />
                  <YAxis stroke="#8B949E" tick={{ fill: '#8B949E' }} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="cost" stroke="#EF4444" name={t.dashboard.costsUAH} strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {operationsData.length > 0 && (
          <Col xs={24} lg={8}>
            <Card title={t.dashboard.operationsByType}>
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie data={operationsData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {operationsData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        )}

        {operationsData.length === 0 && areaData.length === 0 && costTrendData.length === 0 && (
          <Col span={24}>
            <Card>
              <Typography.Text type="secondary">{t.dashboard.noChartData}</Typography.Text>
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
}
