import { useEffect, useState } from 'react';
import { Card, Col, Row, Select, Statistic, Table, Empty, message } from 'antd';
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
import { getSalaryFuelAnalytics } from '../../api/analytics';
import type { SalaryFuelAnalyticsDto, FuelByMachineDto, SalaryByEmployeeDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';

const YEAR_OPTIONS = Array.from({ length: 8 }, (_, i) => {
  const y = 2020 + i;
  return { value: y, label: String(y) };
});

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const fmt = (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 0 });
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
      render: (v: number) => `${fmt(v)} UAH`,
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

      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Select
            value={year}
            options={YEAR_OPTIONS}
            onChange={setYear}
            style={{ width: 120 }}
          />
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t.analytics.totalSalary}
              value={data?.totalSalary ?? 0}
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
              title={t.analytics.totalFuel}
              value={data?.totalFuelLiters ?? 0}
              suffix="л"
              prefix={<FireOutlined />}
              valueStyle={{ color: '#d46b08' }}
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
        <Empty description={t.analytics.salaryFuelEmpty} style={{ margin: '40px 0' }} />
      ) : (
        <>
          <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
            <Col xs={24} md={12}>
              <Card title={t.analytics.salaryByMonth}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={salaryChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => fmt(v)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${fmt(v)} UAH`} />
                    <Bar dataKey={t.analytics.totalSalary} fill="#73d13d" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
            <Col xs={24} md={12}>
              <Card title={t.analytics.fuelByMonth}>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={fuelChartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tickFormatter={(v) => fmtDec(v)} tick={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number) => `${fmtDec(v)} л`} />
                    <Bar dataKey={t.analytics.totalFuel} fill="#ffa940" />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          </Row>

          {(data?.fuelByMachine ?? []).length > 0 && (
            <Card title={t.analytics.fuelByMachine} style={{ marginBottom: 24 }}>
              <Table<FuelByMachineDto>
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
              <Table<SalaryByEmployeeDto>
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
