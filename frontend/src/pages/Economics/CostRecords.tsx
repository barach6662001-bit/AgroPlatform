import { useEffect, useState } from 'react';
import { Table, Tag, Space, DatePicker, Select, message } from 'antd';
import { getCostRecords } from '../../api/economics';
import type { CostRecordDto } from '../../types/economics';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const { RangePicker } = DatePicker;

const categoryColors: Record<string, string> = {
  Seeds: 'green', Fertilizers: 'blue', Pesticides: 'orange',
  Fuel: 'volcano', Labor: 'purple', Equipment: 'cyan',
  Other: 'default',
};

export default function CostRecords() {
  const [records, setRecords] = useState<CostRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const { t } = useTranslation();

  const load = () => {
    setLoading(true);
    getCostRecords({
      category,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
    })
      .then(setRecords)
      .catch(() => message.error(t.economics.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category, dateRange]);

  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  const columns = [
    {
      title: t.economics.date, dataIndex: 'date', key: 'date',
      sorter: (a: CostRecordDto, b: CostRecordDto) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: t.economics.category, dataIndex: 'category', key: 'category',
      render: (v: string) => <Tag color={categoryColors[v] || 'default'}>{t.costCategories[v as keyof typeof t.costCategories] || v}</Tag>,
    },
    {
      title: t.economics.amount, dataIndex: 'amount', key: 'amount',
      sorter: (a: CostRecordDto, b: CostRecordDto) => a.amount - b.amount,
      render: (v: number, r: CostRecordDto) => <strong>{v.toFixed(2)} {r.currency}</strong>,
    },
    { title: t.economics.description, dataIndex: 'description', key: 'description', render: (v: string) => v || '—' },
  ];

  return (
    <div>
      <PageHeader title={t.economics.title} subtitle={t.economics.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder={t.economics.categoryFilter}
          allowClear
          style={{ width: 200 }}
          value={category}
          onChange={setCategory}
          options={Object.entries(t.costCategories).map(([k, v]) => ({ value: k, label: v }))}
        />
        <RangePicker
          onChange={(_, dateStrings) =>
            setDateRange(dateStrings[0] && dateStrings[1] ? [dateStrings[0], dateStrings[1]] : null)
          }
          placeholder={[t.economics.dateFrom, t.economics.dateTo]}
        />
      </Space>
      <Table
        dataSource={records}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}><strong>{t.economics.total}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <strong style={{ color: '#f5222d' }}>{totalAmount.toFixed(2)} UAH</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} />
          </Table.Summary.Row>
        )}
      />
    </div>
  );
}
