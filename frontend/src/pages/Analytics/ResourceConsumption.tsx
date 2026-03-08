import { useEffect, useState } from 'react';
import { Table, DatePicker, Space, Spin, message } from 'antd';
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
import { getResourceConsumption } from '../../api/analytics';
import type { ResourceConsumptionDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const { RangePicker } = DatePicker;

export default function ResourceConsumption() {
  const [data, setData] = useState<ResourceConsumptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getResourceConsumption(dateRange ? { from: dateRange[0], to: dateRange[1] } : undefined)
      .then(setData)
      .catch(() => message.error(t.analytics.loadError))
      .finally(() => setLoading(false));
  }, [dateRange]);

  const columns = [
    { title: t.analytics.resourceName, dataIndex: 'resourceName', key: 'resourceName' },
    {
      title: t.analytics.totalQuantity,
      dataIndex: 'totalQuantity',
      key: 'totalQuantity',
      render: (v: number) => v.toFixed(2),
      sorter: (a: ResourceConsumptionDto, b: ResourceConsumptionDto) => a.totalQuantity - b.totalQuantity,
    },
    { title: t.analytics.unit, dataIndex: 'unit', key: 'unit' },
    { title: t.analytics.operationType, dataIndex: 'operationType', key: 'operationType' },
  ];

  const chartData = data.map((item) => ({
    name: item.resourceName,
    [t.analytics.totalQuantity]: Number(item.totalQuantity.toFixed(2)),
  }));

  return (
    <div>
      <PageHeader title={t.analytics.resourceConsumption} subtitle={t.analytics.title} />
      <Space style={{ marginBottom: 16 }}>
        <RangePicker
          onChange={(_, dateStrings) =>
            setDateRange(dateStrings[0] && dateStrings[1] ? [dateStrings[0], dateStrings[1]] : null)
          }
          placeholder={[t.analytics.from, t.analytics.to]}
        />
      </Space>
      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <>
          <Table
            dataSource={data}
            columns={columns}
            rowKey={(r) => `${r.resourceName}-${r.operationType}`}
            pagination={false}
            style={{ marginBottom: 32 }}
          />
          {chartData.length > 0 && (
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" interval={0} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey={t.analytics.totalQuantity} fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </>
      )}
    </div>
  );
}
