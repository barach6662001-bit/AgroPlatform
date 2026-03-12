import { useEffect, useState } from 'react';
import { Table, Tag, Space, DatePicker, Select, message, Button, Modal, Form, Input, InputNumber, Popconfirm, Card, Divider, Empty } from 'antd';
import { PlusOutlined, DeleteOutlined, ExperimentOutlined, AppstoreOutlined, MedicineBoxOutlined, ThunderboltOutlined, GiftOutlined, CalculatorOutlined, DownloadOutlined } from '@ant-design/icons';
import { getCostRecords, getCostSummary, createCostRecord, deleteCostRecord } from '../../api/economics';
import type { CostSummaryDto } from '../../api/economics';
import { getBudgets } from '../../api/budgets';
import type { BudgetDto } from '../../api/budgets';
import type { CostRecordDto, MaterialKpiItem } from '../../types/economics';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import PLTable from '../../components/PLTable';
import MaterialKpiCards from '../../components/MaterialKpiCards';
import type { PLTableRow } from '../../components/PLTable';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import apiClient from '../../api/axios';

const { RangePicker } = DatePicker;

const categoryColors: Record<string, string> = {
  Seeds: 'green', Fertilizers: 'blue', Pesticides: 'orange',
  Fuel: 'volcano', Labor: 'purple', Equipment: 'cyan',
  Other: 'default',
};

const CATEGORIES = ['Seeds', 'Fertilizers', 'Pesticides', 'Fuel', 'Labor', 'Equipment', 'Other'];

export default function CostRecords() {
  const [result, setResult] = useState<PaginatedResult<CostRecordDto> | null>(null);
  const [summary, setSummary] = useState<CostSummaryDto | null>(null);
  const [budgets, setBudgets] = useState<BudgetDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();

  const canCreate = hasRole(['Administrator', 'Manager']);
  const canDelete = hasRole(['Administrator', 'Manager']);

  const currentYear = new Date().getFullYear();

  const load = (p = page, ps = pageSize) => {
    setLoading(true);
    const paginated = getCostRecords({
      category,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
      page: p,
      pageSize: ps,
    }).then(setResult);

    const summaryFetch = getCostSummary({
      category,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
    }).then(setSummary);

    const budgetFetch = getBudgets(currentYear).then(setBudgets);

    Promise.all([paginated, summaryFetch, budgetFetch])
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

  const handleExport = async () => {
    setExporting(true);
    try {
      const resp = await apiClient.get('/api/economics/cost-records/export', {
        params: { category, dateFrom: dateRange?.[0], dateTo: dateRange?.[1] },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `cost-records-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error(t.economics.loadError);
    } finally {
      setExporting(false);
    }
  };

  const records = result?.items ?? [];
  const totalAmount = records.reduce((sum, r) => sum + r.amount, 0);

  const sumByCategory = (cat: string) =>
    summary?.byCategory.find((c) => c.category === cat)?.amount ?? 0;

  const planByCategory = (cat: string) =>
    budgets.find((b) => b.category === cat)?.plannedAmount ?? 0;

  const plRows: PLTableRow[] = CATEGORIES.map((cat) => ({
    key: cat,
    label: t.costCategories[cat as keyof typeof t.costCategories] ?? cat,
    plan: planByCategory(cat),
    fact: sumByCategory(cat),
    unit: 'UAH',
    lowerIsBetter: true,
  }));

  const hasBudget = plRows.some((r) => r.plan > 0);

  const kpiItems: MaterialKpiItem[] = [
    { key: 'Fertilizers', label: t.materialKpi.fertilizers, amount: sumByCategory('Fertilizers'), icon: <ExperimentOutlined /> },
    { key: 'Seeds', label: t.materialKpi.seeds, amount: sumByCategory('Seeds'), icon: <AppstoreOutlined /> },
    { key: 'Pesticides', label: t.materialKpi.pesticides, amount: sumByCategory('Pesticides'), icon: <MedicineBoxOutlined /> },
    { key: 'Fuel', label: t.materialKpi.fuel, amount: sumByCategory('Fuel'), icon: <ThunderboltOutlined /> },
    { key: 'Harvest', label: t.materialKpi.harvest, amount: 0, icon: <GiftOutlined /> },
    { key: 'Total', label: t.materialKpi.total, amount: summary?.totalAmount ?? 0, icon: <CalculatorOutlined />, isTotal: true },
  ];

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
      render: (_: unknown, record: CostRecordDto) => canDelete ? (
        <Popconfirm title={t.economics.deleteConfirm} onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title={t.economics.title} subtitle={t.economics.subtitle} />

      <div style={{ marginBottom: 24 }}>
        <MaterialKpiCards items={kpiItems} loading={loading} />
      </div>

      <Card
        style={{ marginBottom: 24, background: '#161B22', border: '1px solid #30363D' }}
        bodyStyle={{ padding: 0 }}
        title={<span style={{ color: '#E6EDF3', fontSize: 15, fontWeight: 600 }}>{t.economics.plTableTitle}</span>}
      >
        {!hasBudget && !loading ? (
          <div style={{ padding: '32px 16px' }}>
            <Empty description={<span style={{ color: '#8B949E' }}>{t.economics.plNoPlan}</span>} />
          </div>
        ) : (
          <PLTable
            rows={plRows}
            labels={{
              metric: t.economics.plColMetric,
              plan: t.economics.plColPlan,
              fact: t.economics.plColFact,
              execution: t.economics.plColExecution,
            }}
          />
        )}
      </Card>

      <Divider style={{ borderColor: '#30363D', margin: '0 0 16px' }} />

      <Space style={{ marginBottom: 16 }} wrap>
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
        {canCreate && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t.economics.createRecord}
          </Button>
        )}
        <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
          {t.warehouses_export.exportCosts}
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
