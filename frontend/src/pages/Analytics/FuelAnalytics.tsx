import { useEffect, useState } from 'react';
import { Table, Spin, message } from 'antd';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { getFuelAnalytics } from '../../api/analytics';
import type { FuelConsumptionPerMachineDto, MonthlyFuelTrendDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

export default function FuelAnalytics() {
  const [perMachine, setPerMachine] = useState<FuelConsumptionPerMachineDto[]>([]);
  const [monthlyTrend, setMonthlyTrend] = useState<MonthlyFuelTrendDto[]>([]);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    getFuelAnalytics()
      .then((data) => {
        setPerMachine(data.perMachine);
        setMonthlyTrend(data.monthlyTrend);
      })
      .catch(() => message.error(t.analytics.loadError))
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { title: t.analytics.machineName, dataIndex: 'machineName', key: 'machineName' },
    { title: t.analytics.machineType, dataIndex: 'machineType', key: 'machineType', render: (v: string | null) => v ?? '—' },
    {
      title: t.analytics.totalFuelLiters,
      dataIndex: 'totalFuelLiters',
      key: 'totalFuelLiters',
      render: (v: number) => `${v.toFixed(1)} л`,
      sorter: (a: FuelConsumptionPerMachineDto, b: FuelConsumptionPerMachineDto) => a.totalFuelLiters - b.totalFuelLiters,
    },
    {
      title: t.analytics.totalAreaHa,
      dataIndex: 'totalAreaHectares',
      key: 'totalAreaHectares',
      render: (v: number) => `${v.toFixed(1)} га`,
      sorter: (a: FuelConsumptionPerMachineDto, b: FuelConsumptionPerMachineDto) => a.totalAreaHectares - b.totalAreaHectares,
    },
    {
      title: t.analytics.litersPerHa,
      dataIndex: 'litersPerHectare',
      key: 'litersPerHectare',
      render: (v: number) => v > 0 ? `${v.toFixed(2)} л/га` : '—',
      sorter: (a: FuelConsumptionPerMachineDto, b: FuelConsumptionPerMachineDto) => a.litersPerHectare - b.litersPerHectare,
    },
    {
      title: t.analytics.hoursWorked,
      dataIndex: 'totalHoursWorked',
      key: 'totalHoursWorked',
      render: (v: number) => `${v.toFixed(1)} год`,
      sorter: (a: FuelConsumptionPerMachineDto, b: FuelConsumptionPerMachineDto) => a.totalHoursWorked - b.totalHoursWorked,
    },
  ];

  const barChartData = perMachine.map((item) => ({
    name: item.machineName,
    [t.analytics.litersPerHa]: Number(item.litersPerHectare.toFixed(2)),
    [t.analytics.totalFuelLiters]: Number(item.totalFuelLiters.toFixed(1)),
  }));

  const lineChartData = monthlyTrend.map((item) => ({
    name: `${item.year}-${String(item.month).padStart(2, '0')}`,
    [t.analytics.totalFuelLiters]: Number(item.totalLiters.toFixed(1)),
  }));

  return (
    <div>
      <PageHeader title={t.analytics.fuelAnalytics} subtitle={t.analytics.title} />
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <>
          <Table
            dataSource={perMachine}
            columns={columns}
            rowKey="machineId"
            pagination={false}
            style={{ marginBottom: 32 }}
          />

          {barChartData.length > 0 && (
            <>
              <h3 style={{ marginBottom: 12 }}>{t.analytics.machineComparisonTitle}</h3>
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={barChartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey={t.analytics.litersPerHa} fill="#faad14" radius={[4, 4, 0, 0]} />
                  <Bar dataKey={t.analytics.totalFuelLiters} fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}

          {lineChartData.length > 0 && (
            <>
              <h3 style={{ marginTop: 32, marginBottom: 12 }}>{t.analytics.monthlyTrendTitle}</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey={t.analytics.totalFuelLiters}
                    stroke="#faad14"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </>
      )}
    </div>
  );
}
