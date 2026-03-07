import { useEffect, useState } from 'react';
import { Card, Col, Row, Spin, Table, message, DatePicker } from 'antd';
import type { ColumnsType } from 'antd/es/table';
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
import type { Dayjs } from 'dayjs';
import { getResourceConsumption } from '../../api/analytics';
import type { ResourceConsumptionDto } from '../../types/analytics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const { RangePicker } = DatePicker;

export default function ResourceConsumption() {
  const [data, setData] = useState<ResourceConsumptionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);
  const [params, setParams] = useState<{ dateFrom?: string; dateTo?: string }>({});
  const { t } = useTranslation();

  useEffect(() => {
    setLoading(true);
    getResourceConsumption(params)
      .then(setData)
      .catch(() => message.error(t.resourceConsumption.loadError))
      .finally(() => setLoading(false));
  }, [params]);

  const handleDateChange = (values: [Dayjs | null, Dayjs | null] | null) => {
    setDateRange(values);
    setParams(
      values?.[0] && values?.[1]
        ? { dateFrom: values[0].toISOString(), dateTo: values[1].toISOString() }
        : {},
    );
  };

  const columns: ColumnsType<ResourceConsumptionDto> = [
    {
      title: t.resourceConsumption.item,
      dataIndex: 'itemName',
      key: 'itemName',
      sorter: (a, b) => a.itemName.localeCompare(b.itemName),
    },
    {
      title: t.resourceConsumption.category,
      dataIndex: 'category',
      key: 'category',
      sorter: (a, b) => a.category.localeCompare(b.category),
    },
    {
      title: t.resourceConsumption.totalConsumed,
      dataIndex: 'totalConsumed',
      key: 'totalConsumed',
      align: 'right',
      render: (v: number) => v.toFixed(2),
      sorter: (a, b) => a.totalConsumed - b.totalConsumed,
      defaultSortOrder: 'descend',
    },
    {
      title: t.resourceConsumption.unit,
      dataIndex: 'unitCode',
      key: 'unitCode',
    },
  ];

  const chartData = data.slice(0, 10).map((item) => ({
    name: item.itemName,
    value: Number(item.totalConsumed.toFixed(2)),
    unit: item.unitCode,
  }));

  return (
    <div>
      <PageHeader title={t.resourceConsumption.title} subtitle={t.resourceConsumption.subtitle} />

      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col>
          <RangePicker
            value={dateRange}
            onChange={(values) => handleDateChange(values as [Dayjs | null, Dayjs | null] | null)}
          />
        </Col>
      </Row>

      {loading ? (
        <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />
      ) : (
        <Row gutter={[16, 16]}>
          {chartData.length > 0 && (
            <Col span={24}>
              <Card title={t.resourceConsumption.chartTitle}>
                <ResponsiveContainer width="100%" height={320}>
                  <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 80 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="name"
                      angle={-35}
                      textAnchor="end"
                      interval={0}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend verticalAlign="top" />
                    <Bar
                      dataKey="value"
                      fill="#52c41a"
                      name={t.resourceConsumption.totalConsumed}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            </Col>
          )}

          <Col span={24}>
            <Card>
              <Table
                rowKey="itemId"
                dataSource={data}
                columns={columns}
                pagination={{ pageSize: 20 }}
                locale={{ emptyText: t.resourceConsumption.noData }}
              />
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
