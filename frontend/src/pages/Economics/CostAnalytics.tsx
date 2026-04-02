import { useEffect, useState } from 'react';
import { Card, Col, Row, Select, Statistic, Table, Empty, message } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DollarOutlined } from '@ant-design/icons';
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
  ResponsiveContainer,
} from 'recharts';
import { getCostAnalytics } from '../../api/economics';
import type { CostAnalyticsDto, EconomicsByCategoryDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './CostAnalytics.module.css';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const MONTH_SHORT: Record<number, string> = {
  1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun',
  7: 'Jul', 8: 'Aug', 9: 'Sep', 10: 'Oct', 11: 'Nov', 12: 'Dec',
};

const PIE_COLORS = [
  '#4096ff', 'var(--success)', 'var(--warning)', 'var(--error)', '#722ed1',
  '#13c2c2', '#eb2f96', '#fa8c16', '#a0d911', 'var(--info)',
];

const fmt = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 0 });

export default function CostAnalytics() {
  const { t } = useTranslation();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<CostAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCostAnalytics({ year })
      .then(setData)
      .catch(() => message.error(t.economics.loadError))
      .finally(() => setLoading(false));
  }, [year]);

  const pieData = (data?.byCategory ?? [])
    .filter((c) => c.amount > 0)
    .map((c) => ({ name: c.category, value: c.amount }));

  const barData = (data?.byMonth ?? []).map((m) => ({
    name: MONTH_SHORT[m.month],
    [t.economics.totalCostsSum]: m.costs,
    [t.economics.revenue]: m.revenue,
  }));

  const tableColumns = [
    { title: t.economics.category, dataIndex: 'category', key: 'category' },
    {
      title: t.economics.amount,
      dataIndex: 'amount',
      key: 'amount',
      render: (v: number) => `${fmt(Math.abs(v))} UAH`,
      sorter: (a: EconomicsByCategoryDto, b: EconomicsByCategoryDto) => Math.abs(b.amount) - Math.abs(a.amount),
    },
    { title: t.economics.count, dataIndex: 'count', key: 'count' },
  ];

  const hasData = data && (data.totalCosts > 0 || data.totalRevenue > 0);

  return (
    <div>
      <PageHeader
        title={t.economics.analyticsTitle}
        subtitle={t.economics.analyticsSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.finance, path: '/economics' }, { label: t.nav.costAnalytics }]} />}
      />

      <Row gutter={[16, 16]} align="middle" className={s.spaced}>
        <Col>
          <Select
            value={year}
            options={YEAR_OPTIONS}
            onChange={setYear}
            className={s.block1}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} className={s.spaced1}>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title={t.economics.totalCostsSum}
              value={data?.totalCosts ?? 0}
              suffix="UAH"
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: 'var(--error)' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title={t.economics.revenue}
              value={data?.totalRevenue ?? 0}
              suffix="UAH"
              prefix={<ArrowUpOutlined />}
              valueStyle={{ color: 'var(--success)' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8}>
          <Card>
            <Statistic
              title={t.economics.netProfit}
              value={(data?.totalRevenue ?? 0) - (data?.totalCosts ?? 0)}
              suffix="UAH"
              prefix={<DollarOutlined />}
              valueStyle={{ color: ((data?.totalRevenue ?? 0) - (data?.totalCosts ?? 0)) >= 0 ? 'var(--success)' : 'var(--error)' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
      </Row>

      {!loading && !hasData ? (
        <Empty description={t.economics.analyticsEmpty} className={s.spaced2} />
      ) : (
        <>
          <Row gutter={[16, 16]} className={s.spaced1}>
            <Col xs={24} md={10}>
              <Card title={t.economics.analyticsByCategory}>
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {pieData.map((_, idx) => (
                          <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v: number) => `${fmt(v)} UAH`} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty />
                )}
              </Card>
            </Col>
            <Col xs={24} md={14}>
              <Card title={t.economics.analyticsByMonth}>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={barData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v: number) => `${fmt(v)} UAH`} />
                    <Legend />
                    <Bar dataKey={t.economics.totalCostsSum} fill="#ff7875" />
                    <Bar dataKey={t.economics.revenue} fill="#73d13d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {(data?.byCategory ?? []).length > 0 && (
            <Card title={t.economics.analyticsByCategory}>
              <Table<EconomicsByCategoryDto>
                dataSource={data?.byCategory}
                columns={tableColumns}
                rowKey="category"
                loading={loading}
                pagination={false}
                size="small"
              />
            </Card>
          )}
        </>
      )}
    </div>
  );
}
