import { useEffect, useState } from 'react';
import { Card, Col, Row, Select, Statistic, Table, message } from 'antd';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getResourceEfficiency } from '../../api/analytics';
import type { ResourceEfficiencyDto, SalaryByEmployeeDto, FuelByMachineDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const MONTH_NAMES_UK = ['Січ', 'Лют', 'Бер', 'Кві', 'Тра', 'Чер', 'Лип', 'Сер', 'Вер', 'Жов', 'Лис', 'Гру'];

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i).map((y) => ({
  label: String(y),
  value: y,
}));

export default function SalaryFuelAnalytics() {
  const [year, setYear] = useState(currentYear);
  const [data, setData] = useState<ResourceEfficiencyDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { t, lang } = useTranslation();

  const monthLabels = lang === 'uk' ? MONTH_NAMES_UK : MONTH_NAMES;

  useEffect(() => {
    setLoading(true);
    getResourceEfficiency({ year })
      .then(setData)
      .catch((err) => { console.error(err); message.error(t.analytics.loadError); })
      .finally(() => setLoading(false));
  }, [year, t]);

  // ── chart data ────────────────────────────────────────────────────────────
  const salaryChartData = (data?.salaryByMonth ?? []).map((m) => ({
    name: monthLabels[m.month - 1],
    [t.analytics.paid]: Number(m.value.toFixed(2)),
  }));

  const fuelChartData = (data?.fuelByMonth ?? []).map((m) => ({
    name: monthLabels[m.month - 1],
    [t.analytics.liters]: Number(m.value.toFixed(1)),
  }));

  // ── salary table ──────────────────────────────────────────────────────────
  const salaryColumns = [
    { title: t.analytics.employee, dataIndex: 'employeeName', key: 'employeeName' },
    {
      title: t.analytics.paid,
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      render: (v: number) => v.toFixed(2),
      sorter: (a: SalaryByEmployeeDto, b: SalaryByEmployeeDto) => a.totalPaid - b.totalPaid,
    },
    {
      title: t.analytics.accrued,
      dataIndex: 'totalAccrued',
      key: 'totalAccrued',
      render: (v: number) => v.toFixed(2),
      sorter: (a: SalaryByEmployeeDto, b: SalaryByEmployeeDto) => a.totalAccrued - b.totalAccrued,
    },
    {
      title: t.analytics.hoursWorked,
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (v: number) => v.toFixed(1),
      sorter: (a: SalaryByEmployeeDto, b: SalaryByEmployeeDto) => a.totalHours - b.totalHours,
    },
  ];

  // ── fuel table ────────────────────────────────────────────────────────────
  const fuelColumns = [
    { title: t.analytics.machine, dataIndex: 'machineName', key: 'machineName' },
    {
      title: t.analytics.liters,
      dataIndex: 'totalLiters',
      key: 'totalLiters',
      render: (v: number) => v.toFixed(1),
      sorter: (a: FuelByMachineDto, b: FuelByMachineDto) => a.totalLiters - b.totalLiters,
    },
    {
      title: t.analytics.hoursWorked,
      dataIndex: 'totalHoursWorked',
      key: 'totalHoursWorked',
      render: (v: number) => v.toFixed(1),
      sorter: (a: FuelByMachineDto, b: FuelByMachineDto) => a.totalHoursWorked - b.totalHoursWorked,
    },
    {
      title: t.analytics.lPerH,
      dataIndex: 'litersPerHour',
      key: 'litersPerHour',
      render: (v: number | null) => (v != null ? v.toFixed(2) : '—'),
      sorter: (a: FuelByMachineDto, b: FuelByMachineDto) =>
        (a.litersPerHour ?? 0) - (b.litersPerHour ?? 0),
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.analytics.salaryFuelTitle}
        subtitle={t.analytics.salaryFuelSubtitle}
        actions={
          <Select
            value={year}
            options={yearOptions}
            onChange={setYear}
            style={{ width: 100 }}
          />
        }
      />

      {/* ── KPI cards ───────────────────────────────────────────────────── */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={t.analytics.totalSalaryPaid}
              value={data?.totalSalaryPayments ?? 0}
              precision={2}
              suffix="UAH"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={t.analytics.totalAccruedWages}
              value={data?.totalAccruedWages ?? 0}
              precision={2}
              suffix="UAH"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={t.analytics.totalFuelLiters}
              value={data?.totalFuelLiters ?? 0}
              precision={1}
              suffix="L"
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card loading={loading}>
            <Statistic
              title={t.analytics.totalLaborHours}
              value={data?.totalLaborHours ?? 0}
              precision={1}
              suffix="h"
            />
          </Card>
        </Col>
      </Row>

      {/* ── Efficiency ratio cards ───────────────────────────────────────── */}
      {(data?.litersPerHectare != null || data?.hectaresPerLaborHour != null) && (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          {data?.litersPerHectare != null && (
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title={t.analytics.litersPerHa}
                  value={data.litersPerHectare}
                  precision={2}
                  suffix="L/ha"
                />
              </Card>
            </Col>
          )}
          {data?.hectaresPerLaborHour != null && (
            <Col xs={24} sm={12}>
              <Card>
                <Statistic
                  title={t.analytics.haPerHour}
                  value={data.hectaresPerLaborHour}
                  precision={4}
                  suffix="ha/hr"
                />
              </Card>
            </Col>
          )}
        </Row>
      )}

      {/* ── Salary by month chart ────────────────────────────────────────── */}
      <Card
        title={t.analytics.salaryByMonth}
        style={{ marginBottom: 24 }}
        loading={loading}
      >
        {salaryChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={salaryChartData} margin={{ top: 8, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={t.analytics.paid} fill="#4CAF50" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
            —
          </div>
        )}
      </Card>

      {/* ── Salary by employee table ─────────────────────────────────────── */}
      <Card title={t.analytics.salaryByEmployee} style={{ marginBottom: 24 }}>
        <Table
          dataSource={data?.salaryByEmployee ?? []}
          columns={salaryColumns}
          rowKey="employeeId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* ── Fuel by month chart ──────────────────────────────────────────── */}
      <Card
        title={t.analytics.fuelByMonth}
        style={{ marginBottom: 24 }}
        loading={loading}
      >
        {fuelChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={fuelChartData} margin={{ top: 8, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey={t.analytics.liters} fill="#FF9800" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-tertiary)' }}>
            —
          </div>
        )}
      </Card>

      {/* ── Fuel by machine table ────────────────────────────────────────── */}
      <Card title={t.analytics.fuelByMachine}>
        <Table
          dataSource={data?.fuelByMachine ?? []}
          columns={fuelColumns}
          rowKey="machineId"
          loading={loading}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>
    </div>
  );
}
