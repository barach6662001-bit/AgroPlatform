import { useEffect, useState } from 'react';
import { formatUAH, formatNumber } from '../../utils/format';
import { Card, Col, Row, Select, Statistic, Empty, message } from 'antd';
import { DollarOutlined, FireOutlined } from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { chartConfig, chartColors } from '../../components/charts/chartTheme';
import { getSalaryFuelAnalytics } from '../../api/analytics';
import type { SalaryFuelAnalyticsDto, FuelByMachineDto, SalaryByEmployeeDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './SalaryFuelAnalytics.module.css';
import DataTable from '../../components/ui/DataTable';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];


const fmtDec = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 2 });

export default function SalaryFuelAnalytics() {
  const { t } = useTranslation();
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [data, setData] = useState<SalaryFuelAnalyticsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSalaryFuelAnalytics({ year })
      .then(setData)
      .catch((err) => {
        console.error('Failed to load salary-fuel analytics:', err);
        message.error(t.analytics.salaryFuelLoadError);
      })
      .finally(() => setLoading(false));
  }, [year, t]);

  const salaryChartData = (data?.salaryByMonth ?? []).map((item) => ({
    name: MONTH_LABELS[item.month - 1],
    [t.analytics.totalSalary]: item.value,
  }));

  const fuelChartData = (data?.fuelByMonth ?? []).map((item) => ({
    name: MONTH_LABELS[item.month - 1],
    [t.analytics.totalFuel]: item.value,
  }));

  const hasData = data && (data.totalSalary > 0 || data.totalFuelLiters > 0);

  const fuelByMachineColumns = [
    { title: t.analytics.machineName, dataIndex: 'machineName', key: 'machineName' },
    {
      title: t.analytics.liters,
      dataIndex: 'totalLiters',
      key: 'totalLiters',
      render: (v: number) => `${fmtDec(v)} л`,
      sorter: (a: FuelByMachineDto, b: FuelByMachineDto) => a.totalLiters - b.totalLiters,
    },
  ];

  const salaryByEmployeeColumns = [
    { title: t.analytics.employeeName, dataIndex: 'employeeFullName', key: 'employeeFullName' },
    { title: t.analytics.position, dataIndex: 'position', key: 'position', render: (v: string | null) => v ?? '—' },
    {
      title: t.analytics.amount,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => formatUAH(v),
      sorter: (a: SalaryByEmployeeDto, b: SalaryByEmployeeDto) => a.totalAmount - b.totalAmount,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.analytics.salaryFuelTitle}
        subtitle={t.analytics.salaryFuelSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.analytics, path: '/analytics/efficiency' }, { label: t.nav.salaryFuelAnalytics }]} />}
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
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.analytics.totalSalary}
              value={data?.totalSalary ?? 0}
              suffix="UAH"
              prefix={<DollarOutlined />}
              valueStyle={{ color: 'var(--success)' }}
              loading={loading}
              formatter={(v) => formatNumber(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.analytics.totalFuel}
              value={data?.totalFuelLiters ?? 0}
              suffix="л"
              prefix={<FireOutlined />}
              valueStyle={{ color: 'var(--warning)' }}
              loading={loading}
              formatter={(v) => fmtDec(Number(v))}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.analytics.litersPerHectare}
              value={data?.litersPerHectare != null ? fmtDec(data.litersPerHectare) : '—'}
              suffix={data?.litersPerHectare != null ? 'л/га' : ''}
              loading={loading}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.analytics.hectaresPerLaborHour}
              value={data?.hectaresPerLaborHour != null ? fmtDec(data.hectaresPerLaborHour) : '—'}
              suffix={data?.hectaresPerLaborHour != null ? 'га/год' : ''}
              loading={loading}
            />
          </Card>
        </Col>
      </Row>

      {!loading && !hasData ? (
        <Empty description={t.analytics.salaryFuelEmpty} className={s.spaced2} />
      ) : (
        <>
          <Row gutter={[16, 16]} className={s.spaced1}>
            <Col xs={24} md={12}>
              <Card title={t.analytics.salaryByMonth}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={salaryChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={chartConfig.grid.stroke} vertical={chartConfig.grid.vertical} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7b9a' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => formatNumber(v)} tick={{ fontSize: 11, fill: '#6b7b9a' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartConfig.tooltip.contentStyle} itemStyle={chartConfig.tooltip.itemStyle} cursor={chartConfig.tooltip.cursor} formatter={(v: number) => formatUAH(v)} />
                    <Bar dataKey={t.analytics.totalSalary} fill="#22C55E" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={t.analytics.fuelByMonth}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={fuelChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray={chartConfig.grid.strokeDasharray} stroke={chartConfig.grid.stroke} vertical={chartConfig.grid.vertical} />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#6b7b9a' }} axisLine={false} tickLine={false} />
                    <YAxis tickFormatter={(v) => fmtDec(v)} tick={{ fontSize: 11, fill: '#6b7b9a' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={chartConfig.tooltip.contentStyle} itemStyle={chartConfig.tooltip.itemStyle} cursor={chartConfig.tooltip.cursor} formatter={(v: number) => `${fmtDec(v)} л`} />
                    <Bar dataKey={t.analytics.totalFuel} fill="#F97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {(data?.fuelByMachine ?? []).length > 0 && (
            <Card title={t.analytics.fuelByMachine} className={s.spaced1}>
              <DataTable<FuelByMachineDto>
                dataSource={data?.fuelByMachine}
                columns={fuelByMachineColumns}
                rowKey="machineId"
                loading={loading}
                pagination={false}
                size="small"
              />
            </Card>
          )}

          {(data?.salaryByEmployee ?? []).length > 0 && (
            <Card title={t.analytics.salaryByEmployee}>
              <DataTable<SalaryByEmployeeDto>
                dataSource={data?.salaryByEmployee}
                columns={salaryByEmployeeColumns}
                rowKey="employeeId"
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
