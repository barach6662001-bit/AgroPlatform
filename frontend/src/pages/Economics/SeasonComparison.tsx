import { useEffect, useState } from 'react';
import { Card, Col, Row, Select, Statistic, Table, Empty, message, Tag } from 'antd';
import { ArrowDownOutlined, ArrowUpOutlined, DollarOutlined } from '@ant-design/icons';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getSeasonComparison } from '../../api/economics';
import type { SeasonComparisonDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const CURRENT_YEAR = new Date().getFullYear();
const ALL_YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const DEFAULT_YEARS = [CURRENT_YEAR - 2, CURRENT_YEAR - 1, CURRENT_YEAR].filter((y) => y >= 2020);

const fmt = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 0 });
const fmtPct = (v?: number) => (v != null ? `${v.toFixed(1)}%` : '—');

export default function SeasonComparison() {
  const { t } = useTranslation();
  const [selectedYears, setSelectedYears] = useState<number[]>(DEFAULT_YEARS);
  const [data, setData] = useState<SeasonComparisonDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSeasonComparison(selectedYears)
      .then(setData)
      .catch(() => message.error(t.economics.seasonLoadError))
      .finally(() => setLoading(false));
  }, [selectedYears]);

  const chartData = data.map((row) => ({
    name: String(row.year),
    [t.economics.seasonRevenue]: row.totalRevenue,
    [t.economics.seasonCosts]: row.totalCosts,
  }));

  const columns = [
    {
      title: t.economics.seasonYear,
      dataIndex: 'year',
      key: 'year',
      render: (v: number) => <strong>{v}</strong>,
    },
    {
      title: t.economics.seasonRevenue,
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (v: number) => `${fmt(v)} UAH`,
    },
    {
      title: t.economics.seasonCosts,
      dataIndex: 'totalCosts',
      key: 'totalCosts',
      render: (v: number) => `${fmt(v)} UAH`,
    },
    {
      title: t.economics.seasonMargin,
      dataIndex: 'margin',
      key: 'margin',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'success' : 'error'}>{fmt(v)} UAH</Tag>
      ),
    },
    {
      title: t.economics.seasonMarginPct,
      dataIndex: 'marginPercent',
      key: 'marginPercent',
      render: (v?: number) => fmtPct(v),
    },
    {
      title: t.economics.seasonAreaHa,
      dataIndex: 'totalAreaHectares',
      key: 'totalAreaHectares',
      render: (v?: number) => (v != null ? fmt(v) : '—'),
    },
    {
      title: t.economics.seasonCostPerHa,
      dataIndex: 'costsPerHectare',
      key: 'costsPerHectare',
      render: (v?: number) => (v != null ? `${fmt(v)} UAH` : '—'),
    },
    {
      title: t.economics.seasonRevenuePerHa,
      dataIndex: 'revenuePerHectare',
      key: 'revenuePerHectare',
      render: (v?: number) => (v != null ? `${fmt(v)} UAH` : '—'),
    },
  ];

  const hasData = data.some((d) => d.totalRevenue > 0 || d.totalCosts > 0);

  // KPI: pick best year by margin
  const bestRow = data.length > 0
    ? data.reduce((best, cur) => (cur.margin > best.margin ? cur : best), data[0])
    : null;

  const totalRevenue = data.reduce((s, r) => s + r.totalRevenue, 0);
  const totalCosts   = data.reduce((s, r) => s + r.totalCosts, 0);
  const totalMargin  = totalRevenue - totalCosts;
  const marginPositive = totalMargin >= 0;

  return (
    <div>
      <PageHeader title={t.economics.seasonTitle} subtitle={t.economics.seasonSubtitle} />

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Select
            mode="multiple"
            placeholder={t.economics.seasonSelectYears}
            value={selectedYears}
            options={ALL_YEAR_OPTIONS}
            onChange={setSelectedYears}
            style={{ minWidth: 240 }}
            allowClear
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.economics.seasonRevenue}
              value={totalRevenue}
              suffix="UAH"
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#3f8600' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.economics.seasonCosts}
              value={totalCosts}
              suffix="UAH"
              prefix={<ArrowDownOutlined />}
              valueStyle={{ color: '#cf1322' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.economics.seasonMargin}
              value={totalMargin}
              suffix="UAH"
              prefix={marginPositive ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
              valueStyle={{ color: marginPositive ? '#3f8600' : '#cf1322' }}
              loading={loading}
              formatter={(v) => fmt(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.economics.seasonBestYear}
              value={bestRow ? String(bestRow.year) : '—'}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {!loading && !hasData ? (
        <Empty description={t.economics.seasonEmpty} style={{ margin: '40px 0' }} />
      ) : (
        <>
          {chartData.length > 0 && (
            <Card title={t.economics.seasonChartTitle} style={{ marginBottom: 24 }}>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${fmt(v)} UAH`} />
                  <Legend />
                  <Bar dataKey={t.economics.seasonRevenue} fill="#73d13d" />
                  <Bar dataKey={t.economics.seasonCosts} fill="#ff7875" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          <Card>
            <Table<SeasonComparisonDto>
              dataSource={data}
              columns={columns}
              rowKey="year"
              loading={loading}
              pagination={false}
              size="small"
            />
          </Card>
        </>
      )}
    </div>
  );
}
