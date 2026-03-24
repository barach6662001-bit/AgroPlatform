import { useEffect, useState } from 'react';
import { Table, Space, DatePicker, message, Button, Modal, Form, Input, InputNumber, Select, Card, Statistic, Row, Col } from 'antd';
import { PlusOutlined, EditOutlined, ShoppingOutlined, DollarOutlined } from '@ant-design/icons';
import { getSales, createSale, updateSale, deleteSale } from '../../api/sales';
import { getFields } from '../../api/fields';
import type { SaleDto } from '../../types/sales';
import type { FieldDto } from '../../types/field';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import TableSkeleton from '../../components/TableSkeleton';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { formatDate } from '../../utils/dateFormat';

const { RangePicker } = DatePicker;

const UNITS = ['т', 'кг', 'л', 'шт'];

export default function SalesList() {
  const [result, setResult] = useState<PaginatedResult<SaleDto> | null>(null);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState<string | undefined>();
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const [editRecord, setEditRecord] = useState<SaleDto | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm] = Form.useForm();

  const { t } = useTranslation();
  const { hasRole } = useRole();

  const canWrite = hasRole(['Administrator', 'Manager', 'Director']);

  const load = (p = page, ps = pageSize) => {
    setLoading(true);
    getSales({
      buyerName: search || undefined,
      dateFrom: dateRange?.[0],
      dateTo: dateRange?.[1],
      page: p,
      pageSize: ps,
    })
      .then(setResult)
      .catch(() => message.error(t.sales.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, dateRange, page, pageSize]);

  useEffect(() => {
    getFields({ pageSize: 200 }).then((r) => setFields(r.items)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const date = values.date ? (values.date as { toISOString: () => string }).toISOString() : new Date().toISOString();
      await createSale({ ...values, date });
      message.success(t.sales.createSuccess);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch {
      message.error(t.sales.createError);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editRecord) return;
    try {
      const values = await editForm.validateFields();
      setEditSaving(true);
      const date = values.date ? (values.date as { toISOString: () => string }).toISOString() : editRecord.date;
      await updateSale(editRecord.id, { ...values, date, id: editRecord.id });
      message.success(t.sales.updateSuccess);
      editForm.resetFields();
      setEditModalOpen(false);
      setEditRecord(null);
      load();
    } catch {
      message.error(t.sales.updateError);
    } finally {
      setEditSaving(false);
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

  const totalQuantity = result?.items.reduce((sum, s) => sum + s.quantity, 0) ?? 0;
  const totalCount = result?.totalCount ?? 0;

  const columns = [
    {
      title: t.sales.date,
      dataIndex: 'date',
      key: 'date',
      render: (v: string) => formatDate(v),
      sorter: (a: SaleDto, b: SaleDto) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: t.sales.buyerName,
      dataIndex: 'buyerName',
      key: 'buyerName',
    },
    {
      title: t.sales.product,
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: t.sales.quantity,
      key: 'quantity',
      render: (_: unknown, r: SaleDto) => `${r.quantity} ${r.unit}`,
    },
    {
      title: t.sales.pricePerUnit,
      dataIndex: 'pricePerUnit',
      key: 'pricePerUnit',
      render: (v: number, r: SaleDto) => `${v.toLocaleString()} ${r.currency}`,
    },
    {
      title: t.sales.totalAmount,
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (v: number, r: SaleDto) => `${v.toLocaleString()} ${r.currency}`,
      sorter: (a: SaleDto, b: SaleDto) => a.totalAmount - b.totalAmount,
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, record: SaleDto) => (
        <Space>
          {canWrite && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => {
                setEditRecord(record);
                editForm.setFieldsValue({
                  ...record,
                  date: undefined,
                });
                setEditModalOpen(true);
              }}
            />
          )}
          {canWrite && (
            <DeleteConfirmButton
              title={t.sales.deleteConfirm}
              onConfirm={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  const formItems = (
    <>
      <Form.Item name="date" label={t.sales.date} rules={[{ required: true, message: t.common.required }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="buyerName" label={t.sales.buyerName} rules={[{ required: true, message: t.common.required }]}>
        <Input />
      </Form.Item>
      <Form.Item name="product" label={t.sales.product} rules={[{ required: true, message: t.common.required }]}>
        <Input />
      </Form.Item>
      <Form.Item name="quantity" label={t.sales.quantity} rules={[{ required: true, message: t.common.required }]}>
        <InputNumber min={0} step={0.01} precision={4} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="unit" label={t.sales.unit} initialValue="т">
        <Select options={UNITS.map((u) => ({ value: u, label: u }))} />
      </Form.Item>
      <Form.Item name="pricePerUnit" label={t.sales.pricePerUnit} rules={[{ required: true, message: t.common.required }]}>
        <InputNumber min={0} step={0.01} precision={2} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="currency" label={t.sales.currency} initialValue="UAH">
        <Select options={[{ value: 'UAH', label: 'UAH' }, { value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }]} />
      </Form.Item>
      <Form.Item name="fieldId" label={t.sales.field}>
        <Select
          allowClear
          showSearch
          optionFilterProp="label"
          options={fields.map((f) => ({ value: f.id, label: f.name }))}
        />
      </Form.Item>
      <Form.Item name="notes" label={t.sales.notes}>
        <Input.TextArea rows={2} />
      </Form.Item>
    </>
  );

  return (
    <div>
      <PageHeader title={t.sales.title} subtitle={t.sales.subtitle} />

      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title={t.sales.totalSales}
              value={totalCount}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8}>
          <Card size="small">
            <Statistic
              title={t.sales.totalQuantity}
              value={totalQuantity}
              precision={2}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Space style={{ marginBottom: 16 }} wrap>
        <Input
          placeholder={t.sales.searchBuyer}
          value={search}
          onChange={(e) => { setSearch(e.target.value || undefined); setPage(1); }}
          style={{ width: 240 }}
          allowClear
        />
        <RangePicker
          onChange={(_, dates) => {
            setDateRange(dates[0] && dates[1] ? [dates[0], dates[1]] : null);
            setPage(1);
          }}
        />
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t.sales.addSale}
          </Button>
        )}
      </Space>

      {loading && !result ? (
        <TableSkeleton rows={8} />
      ) : (
        <Table
          dataSource={result?.items ?? []}
          columns={columns}
          rowKey="id"
          loading={loading}
          locale={{ emptyText: t.sales.noData }}
          pagination={{
            current: page,
            pageSize,
            total: result?.totalCount ?? 0,
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
            showSizeChanger: true,
          }}
        />
      )}

      <Modal
        title={t.sales.createSale}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          {formItems}
        </Form>
      </Modal>

      <Modal
        title={t.sales.editSale}
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); setEditRecord(null); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={editSaving}
      >
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          {formItems}
        </Form>
      </Modal>
    </div>
  );
}
