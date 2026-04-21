import { useEffect, useState } from 'react';
import { formatUAH, formatNumber } from '../../utils/format';
import { Card, Col, Row, Select, Statistic, Empty, message, Tag } from 'antd';
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
import { chartConfig, chartColors } from '../../components/charts/chartTheme';
import { getSeasonComparison } from '../../api/economics';
import type { SeasonComparisonDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './SeasonComparison.module.css';
import DataTable from '../../components/ui/DataTable';

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = CURRENT_YEAR - 4 + i;
  return { value: y, label: String(y) };
});



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
      render: (v: number) => formatUAH(v),
      sorter: (a: SeasonComparisonDto, b: SeasonComparisonDto) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: t.economics.seasonCosts,
      dataIndex: 'totalCosts',
      key: 'totalCosts',
      render: (v: number) => formatUAH(v),
      sorter: (a: SeasonComparisonDto, b: SeasonComparisonDto) => a.totalCosts - b.totalCosts,
    },
    {
      title: t.economics.seasonMargin,
      dataIndex: 'margin',
      key: 'margin',
      render: (v: number) => (
        <Tag color={v >= 0 ? 'success' : 'error'}>{formatUAH(v)}</Tag>
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
      render: (v?: number) => (v != null ? formatNumber(v) : '—'),
    },
    {
      title: t.economics.seasonCostPerHa,
      dataIndex: 'costPerHa',
      key: 'costPerHa',
      render: (v?: number) => (v != null ? formatUAH(v) : '—'),
    },
    {
      title: t.economics.seasonRevenuePerHa,
      dataIndex: 'revenuePerHa',
      key: 'revenuePerHa',
      render: (v?: number) => (v != null ? formatUAH(v) : '—'),
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
                    formatter={(v) => formatNumber(Number(v))}
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
                    formatter={(v) => formatNumber(Number(v))}
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
                  <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={chartConfig.grid.stroke} vertical={chartConfig.grid.vertical} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7b9a' }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => formatNumber(v as number)} tick={{ fontSize: 11, fill: '#6b7b9a' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={chartConfig.tooltip.contentStyle} itemStyle={chartConfig.tooltip.itemStyle} cursor={chartConfig.tooltip.cursor} formatter={(v: number) => formatUAH(v)} />
                  <Legend />
                  <Bar dataKey={t.economics.seasonRevenue} fill="#22C55E" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t.economics.seasonCosts} fill="#EF4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t.economics.seasonMargin} fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          )}

          {data.length > 0 && (
            <Card>
              <DataTable<SeasonComparisonDto>
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
