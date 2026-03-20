import { useEffect, useState } from 'react';
import {
  Table, Tag, Space, DatePicker, Select, message, Button, Modal, Form,
  Input, InputNumber, Popconfirm, Card, Statistic, Row, Col, Empty,
} from 'antd';
import {
  PlusOutlined, DeleteOutlined, EditOutlined,
  DollarOutlined, RiseOutlined, TeamOutlined, ShoppingCartOutlined,
} from '@ant-design/icons';
import { getSales, getSaleKpis, createSale, updateSale, deleteSale } from '../../api/sales';
import type { SaleDto, SaleKpiDto, CropType, PaymentStatus } from '../../types/sales';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { formatDate } from '../../utils/dateFormat';

const { RangePicker } = DatePicker;

const CROP_TYPES: CropType[] = ['Wheat', 'Barley', 'Corn', 'Sunflower', 'Soybean', 'Rapeseed', 'SugarBeet', 'Potato', 'Fallow', 'Other'];
const PAYMENT_STATUSES: PaymentStatus[] = ['Pending', 'Paid', 'PartiallyPaid', 'Cancelled'];

const paymentStatusColors: Record<PaymentStatus, string> = {
  Paid: 'success',
  Pending: 'warning',
  PartiallyPaid: 'processing',
  Cancelled: 'error',
};

