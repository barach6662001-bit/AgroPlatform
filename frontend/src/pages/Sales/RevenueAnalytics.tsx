import { useEffect, useState } from 'react';
import { Card, Col, Row, Select, Statistic, Table, Empty, message, Tag } from 'antd';
import { DollarOutlined, ShoppingOutlined, UserOutlined, TrophyOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { getSalesAnalytics } from '../../api/sales';
import type { SalesAnalyticsDto, ProductRevenueDto, BuyerRevenueDto, MonthlyRevenueDto } from '../../types/sales';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_UK = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

const PIE_COLORS = ['#58A6FF', '#3fb950', '#f0883e', '#a371f7', '#f85149', '#ffa657', '#56d364', '#79c0ff'];

const fmt = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 0 });

export default function RevenueAnalytics() {
  const { t, lang } = useTranslation();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<SalesAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  const monthNames = lang === 'uk' ? MONTH_NAMES_UK : MONTH_NAMES;

  useEffect(() => {
    setLoading(true);
    getSalesAnalytics({ year })
      .then(setData)
      .catch(() => message.error(t.sales.loadError))
      .finally(() => setLoading(false));
  }, [year]);

  const topBuyer = data?.byBuyer[0];
  const topProduct = data?.byProduct[0];

  const pieData = (data?.byProduct ?? []).map((p) => ({
    name: p.product,
    value: p.totalAmount,
  }));

  const buyerChartData = (data?.byBuyer ?? []).slice(0, 10).map((b) => ({
    name: b.buyerName,
    [t.sales.revenueAmount]: b.totalAmount,
  }));

  const monthlyChartData = (data?.byMonth ?? []).map((m) => ({
    name: `${monthNames[m.month - 1]} ${m.year}`,
    [t.sales.revenueAmount]: m.totalAmount,
  }));

  const productColumns = [
    {
      title: t.sales.product,
      dataIndex: 'product',
      key: 'product',
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: t.sales.totalAmount,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: (a: ProductRevenueDto, b: ProductRevenueDto) => a.totalAmount - b.totalAmount,
      render: (v: number) => <span style={{ color: '#3fb950' }}>{fmt(v)} UAH</span>,
    },
    {
      title: t.sales.quantity,
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 2 }),
    },
  ];

  const buyerColumns = [
    {
      title: t.sales.buyerName,
      dataIndex: 'buyerName',
      key: 'buyerName',
    },
    {
      title: t.sales.totalAmount,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      sorter: (a: BuyerRevenueDto, b: BuyerRevenueDto) => a.totalAmount - b.totalAmount,
      render: (v: number) => <span style={{ color: '#3fb950' }}>{fmt(v)} UAH</span>,
    },
    {
      title: t.sales.salesCount,
      dataIndex: 'salesCount',
      key: 'salesCount',
      sorter: (a: BuyerRevenueDto, b: BuyerRevenueDto) => a.salesCount - b.salesCount,
    },
  ];

  const monthlyColumns = [
    {
      title: t.common.date,
      key: 'period',
      render: (_: unknown, r: MonthlyRevenueDto) => `${monthNames[r.month - 1]} ${r.year}`,
    },
    {
      title: t.sales.totalAmount,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => <span style={{ color: '#3fb950' }}>{fmt(v)} UAH</span>,
    },
    {
      title: t.sales.salesCount,
      dataIndex: 'salesCount',
      key: 'salesCount',
    },
  ];

  const hasData = (data?.totalSalesCount ?? 0) > 0;

  return (
    <div>
      <PageHeader title={t.sales.analyticsTitle} subtitle={t.sales.analyticsSubtitle} />

      {/* Year filter */}
      <div style={{ marginBottom: 24 }}>
        <span style={{ color: '#8B949E', marginRight: 8 }}>{t.economics.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          style={{ width: 100 }}
        />
      </div>

      {/* KPI cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.sales.totalRevenue}</span>}
              value={data?.totalRevenue ?? 0}
              suffix="UAH"
              valueStyle={{ color: '#3fb950' }}
              prefix={<DollarOutlined />}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.sales.salesCount}</span>}
              value={data?.totalSalesCount ?? 0}
              valueStyle={{ color: '#58A6FF' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.sales.topProducts}</span>}
              value={topProduct?.product ?? '—'}
              valueStyle={{ color: '#f0883e', fontSize: 16 }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card style={{ background: '#161B22', border: '1px solid #30363D' }}>
            <Statistic
              title={<span style={{ color: '#8B949E' }}>{t.sales.topBuyers}</span>}
              value={topBuyer?.buyerName ?? '—'}
              valueStyle={{ color: '#a371f7', fontSize: 16 }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {!hasData && !loading ? (
        <Empty description={<span style={{ color: '#8B949E' }}>{t.sales.noAnalyticsData}</span>} />
      ) : (
        <>
          {/* Charts row: pie by product + bar by buyer */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} lg={12}>
              <Card
                title={<span style={{ color: '#E6EDF3' }}>{t.sales.byProduct}</span>}
                style={{ background: '#161B22', border: '1px solid #30363D' }}
                loading={loading}
              >
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {pieData.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }}
                        formatter={(v: number) => [`${fmt(v)} UAH`, t.sales.revenueAmount]}
                      />
                      <Legend wrapperStyle={{ color: '#8B949E', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description={<span style={{ color: '#8B949E' }}>{t.sales.noAnalyticsData}</span>} />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={<span style={{ color: '#E6EDF3' }}>{t.sales.byBuyer}</span>}
                style={{ background: '#161B22', border: '1px solid #30363D' }}
                loading={loading}
              >
                {buyerChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={buyerChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#30363D" horizontal={false} />
                      <XAxis type="number" tick={{ fill: '#8B949E', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: '#8B949E', fontSize: 11 }} width={90} />
                      <Tooltip
                        contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }}
                        formatter={(v: number) => [`${fmt(v)} UAH`]}
                      />
                      <Bar dataKey={t.sales.revenueAmount} fill="#58A6FF" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description={<span style={{ color: '#8B949E' }}>{t.sales.noAnalyticsData}</span>} />
                )}
              </Card>
            </Col>
          </Row>

          {/* Monthly revenue chart */}
          <Card
            title={<span style={{ color: '#E6EDF3' }}>{t.sales.monthlyRevenue}</span>}
            style={{ background: '#161B22', border: '1px solid #30363D', marginBottom: 24 }}
            loading={loading}
          >
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#8B949E', fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }}
                    formatter={(v: number) => [`${fmt(v)} UAH`]}
                  />
                  <Legend wrapperStyle={{ color: '#8B949E' }} />
                  <Bar dataKey={t.sales.revenueAmount} fill="#3fb950" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description={<span style={{ color: '#8B949E' }}>{t.sales.noAnalyticsData}</span>} />
            )}
          </Card>

          {/* Tables */}
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card
                title={<span style={{ color: '#E6EDF3' }}>{t.sales.byProduct}</span>}
                style={{ background: '#161B22', border: '1px solid #30363D', marginBottom: 24 }}
              >
                <Table
                  dataSource={data?.byProduct ?? []}
                  columns={productColumns}
                  rowKey="product"
                  loading={loading}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  size="small"
                />
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={<span style={{ color: '#E6EDF3' }}>{t.sales.byBuyer}</span>}
                style={{ background: '#161B22', border: '1px solid #30363D', marginBottom: 24 }}
              >
                <Table
                  dataSource={data?.byBuyer ?? []}
                  columns={buyerColumns}
                  rowKey="buyerName"
                  loading={loading}
                  pagination={{ pageSize: 5, showSizeChanger: false }}
                  size="small"
                />
              </Card>
            </Col>
          </Row>

          <Card
            title={<span style={{ color: '#E6EDF3' }}>{t.sales.byMonth}</span>}
            style={{ background: '#161B22', border: '1px solid #30363D' }}
          >
            <Table
              dataSource={data?.byMonth ?? []}
              columns={monthlyColumns}
              rowKey={(r: MonthlyRevenueDto) => `${r.year}-${r.month}`}
              loading={loading}
              pagination={{ pageSize: 12, showSizeChanger: false }}
              size="small"
            />
          </Card>
        </>
      )}
    </div>
  );
}
