import { useEffect, useState } from 'react';
import { formatUAH, formatNumber } from '../../utils/format';
import { Card, Col, Row, Select, Statistic, Empty, message, Tag } from 'antd';
import { DollarOutlined, ShoppingOutlined, UserOutlined, TrophyOutlined } from '@ant-design/icons';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { chartConfig, chartColors, chartPalette } from '../../components/charts/chartTheme';
import { getSalesAnalytics } from '../../api/sales';
import type { SalesAnalyticsDto, ProductRevenueDto, BuyerRevenueDto, MonthlyRevenueDto } from '../../types/sales';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './RevenueAnalytics.module.css';
import DataTable from '../../components/ui/DataTable';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_UK = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

const PIE_COLORS = chartPalette;



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
      render: (v: number) => <span className={s.colored}>{formatUAH(v)}</span>,
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
      render: (v: number) => <span className={s.colored}>{formatUAH(v)}</span>,
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
      render: (v: number) => <span className={s.colored}>{formatUAH(v)}</span>,
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
      <PageHeader
        title={t.sales.analyticsTitle}
        subtitle={t.sales.analyticsSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.sales, path: '/sales' }, { label: t.nav.revenueAnalytics }]} />}
      />

      {/* Year filter */}
      <div className={s.spaced}>
        <span className={s.spaced1}>{t.economics.year}:</span>
        <Select
          value={year}
          onChange={setYear}
          options={YEAR_OPTIONS}
          className={s.block5}
        />
      </div>

      {/* KPI cards */}
      <Row gutter={16} className={s.spaced}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={s.bg}>
            <Statistic
              title={<span className={s.colored1}>{t.sales.totalRevenue}</span>}
              value={data?.totalRevenue ?? 0}
              suffix="UAH"
              valueStyle={{ color: 'var(--success)' }}
              prefix={<DollarOutlined />}
              formatter={(v) => formatNumber(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={s.bg}>
            <Statistic
              title={<span className={s.colored1}>{t.sales.salesCount}</span>}
              value={data?.totalSalesCount ?? 0}
              valueStyle={{ color: '#58A6FF' }}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={s.bg}>
            <Statistic
              title={<span className={s.colored1}>{t.sales.topProducts}</span>}
              value={topProduct?.product ?? '—'}
              valueStyle={{ color: 'var(--warning)', fontSize: 16 }}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={s.bg}>
            <Statistic
              title={<span className={s.colored1}>{t.sales.topBuyers}</span>}
              value={topBuyer?.buyerName ?? '—'}
              valueStyle={{ color: '#a371f7', fontSize: 16 }}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {!hasData && !loading ? (
        <Empty description={<span className={s.colored1}>{t.sales.noAnalyticsData}</span>} />
      ) : (
        <>
          {/* Charts row: pie by product + bar by buyer */}
          <Row gutter={16} className={s.spaced}>
            <Col xs={24} lg={12}>
              <Card
                title={<span className={s.colored2}>{t.sales.byProduct}</span>}
                className={s.bg}
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
                        contentStyle={chartConfig.tooltip.contentStyle} itemStyle={chartConfig.tooltip.itemStyle} cursor={chartConfig.tooltip.cursor}
                        formatter={(v: number) => [formatUAH(v), t.sales.revenueAmount]}
                      />
                      <Legend wrapperStyle={{ color: 'var(--text-secondary)', fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description={<span className={s.colored1}>{t.sales.noAnalyticsData}</span>} />
                )}
              </Card>
            </Col>
            <Col xs={24} lg={12}>
              <Card
                title={<span className={s.colored2}>{t.sales.byBuyer}</span>}
                className={s.bg}
                loading={loading}
              >
                {buyerChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={buyerChartData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={chartConfig.grid.stroke} vertical={chartConfig.grid.vertical} horizontal={false} />
                      <XAxis type="number" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} width={90} />
                      <Tooltip
                        contentStyle={chartConfig.tooltip.contentStyle} itemStyle={chartConfig.tooltip.itemStyle} cursor={chartConfig.tooltip.cursor}
                        formatter={(v: number) => [formatUAH(v)]}
                      />
                      <Bar dataKey={t.sales.revenueAmount} fill="#3B82F6" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Empty description={<span className={s.colored1}>{t.sales.noAnalyticsData}</span>} />
                )}
              </Card>
            </Col>
          </Row>

          {/* Monthly revenue chart */}
          <Card
            title={<span className={s.colored2}>{t.sales.monthlyRevenue}</span>}
            className={s.spaced2}
            loading={loading}
          >
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={monthlyChartData} margin={{ top: 5, right: 20, left: 20, bottom: 40 }}>
                  <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={chartConfig.grid.stroke} vertical={chartConfig.grid.vertical} />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--text-secondary)', fontSize: 11 }}
                    angle={-35}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} />
                  <Tooltip
                    contentStyle={chartConfig.tooltip.contentStyle} itemStyle={chartConfig.tooltip.itemStyle} cursor={chartConfig.tooltip.cursor}
                    formatter={(v: number) => [formatUAH(v)]}
                  />
                  <Legend wrapperStyle={{ color: 'var(--text-secondary)' }} />
                  <Bar dataKey={t.sales.revenueAmount} fill="var(--success)" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <Empty description={<span className={s.colored1}>{t.sales.noAnalyticsData}</span>} />
            )}
          </Card>

          {/* Tables */}
          <Row gutter={16}>
            <Col xs={24} lg={12}>
              <Card
                title={<span className={s.colored2}>{t.sales.byProduct}</span>}
                className={s.spaced2}
              >
                <DataTable
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
                title={<span className={s.colored2}>{t.sales.byBuyer}</span>}
                className={s.spaced2}
              >
                <DataTable
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
            title={<span className={s.colored2}>{t.sales.byMonth}</span>}
            className={s.bg}
          >
            <DataTable
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