export default function SalesPage() {
  const [result, setResult] = useState<PaginatedResult<SaleDto> | null>(null);
  const [kpis, setKpis] = useState<SaleKpiDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [buyerFilter, setBuyerFilter] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [paymentFilter, setPaymentFilter] = useState<PaymentStatus | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [modalOpen, setModalOpen] = useState(false);
  const [editSale, setEditSale] = useState<SaleDto | null>(null);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();

  const canWrite = hasRole(['Administrator', 'Manager', 'Director']);

  const load = (p = page, ps = pageSize) => {
    setLoading(true);
    const salesPromise = getSales({
      buyerName: buyerFilter,
      paymentStatus: paymentFilter,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
      page: p,
      pageSize: ps,
    }).then(setResult);

    const kpiPromise = getSaleKpis({
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
    }).then(setKpis);

    Promise.all([salesPromise, kpiPromise])
      .catch(() => message.error(t.sales.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [buyerFilter, paymentFilter, dateRange, page, pageSize]);

  const openCreate = () => {
    setEditSale(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (sale: SaleDto) => {
    setEditSale(sale);
    form.setFieldsValue({
      buyerName: sale.buyerName,
      contractNumber: sale.contractNumber,
      cropType: sale.cropType,
      quantityTons: sale.quantityTons,
      pricePerTon: sale.pricePerTon,
      paymentStatus: sale.paymentStatus,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const saleDate = values.saleDate
        ? (values.saleDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();

      if (editSale) {
        await updateSale(editSale.id, { id: editSale.id, ...values, saleDate });
        message.success(t.sales.updateSuccess);
      } else {
        await createSale({ ...values, saleDate });
        message.success(t.sales.createSuccess);
      }
      form.resetFields();
      setEditSale(null);
      setModalOpen(false);
      load();
    } catch {
      message.error(editSale ? t.sales.updateError : t.sales.createError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSale(id);
      message.success(t.sales.deleteSuccess);
      load();
    } catch {
      message.error(t.sales.deleteError);
    }
  };

  const cropTypeLabel = (ct: CropType) =>
    (t.cropTypes as Record<string, string>)[ct] ?? ct;

  const paymentStatusLabel = (ps: PaymentStatus) =>
    (t.paymentStatuses as Record<string, string>)[ps] ?? ps;

  const columns = [
    {
      title: t.sales.buyer,
      dataIndex: 'buyerName',
      key: 'buyerName',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: t.sales.contractNumber,
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (v?: string) => v ?? '—',
    },
    {
      title: t.sales.cropType,
      dataIndex: 'cropType',
      key: 'cropType',
      render: (v: CropType) => <Tag color="green">{cropTypeLabel(v)}</Tag>,
    },
    {
      title: t.sales.quantityTons,
      dataIndex: 'quantityTons',
      key: 'quantityTons',
      render: (v: number) => `${v.toFixed(2)} т`,
    },
    {
      title: t.sales.pricePerTon,
      dataIndex: 'pricePerTon',
      key: 'pricePerTon',
      render: (v: number) => `${v.toLocaleString()} UAH`,
    },
    {
      title: t.sales.totalAmount,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number) => (
        <span style={{ fontWeight: 600, color: 'var(--accent)' }}>
          {v.toLocaleString()} UAH
        </span>
      ),
    },
    {
      title: t.sales.saleDate,
      dataIndex: 'saleDate',
      key: 'saleDate',
      render: (v: string) => formatDate(v),
    },
    {
      title: t.sales.paymentStatus,
      dataIndex: 'paymentStatus',
      key: 'paymentStatus',
      render: (v: PaymentStatus) => (
        <Tag color={paymentStatusColors[v]}>{paymentStatusLabel(v)}</Tag>
      ),
    },
    ...(canWrite ? [{
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, record: SaleDto) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            size="small"
            onClick={() => openEdit(record)}
            style={{ color: 'var(--text-secondary)' }}
          />
          <Popconfirm
            title={t.sales.deleteConfirm}
            onConfirm={() => handleDelete(record.id)}
            okText={t.common.yes}
            cancelText={t.common.no}
          >
            <Button
              type="text"
              icon={<DeleteOutlined />}
              size="small"
              danger
            />
          </Popconfirm>
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <PageHeader
        title={t.sales.title}
        subtitle={t.sales.subtitle}
        actions={canWrite ? (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
            {t.sales.addSale}
          </Button>
        ) : undefined}
      />

      {/* KPI Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t.sales.kpiRevenue}</span>}
              value={kpis?.totalRevenue ?? 0}
              precision={0}
              suffix="UAH"
              prefix={<DollarOutlined style={{ color: '#2ea043' }} />}
              valueStyle={{ color: '#2ea043', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t.sales.kpiAvgPrice}</span>}
              value={kpis?.averagePricePerTon ?? 0}
              precision={0}
              suffix="UAH/т"
              prefix={<RiseOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff', fontSize: 18 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t.sales.kpiTopBuyer}</span>}
              value={kpis?.topBuyer ?? '—'}
              prefix={<TeamOutlined style={{ color: '#fa8c16' }} />}
              valueStyle={{ color: '#fa8c16', fontSize: 16 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card size="small" style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)' }}>
            <Statistic
              title={<span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>{t.sales.kpiTotalQty}</span>}
              value={kpis?.totalQuantityTons ?? 0}
              precision={2}
              suffix="т"
              prefix={<ShoppingCartOutlined style={{ color: '#722ed1' }} />}
              valueStyle={{ color: '#722ed1', fontSize: 18 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Input.Search
          placeholder={t.sales.searchBuyer}
          allowClear
          style={{ width: 220 }}
          onSearch={(v) => { setBuyerFilter(v || undefined); setPage(1); }}
        />
        <Select
          allowClear
          placeholder={t.sales.filterPaymentStatus}
          style={{ width: 180 }}
          value={paymentFilter}
          onChange={(v) => { setPaymentFilter(v); setPage(1); }}
          options={PAYMENT_STATUSES.map(s => ({
            value: s,
            label: paymentStatusLabel(s),
          }))}
        />
        <RangePicker
          onChange={(_, strs) => {
            setDateRange(strs[0] && strs[1] ? [strs[0], strs[1]] : null);
            setPage(1);
          }}
          style={{ width: 240 }}
        />
      </div>

      {/* Table */}
      {result?.items?.length === 0 && !loading ? (
        <Empty description={t.sales.noData} style={{ margin: '40px 0' }} />
      ) : (
        <Table
          dataSource={result?.items ?? []}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total: result?.totalCount ?? 0,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            showSizeChanger: true,
            showTotal: (total) => `${total} ${t.sales.salesCount}`,
          }}
          scroll={{ x: 900 }}
          style={{ background: 'var(--bg-surface)' }}
        />
      )}

      {/* Create/Edit Modal */}
      <Modal
        title={editSale ? t.sales.editSale : t.sales.addSale}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); setEditSale(null); form.resetFields(); }}
        confirmLoading={saving}
        okText={editSale ? t.common.save : t.common.create}
        cancelText={t.common.cancel}
        width={520}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="buyerName"
            label={t.sales.buyer}
            rules={[{ required: true, message: t.sales.buyerRequired }]}
          >
            <Input placeholder={t.sales.buyerPlaceholder} maxLength={200} />
          </Form.Item>
          <Form.Item name="contractNumber" label={t.sales.contractNumber}>
            <Input placeholder={t.sales.contractPlaceholder} maxLength={100} />
          </Form.Item>
          <Form.Item
            name="cropType"
            label={t.sales.cropType}
            rules={[{ required: true }]}
          >
            <Select
              options={CROP_TYPES.map(ct => ({ value: ct, label: cropTypeLabel(ct) }))}
              placeholder={t.sales.selectCropType}
            />
          </Form.Item>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="quantityTons"
                label={t.sales.quantityTons}
                rules={[{ required: true }, { type: 'number', min: 0.001 }]}
              >
                <InputNumber style={{ width: '100%' }} min={0.001} precision={4} placeholder="0.00" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="pricePerTon"
                label={t.sales.pricePerTon}
                rules={[{ required: true }, { type: 'number', min: 0 }]}
              >
                <InputNumber style={{ width: '100%' }} min={0} precision={2} placeholder="0.00" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={12}>
            <Col span={12}>
              <Form.Item
                name="saleDate"
                label={t.sales.saleDate}
                rules={[{ required: true }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="paymentStatus"
                label={t.sales.paymentStatus}
                rules={[{ required: true }]}
                initialValue="Pending"
              >
                <Select
                  options={PAYMENT_STATUSES.map(s => ({ value: s, label: paymentStatusLabel(s) }))}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
}
