import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Table, Tag, Space, DatePicker, Select, message, Button, Modal, Form, Input, InputNumber } from 'antd';
import dayjs from 'dayjs';
import { PlusOutlined, ExperimentOutlined, AppstoreOutlined, MedicineBoxOutlined, ThunderboltOutlined, GiftOutlined, CalculatorOutlined, DownloadOutlined, HomeOutlined, PrinterOutlined } from '@ant-design/icons';
import { printReport } from '../../utils/printReport';
import { getCostRecords, getCostSummary, createCostRecord, deleteCostRecord } from '../../api/economics';
import type { CostRecordDto, CostSummaryDto, MaterialKpiItem, CostCategory } from '../../types/economics';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import MaterialKpiCards from '../../components/MaterialKpiCards';
import TableSkeleton from '../../components/TableSkeleton';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { useFormatCurrency } from '../../hooks/useFormatCurrency';
import { formatDate } from '../../utils/dateFormat';
import apiClient from '../../api/axios';
import { enqueueOperation } from '../../utils/offlineQueue';
import PremiumTable from '../../components/PremiumTable/PremiumTable';
import DataTable from '../../components/ui/DataTable';

const { RangePicker } = DatePicker;

const categoryColors: Record<string, string> = {
  Fuel: 'volcano', Seeds: 'green', Fertilizer: 'blue',
  Pesticide: 'orange', Machinery: 'cyan', Labor: 'purple',
  Lease: 'gold', Other: 'default',
};

export default function CostRecords() {
  // Accept ?from=YYYY-MM-DD&to=YYYY-MM-DD for drill-down from the dashboard.
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFrom = searchParams.get('from');
  const initialTo = searchParams.get('to');
  const isIsoDate = (v: string | null): v is string => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);
  const initialRange: [string, string] | null =
    isIsoDate(initialFrom) && isIsoDate(initialTo) ? [initialFrom, initialTo] : null;

  const [result, setResult] = useState<PaginatedResult<CostRecordDto> | null>(null);
  const [summary, setSummary] = useState<CostSummaryDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<CostCategory | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(initialRange);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const isOnline = useOnlineStatus();
  const fmt = useFormatCurrency();

  const canCreate = hasRole(['CompanyAdmin', 'Manager', 'Accountant']);
  const canDelete = hasRole(['CompanyAdmin', 'Manager', 'Accountant']);

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

    Promise.all([paginated, summaryFetch])
      .catch(() => message.error(t.economics.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [category, dateRange, page, pageSize]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const date = values.date ? (values.date as { toISOString: () => string }).toISOString() : new Date().toISOString();
      const payload = { ...values, date };

      if (!isOnline) {
        await enqueueOperation({ method: 'POST', url: '/api/economics/cost-records', data: payload });
        message.info(t.offline.queued);
        form.resetFields();
        setModalOpen(false);
      } else {
        await createCostRecord(payload);
        message.success(t.economics.createSuccess);
        form.resetFields();
        setModalOpen(false);
        load();
      }
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

  const kpiItems: MaterialKpiItem[] = [
    { key: 'Fertilizers', label: t.materialKpi.fertilizers, amount: sumByCategory('Fertilizer'), icon: <ExperimentOutlined /> },
    { key: 'Seeds', label: t.materialKpi.seeds, amount: sumByCategory('Seeds'), icon: <AppstoreOutlined /> },
    { key: 'Pesticides', label: t.materialKpi.pesticides, amount: sumByCategory('Pesticide'), icon: <MedicineBoxOutlined /> },
    { key: 'Fuel', label: t.materialKpi.fuel, amount: sumByCategory('Fuel'), icon: <ThunderboltOutlined /> },
    { key: 'Lease', label: t.costCategories.Lease, amount: sumByCategory('Lease'), icon: <HomeOutlined /> },
    { key: 'Harvest', label: t.materialKpi.harvest, amount: 0, icon: <GiftOutlined /> },
    { key: 'Total', label: t.materialKpi.total, amount: summary?.totalAmount ?? 0, icon: <CalculatorOutlined />, isTotal: true },
  ];

  const columns = [
    {
      title: t.economics.date, dataIndex: 'date', key: 'date',
      sorter: (a: CostRecordDto, b: CostRecordDto) => new Date(a.date).getTime() - new Date(b.date).getTime(),
      render: (v: string) => formatDate(v),
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
        <DeleteConfirmButton
          title={t.fields.deleteField}
          description={t.fields.deleteCannotBeUndone}
          onConfirm={() => handleDelete(record.id)}
        />
      ) : null,
    },
  ];

  return (
    <div>
      <PageHeader title={t.economics.title} subtitle={t.economics.subtitle} breadcrumbs={<Breadcrumbs items={[{ label: t.nav.finance, path: '/expenses' }, { label: t.nav.costs }]} />} />

      <div style={{ marginBottom: 24 }}>
        <MaterialKpiCards items={kpiItems} loading={loading} />
      </div>

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          placeholder={t.economics.categoryFilter}
          allowClear
          style={{ width: 200 }}
          value={category}
          onChange={(val) => setCategory(val as CostCategory | undefined)}
          options={Object.entries(t.costCategories).map(([k, v]) => ({ value: k, label: v }))}
        />
        <RangePicker
          value={dateRange ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : null}
          onChange={(_, dateStrings) => {
            const next: [string, string] | null = dateStrings[0] && dateStrings[1] ? [dateStrings[0], dateStrings[1]] : null;
            setDateRange(next);
            // Keep the URL in sync so the filter is shareable and survives refresh.
            setSearchParams((prev) => {
              const p = new URLSearchParams(prev);
              if (next) { p.set('from', next[0]); p.set('to', next[1]); }
              else { p.delete('from'); p.delete('to'); }
              return p;
            }, { replace: true });
          }}
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
        <Button icon={<PrinterOutlined />} onClick={() => printReport(t.economics.title || 'Витрати', `<table><thead><tr><th>Дата</th><th>Категорія</th><th>Сума</th><th>Опис</th></tr></thead><tbody>${records.map(r => `<tr><td>${r.date}</td><td>${t.costCategories[r.category as keyof typeof t.costCategories] || r.category}</td><td>${r.amount}</td><td>${r.description || ''}</td></tr>`).join('')}</tbody></table>`)}>Друк</Button>
      </Space>

      {loading && !result ? (
        <TableSkeleton rows={10} />
      ) : (
        <PremiumTable
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
                <strong style={{ color: '#f5222d' }}>{fmt(totalAmount)}</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={2} />
              <Table.Summary.Cell index={3} />
            </Table.Summary.Row>
          )}
        />
      )}

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
