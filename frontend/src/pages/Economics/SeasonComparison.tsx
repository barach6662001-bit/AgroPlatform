import { useEffect, useState } from 'react';
import { Card, Col, Row, Select, Statistic, Table, Empty, message, Tag } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { getSeasonComparison } from '../../api/economics';
import type { SeasonComparisonDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './SeasonComparison.module.css';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = CURRENT_YEAR - 4 + i;
  return { value: y, label: String(y) };
});

const fmt = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 0 });

export default function SeasonComparison() {
  const { t } = useTranslation();
  const [selectedYears, setSelectedYears] = useState<number[]>([CURRENT_YEAR - 1, CURRENT_YEAR]);
  const [data, setData] = useState<SeasonComparisonDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedYears.length === 0) {
      setData([]);
      return;
    }
    setLoading(true);
    getSeasonComparison(selectedYears)
      .then(setData)
      .catch(() => message.error(t.economics.seasonLoadError))
      .finally(() => setLoading(false));
  }, [selectedYears, t.economics.seasonLoadError]);

  const bestYear = data.length > 0
    ? data.reduce((best, row) => (row.margin > best.margin ? row : best), data[0])
    : null;

  const chartData = data.map((row) => ({
    name: String(row.year),
    [t.economics.seasonRevenue]: row.totalRevenue,
    [t.economics.seasonCosts]: row.totalCosts,
    [t.economics.seasonMargin]: row.margin,
  }));

  const columns = [
    {
      title: t.economics.seasonYear,
      dataIndex: 'year',
      key: 'year',
      render: (v: number) => (
        <strong>{v}{bestYear?.year === v ? ' 🏆' : ''}</strong>
      ),
    },
    {
      title: t.economics.seasonRevenue,
      dataIndex: 'totalRevenue',
      key: 'totalRevenue',
      render: (v: number) => `${fmt(v)} UAH`,
      sorter: (a: SeasonComparisonDto, b: SeasonComparisonDto) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: t.economics.seasonCosts,
      dataIndex: 'totalCosts',
      key: 'totalCosts',
      render: (v: number) => `${fmt(v)} UAH`,
      sorter: (a: SeasonComparisonDto, b: SeasonComparisonDto) => a.totalCosts - b.totalCosts,
    },
    {
      title: t.economics.seasonMargin,
      dataIndex: 'margin',
      key: 'margin',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'success' : 'error'}>{fmt(v)} UAH</Tag>
      ),
      sorter: (a: SeasonComparisonDto, b: SeasonComparisonDto) => a.margin - b.margin,
    },
    {
      title: t.economics.seasonMarginPct,
      dataIndex: 'marginPercent',
      key: 'marginPercent',
      render: (v?: number) => (v != null ? `${v.toFixed(1)}%` : '—'),
      sorter: (a: SeasonComparisonDto, b: SeasonComparisonDto) =>
        (a.marginPercent ?? 0) - (b.marginPercent ?? 0),
    },
    {
      title: t.economics.seasonAreaHa,
      dataIndex: 'areaHa',
      key: 'areaHa',
      render: (v?: number) => (v != null ? fmt(v) : '—'),
    },
    {
      title: t.economics.seasonCostPerHa,
      dataIndex: 'costPerHa',
      key: 'costPerHa',
      render: (v?: number) => (v != null ? `${fmt(v)} UAH` : '—'),
    },
    {
      title: t.economics.seasonRevenuePerHa,
      dataIndex: 'revenuePerHa',
      key: 'revenuePerHa',
      render: (v?: number) => (v != null ? `${fmt(v)} UAH` : '—'),
    },
  ];

  const hasData = data.length > 0 && data.some((r) => r.totalRevenue > 0 || r.totalCosts > 0);

  return (
    <div>
      <PageHeader
        title={t.economics.seasonTitle}
        subtitle={t.economics.seasonSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.finance, path: '/economics' }, { label: t.nav.seasonComparison }]} />}
      />

      <Row gutter={[16, 16]} align="middle" className={s.spaced}>
        <Col>
          <Select
            mode="multiple"
            value={selectedYears}
            options={YEAR_OPTIONS}
            onChange={setSelectedYears}
            placeholder={t.economics.seasonSelectYears}
            className={s.block1}
          />
        </Col>
      </Row>

      {!loading && !hasData ? (
        <Empty description={t.economics.seasonEmpty} className={s.spaced1} />
      ) : (
        <>
          {bestYear && (
            <Row gutter={[16, 16]} className={s.spaced2}>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t.economics.seasonBestYear}
                    value={bestYear.year}
                    loading={loading}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t.economics.seasonRevenue}
                    value={bestYear.totalRevenue}
                    suffix="UAH"
                    valueStyle={{ color: 'var(--success)' }}
                    loading={loading}
                    formatter={(v) => fmt(Number(v))}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t.economics.seasonMargin}
                    value={bestYear.margin}
                    suffix="UAH"
                    valueStyle={{ color: bestYear.margin >= 0 ? 'var(--success)' : 'var(--error)' }}
                    loading={loading}
                    formatter={(v) => fmt(Number(v))}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card>
                  <Statistic
                    title={t.economics.seasonMarginPct}
                    value={bestYear.marginPercent != null ? bestYear.marginPercent : '—'}
                    suffix={bestYear.marginPercent != null ? '%' : ''}
                    valueStyle={{ color: bestYear.margin >= 0 ? 'var(--success)' : 'var(--error)' }}
                    loading={loading}
                  />
                </Card>
              </Col>
            </Row>
          )}

          {chartData.length > 0 && (
            <Card title={t.economics.seasonChartTitle} className={s.spaced2}>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={chartData} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 13 }} />
                  <YAxis tickFormatter={(v) => fmt(v as number)} tick={{ fontSize: 12 }} />
                  <Tooltip formatter={(v: number) => `${fmt(v)} UAH`} />
                  <Legend />
                  <Bar dataKey={t.economics.seasonRevenue} fill="#73d13d" />
                  <Bar dataKey={t.economics.seasonCosts} fill="#ff7875" />
                  <Bar dataKey={t.economics.seasonMargin} fill="#4096ff" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {data.length > 0 && (
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
          )}
        </>
      )}
    </div>
  );
}
