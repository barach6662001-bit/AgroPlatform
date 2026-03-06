import { useEffect, useState } from 'react';
import { Table, Tag, Space, DatePicker, Select, message, Button, Modal, Form, Input, InputNumber, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { getCostRecords, createCostRecord, deleteCostRecord } from '../../api/economics';
import type { CostRecordDto } from '../../types/economics';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const { RangePicker } = DatePicker;

const categoryColors: Record<string, string> = {
  Seeds: 'green', Fertilizers: 'blue', Pesticides: 'orange',
  Fuel: 'volcano', Labor: 'purple', Equipment: 'cyan',
  Other: 'default',
};

export default function CostRecords() {
  const [result, setResult] = useState<PaginatedResult<CostRecordDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();

  const load = (p = page, ps = pageSize) => {
    setLoading(true);
    getCostRecords({
      category,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
      page: p,
      pageSize: ps,
    })
      .then(setResult)
      .catch(() => message.error(t.economics.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category, dateRange, page, pageSize]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const date = values.date ? (values.date as { toISOString: () => string }).toISOString() : new Date().toISOString();
      await createCostRecord({ ...values, date });
      message.success(t.economics.createSuccess);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch {
      message.error(t.economics.createError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCostRecord(id);
      message.success(t.economics.deleteSuccess);
      load();
    } catch {
      message.error(t.economics.deleteError);
    }
  };

  const records = result?.items ?? [];
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
    {
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: CostRecordDto) => (
        <Popconfirm title={t.economics.deleteConfirm} onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
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
        <Button
          type="primary"
          icon={<PlusOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a' }}
          onClick={() => setModalOpen(true)}
        >
          {t.economics.createRecord}
        </Button>
      </Space>
      <Table
        dataSource={records}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: result?.totalCount ?? 0,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={2}><strong>{t.economics.total}</strong></Table.Summary.Cell>
            <Table.Summary.Cell index={1}>
              <strong style={{ color: '#f5222d' }}>{totalAmount.toFixed(2)} UAH</strong>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={2} />
            <Table.Summary.Cell index={3} />
          </Table.Summary.Row>
        )}
      />

      <Modal
        title={t.economics.createRecord}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="category" label={t.economics.category} rules={[{ required: true, message: t.common.required }]}>
            <Select
              placeholder={t.economics.selectCategory}
              options={Object.entries(t.costCategories).map(([k, v]) => ({ value: k, label: v }))}
            />
          </Form.Item>
          <Form.Item name="amount" label={t.economics.amount} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} placeholder={t.economics.enterAmount} />
          </Form.Item>
          <Form.Item name="currency" label={t.economics.currency} initialValue="UAH" rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="date" label={t.economics.date} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label={t.economics.description}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
