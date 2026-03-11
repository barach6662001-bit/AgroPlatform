import { useEffect, useState } from 'react';
import { Table, Select, Space, message, Tag, Button, Modal, Form, InputNumber, DatePicker, Input } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import { getBalances, getWarehouses, getWarehouseItems, createReceipt, createIssue, createWarehouseItem, createTransfer, updateWarehouseItem } from '../../api/warehouses';
import type { BalanceDto, WarehouseDto, WarehouseItemDto } from '../../types/warehouse';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

export default function WarehouseItems() {
  const [searchParams] = useSearchParams();
  const initialWarehouse = searchParams.get('warehouse') ?? undefined;

  const [result, setResult] = useState<PaginatedResult<BalanceDto> | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [items, setItems] = useState<WarehouseItemDto[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>(initialWarehouse);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [receiptForm] = Form.useForm();
  const [issueForm] = Form.useForm();
  const [createItemForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [editItemRecord, setEditItemRecord] = useState<WarehouseItemDto | null>(null);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItemSaving, setEditItemSaving] = useState(false);
  const [editItemForm] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();

  const canManageItems = hasRole(['Administrator', 'Manager', 'Storekeeper']);

  const loadBalances = (warehouseId?: string, p = page, ps = pageSize) => {
    setLoading(true);
    const params = warehouseId
      ? { warehouseId, page: p, pageSize: ps }
      : { page: p, pageSize: ps };
    getBalances(params)
      .then(setResult)
      .catch(() => message.error(t.warehouses.loadDataError))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    Promise.all([
      getWarehouses({ page: 1, pageSize: 100 }),
      getWarehouseItems({ page: 1, pageSize: 100 }),
    ])
      .then(([wh, wi]) => {
        setWarehouses(wh.items);
        setItems(wi.items);
      })
      .catch(() => message.error(t.warehouses.loadDataError));
    loadBalances(initialWarehouse);
  }, []);

  useEffect(() => { loadBalances(selectedWarehouse, page, pageSize); }, [page, pageSize]);

  const handleWarehouseChange = (val: string | undefined) => {
    setSelectedWarehouse(val);
    setPage(1);
    loadBalances(val, 1, pageSize);
  };

  const handleReceipt = async () => {
    try {
      const values = await receiptForm.validateFields();
      setSaving(true);
      const selectedItem = items.find((i) => i.id === values.itemId);
      const unitCode = selectedItem?.baseUnit ?? 'kg';
      await createReceipt({
        warehouseId: values.warehouseId,
        itemId: values.itemId,
        unitCode,
        quantity: values.quantity,
        note: values.notes,
      });
      message.success(t.warehouses.receiptSuccess);
      receiptForm.resetFields();
      setReceiptOpen(false);
      loadBalances(selectedWarehouse, page, pageSize);
    } catch {
      message.error(t.warehouses.receiptError);
    } finally {
      setSaving(false);
    }
  };

  const handleIssue = async () => {
    try {
      const values = await issueForm.validateFields();
      setSaving(true);
      const selectedItem = items.find((i) => i.id === values.itemId);
      const unitCode = selectedItem?.baseUnit ?? 'kg';
      await createIssue({
        warehouseId: values.warehouseId,
        itemId: values.itemId,
        unitCode,
        quantity: values.quantity,
        note: values.notes,
      });
      message.success(t.warehouses.issueSuccess);
      issueForm.resetFields();
      setIssueOpen(false);
      loadBalances(selectedWarehouse, page, pageSize);
    } catch {
      message.error(t.warehouses.issueError);
    } finally {
      setSaving(false);
    }
  };

  const handleTransfer = async () => {
    try {
      const values = await transferForm.validateFields();
      setSaving(true);
      const selectedItem = items.find((i) => i.id === values.itemId);
      const unitCode = selectedItem?.baseUnit ?? 'kg';
      await createTransfer({
        sourceWarehouseId: values.sourceWarehouseId,
        destinationWarehouseId: values.destinationWarehouseId,
        itemId: values.itemId,
        unitCode,
        quantity: values.quantity,
        note: values.note,
      });
      message.success(t.warehouses.transferSuccess);
      transferForm.resetFields();
      setTransferOpen(false);
      loadBalances(selectedWarehouse, page, pageSize);
    } catch {
      message.error(t.warehouses.transferError);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async () => {
    try {
      const values = await createItemForm.validateFields();
      setSaving(true);
      await createWarehouseItem(values);
      message.success(t.warehouses.createItemSuccess);
      createItemForm.resetFields();
      setCreateItemOpen(false);
      const wi = await getWarehouseItems({ page: 1, pageSize: 100 });
      setItems(wi.items);
    } catch {
      message.error(t.warehouses.createItemError);
    } finally {
      setSaving(false);
    }
  };

  const handleEditItem = async () => {
    if (!editItemRecord) return;
    try {
      const values = await editItemForm.validateFields();
      setEditItemSaving(true);
      await updateWarehouseItem(editItemRecord.id, values);
      message.success(t.warehouses.updateItemSuccess);
      editItemForm.resetFields();
      setEditItemOpen(false);
      setEditItemRecord(null);
      const wi = await getWarehouseItems({ page: 1, pageSize: 100 });
      setItems(wi.items);
    } catch {
      message.error(t.warehouses.updateItemError);
    } finally {
      setEditItemSaving(false);
    }
  };

  const warehouseOptions = warehouses.map((w) => ({ value: w.id, label: w.name }));
  const itemOptions = items.map((i) => ({ value: i.id, label: `${i.name} (${i.code})` }));

  const columns = [
    { title: t.warehouses.warehouse, dataIndex: 'warehouseName', key: 'warehouseName', sorter: (a: BalanceDto, b: BalanceDto) => a.warehouseName.localeCompare(b.warehouseName) },
    { title: t.warehouses.item, dataIndex: 'itemName', key: 'itemName', sorter: (a: BalanceDto, b: BalanceDto) => a.itemName.localeCompare(b.itemName) },
    { title: t.warehouses.code, dataIndex: 'itemCode', key: 'itemCode' },
    { title: t.warehouses.batch, dataIndex: 'batchCode', key: 'batchCode', render: (v: string) => v ? <Tag>{v}</Tag> : '—' },
    {
      title: t.warehouses.balance, key: 'balance',
      render: (_: unknown, r: BalanceDto) => (
        <span>
          <strong style={{ color: r.balanceBase > 0 ? '#52c41a' : '#f5222d' }}>
            {r.balanceBase.toFixed(2)}
          </strong>
          {' '}{r.baseUnit}
        </span>
      ),
    },
    {
      title: t.warehouses.updated, dataIndex: 'lastUpdatedUtc', key: 'lastUpdatedUtc',
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: BalanceDto) => {
        const item = items.find((i) => i.id === record.itemId);
        return canManageItems && item ? (
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setEditItemRecord(item);
              editItemForm.setFieldsValue(item);
              setEditItemOpen(true);
            }}
          >
            {t.warehouses.editItem}
          </Button>
        ) : null;
      },
    },
  ];

  const MovementForm = () => (
    <>
      <Form.Item name="warehouseId" label={t.warehouses.warehouse} rules={[{ required: true, message: t.common.required }]}>
        <Select options={warehouseOptions} placeholder={t.warehouses.selectWarehouse} />
      </Form.Item>
      <Form.Item name="itemId" label={t.warehouses.item} rules={[{ required: true, message: t.common.required }]}>
        <Select options={itemOptions} placeholder={t.warehouses.selectItem} showSearch optionFilterProp="label" />
      </Form.Item>
      <Form.Item name="quantity" label={t.warehouses.quantity} rules={[{ required: true, message: t.common.required }]}>
        <InputNumber min={0.001} step={0.001} style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="date" label={t.common.date} rules={[{ required: true, message: t.common.required }]}>
        <DatePicker style={{ width: '100%' }} />
      </Form.Item>
      <Form.Item name="notes" label={t.common.notes}>
        <Input />
      </Form.Item>
    </>
  );

  return (
    <div>
      <PageHeader title={t.warehouses.itemsTitle} subtitle={t.warehouses.itemsSubtitle} />
      <Space style={{ marginBottom: 16 }}>
        <Select
          placeholder={t.warehouses.allWarehouses}
          allowClear
          style={{ width: 240 }}
          options={warehouseOptions}
          onChange={handleWarehouseChange}
          value={selectedWarehouse}
        />
        <Button icon={<PlusOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }} onClick={() => setReceiptOpen(true)}>
          {t.warehouses.receipt}
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => setIssueOpen(true)}>
          {t.warehouses.issue}
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => setCreateItemOpen(true)}>
          {t.warehouses.createItem}
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => setTransferOpen(true)}>
          {t.warehouses.transfer}
        </Button>
      </Space>
      <Table
        dataSource={result?.items ?? []}
        columns={columns}
        rowKey={(r) => `${r.warehouseId}-${r.itemId}-${r.batchId ?? ''}`}
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: result?.totalCount ?? 0,
          showTotal: (total) => t.warehouses.totalItems.replace('{{count}}', String(total)),
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      {/* Receipt Modal */}
      <Modal
        title={t.warehouses.receipt}
        open={receiptOpen}
        onOk={handleReceipt}
        onCancel={() => { setReceiptOpen(false); receiptForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={receiptForm} layout="vertical" style={{ marginTop: 16 }}>
          <MovementForm />
          <Form.Item name="batchCode" label={t.warehouses.batchCode}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Issue Modal */}
      <Modal
        title={t.warehouses.issue}
        open={issueOpen}
        onOk={handleIssue}
        onCancel={() => { setIssueOpen(false); issueForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={issueForm} layout="vertical" style={{ marginTop: 16 }}>
          <MovementForm />
        </Form>
      </Modal>
      {/* Create Item Modal */}
      <Modal
        title={t.warehouses.createItem}
        open={createItemOpen}
        onOk={handleCreateItem}
        onCancel={() => { setCreateItemOpen(false); createItemForm.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={createItemForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t.warehouses.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t.warehouses.code} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label={t.warehouses.category} rules={[{ required: true, message: t.common.required }]}>
            <Select options={[
              { value: 'Seeds', label: t.warehouses.categorySeeds },
              { value: 'Fertilizers', label: t.warehouses.categoryFertilizers },
              { value: 'Fuel', label: t.warehouses.categoryFuel },
              { value: 'Pesticides', label: t.warehouses.categoryPesticides },
              { value: 'Other', label: t.warehouses.categoryOther },
            ]} />
          </Form.Item>
          <Form.Item name="baseUnit" label={t.warehouses.baseUnit} rules={[{ required: true, message: t.common.required }]}>
            <Select options={[
              { value: 'kg', label: 'kg' },
              { value: 'l', label: 'l' },
              { value: 't', label: 't' },
              { value: 'pcs', label: 'pcs' },
            ]} />
          </Form.Item>
          <Form.Item name="description" label={t.warehouses.description}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
      {/* Transfer Modal */}
      <Modal
        title={t.warehouses.transferTitle}
        open={transferOpen}
        onOk={handleTransfer}
        onCancel={() => { setTransferOpen(false); transferForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={transferForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="sourceWarehouseId" label={t.warehouses.fromWarehouse} rules={[{ required: true, message: t.common.required }]}>
            <Select options={warehouseOptions} placeholder={t.warehouses.selectWarehouse} />
          </Form.Item>
          <Form.Item name="destinationWarehouseId" label={t.warehouses.toWarehouse} rules={[{ required: true, message: t.common.required }]}>
            <Select options={warehouseOptions} placeholder={t.warehouses.selectWarehouse} />
          </Form.Item>
          <Form.Item name="itemId" label={t.warehouses.item} rules={[{ required: true, message: t.common.required }]}>
            <Select options={itemOptions} placeholder={t.warehouses.selectItem} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item name="quantity" label={t.warehouses.quantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.001} step={0.001} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label={t.common.notes}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        title={t.warehouses.editItem}
        open={editItemOpen}
        onOk={handleEditItem}
        onCancel={() => { editItemForm.resetFields(); setEditItemOpen(false); setEditItemRecord(null); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={editItemSaving}
      >
        <Form form={editItemForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t.warehouses.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t.warehouses.code} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label={t.warehouses.category} rules={[{ required: true, message: t.common.required }]}>
            <Select options={[
              { value: 'Seeds', label: t.warehouses.categorySeeds },
              { value: 'Fertilizers', label: t.warehouses.categoryFertilizers },
              { value: 'Fuel', label: t.warehouses.categoryFuel },
              { value: 'Pesticides', label: t.warehouses.categoryPesticides },
              { value: 'Other', label: t.warehouses.categoryOther },
            ]} />
          </Form.Item>
          <Form.Item name="baseUnit" label={t.warehouses.baseUnit} rules={[{ required: true, message: t.common.required }]}>
            <Select options={[
              { value: 'kg', label: 'kg' },
              { value: 'l', label: 'l' },
              { value: 't', label: 't' },
              { value: 'pcs', label: 'pcs' },
            ]} />
          </Form.Item>
          <Form.Item name="description" label={t.warehouses.description}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
