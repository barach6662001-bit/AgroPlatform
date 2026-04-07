import EmptyState from '../../components/EmptyState';
import { useEffect, useState } from 'react';
import { Table, Select, Space, message, Tag, Button, Modal, Form, InputNumber, DatePicker, Input, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../../api/axios';
import { getBalances, getWarehouses, getWarehouseItems, createReceipt, createIssue, createWarehouseItem, createTransfer, updateWarehouseItem, getItemCategories } from '../../api/warehouses';
import { getFields } from '../../api/fields';
import type { BalanceDto, WarehouseDto, WarehouseItemDto, ItemCategoryDto } from '../../types/warehouse';
import type { FieldDto } from '../../types/field';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { formatDate } from '../../utils/dateFormat';
import s from './WarehouseItems.module.css';

export default function WarehouseItems() {
  const [searchParams] = useSearchParams();
  const initialWarehouse = searchParams.get('warehouse') ?? undefined;

  const [result, setResult] = useState<PaginatedResult<BalanceDto> | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [items, setItems] = useState<WarehouseItemDto[]>([]);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [categories, setCategories] = useState<ItemCategoryDto[]>([]);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>(initialWarehouse);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [createItemOpen, setCreateItemOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [receiptForm] = Form.useForm();
  const [issueForm] = Form.useForm();
  const [createItemForm] = Form.useForm();
  const [transferForm] = Form.useForm();
  const [editItemRecord, setEditItemRecord] = useState<WarehouseItemDto | null>(null);
  const [editItemOpen, setEditItemOpen] = useState(false);
  const [editItemSaving, setEditItemSaving] = useState(false);
  const [editItemForm] = Form.useForm();
  const { t } = useTranslation();
  const { hasPermission } = useRole();

  const canManageItems = hasPermission('inventory', 'manage');

  // Helper: find total available balance for a given warehouse + item
  const getAvailableBalance = (warehouseId?: string, itemId?: string): number => {
    if (!warehouseId || !itemId || !result?.items) return 0;
    return result.items
      .filter((b) => b.warehouseId === warehouseId && b.itemId === itemId)
      .reduce((sum, b) => sum + b.balanceBase, 0);
  };

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

  useEffect(() => {
    getFields({ pageSize: 200 }).then((r) => setFields(r.items)).catch(() => {});
    getItemCategories().then(setCategories).catch(() => {});
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
        pricePerUnit: values.pricePerUnit,
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
        fieldId: values.fieldId,
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
          <strong style={{ color: r.balanceBase > 0 ? 'var(--success)' : 'var(--error)' }}>
            {r.balanceBase.toFixed(2)}
          </strong>
          {' '}{r.baseUnit}
        </span>
      ),
    },
    {
      title: t.warehouses.updated, dataIndex: 'lastUpdatedUtc', key: 'lastUpdatedUtc',
      render: (v: string) => formatDate(v),
    },
    {
      title: t.warehouses.purchasePrice,
      key: 'purchasePrice',
      render: (_: unknown, record: BalanceDto) => {
        const item = items.find((i) => i.id === record.itemId);
        return item?.purchasePrice != null ? `${item.purchasePrice.toFixed(2)} UAH` : '—';
      },
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


  const handleExportBalances = async () => {
    setExporting(true);
    try {
      const resp = await apiClient.get('/api/warehouses/balances/export', {
        params: { warehouseId: selectedWarehouse },
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `stock-balances-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error(t.warehouses.loadDataError);
    } finally {
      setExporting(false);
    }
  };

    const MovementForm = () => (
    <>
      <Form.Item name="warehouseId" label={t.warehouses.warehouse} rules={[{ required: true, message: t.common.required }]}>
        <Select options={warehouseOptions} placeholder={t.warehouses.selectWarehouse} />
      </Form.Item>
      <Form.Item name="itemId" label={t.warehouses.item} rules={[{ required: true, message: t.common.required }]}>
        <Select options={itemOptions} placeholder={t.warehouses.selectItem} showSearch optionFilterProp="label" />
      </Form.Item>
      <Form.Item name="quantity" label={t.warehouses.quantity} rules={[{ required: true, message: t.common.required }]}>
        <InputNumber min={0.001} step={0.001} className={s.fullWidth} />
      </Form.Item>
      <Form.Item name="date" label={t.common.date} rules={[{ required: true, message: t.common.required }]}>
        <DatePicker className={s.fullWidth} />
      </Form.Item>
      <Form.Item name="notes" label={t.common.notes}>
        <Input />
      </Form.Item>
    </>
  );

  return (
    <div>
      <PageHeader
        title={t.warehouses.itemsTitle}
        subtitle={t.warehouses.itemsSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.warehouses, path: '/warehouses' }, { label: t.nav.materials }]} />}
      />
      <Space className={s.spaced}>
        <Select
          placeholder={t.warehouses.allWarehouses}
          allowClear
          className={s.block4}
          options={warehouseOptions}
          onChange={handleWarehouseChange}
          value={selectedWarehouse}
        />
        {canManageItems && (
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setReceiptOpen(true)}>
            {t.warehouses.receipt}
          </Button>
        )}
        {canManageItems && (
          <Button icon={<PlusOutlined />} onClick={() => setIssueOpen(true)}>
            {t.warehouses.issue}
          </Button>
        )}
        {canManageItems && (
          <Button icon={<PlusOutlined />} onClick={() => setCreateItemOpen(true)}>
            {t.warehouses.createItem}
          </Button>
        )}
        {canManageItems && (
          <Button icon={<PlusOutlined />} onClick={() => setTransferOpen(true)}>
            {t.warehouses.transfer}
          </Button>
        )}
        <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExportBalances}>
          {t.warehouses_export.exportBalances}
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
        locale={{
          emptyText: <EmptyState
            message={t.warehouses.noBalances || 'Складські залишки відсутні. Створіть товар і запишіть прихід'}
            actionLabel={canManageItems ? t.warehouses.receipt : undefined}
            onAction={canManageItems ? () => setReceiptOpen(true) : undefined}
          />,
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
        <Form form={receiptForm} layout="vertical" className={s.spaced1}>
          <MovementForm />
          <Form.Item name="pricePerUnit" label={t.warehouses.pricePerUnit}>
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              addonAfter="UAH"
              className={s.fullWidth}
              onChange={(val) => {
                const qty = receiptForm.getFieldValue('quantity');
                if (val && qty) {
                  message.info(`${t.warehouses.totalCost}: ${(Number(val) * Number(qty)).toFixed(2)} UAH`);
                }
              }}
            />
          </Form.Item>
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
        <Form form={issueForm} layout="vertical" className={s.spaced1}
          onValuesChange={() => issueForm.getFieldValue('warehouseId') && issueForm.getFieldValue('itemId') && issueForm.validateFields(['quantity']).catch(() => {})}
        >
          <Form.Item name="warehouseId" label={t.warehouses.warehouse} rules={[{ required: true, message: t.common.required }]}>
            <Select options={warehouseOptions} placeholder={t.warehouses.selectWarehouse} />
          </Form.Item>
          <Form.Item name="itemId" label={t.warehouses.item} rules={[{ required: true, message: t.common.required }]}>
            <Select options={itemOptions} placeholder={t.warehouses.selectItem} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item noStyle dependencies={['warehouseId', 'itemId']}>
            {({ getFieldValue }) => {
              const wh = getFieldValue('warehouseId');
              const item = getFieldValue('itemId');
              const avail = getAvailableBalance(wh, item);
              const selectedItem = items.find((i) => i.id === item);
              const unit = selectedItem?.baseUnit ?? '';
              return wh && item ? (
                <Alert
                  type={avail > 0 ? 'info' : 'warning'}
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={`${t.warehouses.availableStock}: ${avail.toFixed(2)} ${unit}`}
                />
              ) : null;
            }}
          </Form.Item>
          <Form.Item name="quantity" label={t.warehouses.quantity}
            dependencies={['warehouseId', 'itemId']}
            rules={[
              { required: true, message: t.common.required },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const avail = getAvailableBalance(getFieldValue('warehouseId'), getFieldValue('itemId'));
                  if (value && avail > 0 && value > avail) return Promise.reject(t.warehouses.exceedsAvailable);
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={0.001} step={0.001} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="date" label={t.common.date} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input />
          </Form.Item>
          <Form.Item name="fieldId" label={t.warehouses.field || 'Поле'}>
            <Select
              allowClear
              showSearch
              placeholder={t.warehouses.selectField || 'Оберіть поле (опціонально)'}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={fields.map(f => ({
                value: f.id,
                label: `${f.name} (${f.areaHectares} га)`,
              }))}
            />
          </Form.Item>
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
        <Form form={createItemForm} layout="vertical" className={s.spaced1}>
          <Form.Item name="name" label={t.warehouses.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t.warehouses.code} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label={t.warehouses.category} rules={[{ required: true, message: t.common.required }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={categories.map(c => ({ value: c.name, label: c.name }))}
              placeholder={t.warehouses.selectCategory}
            />
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
          <Form.Item name="minimumQuantity" label={t.warehouses.minimumQuantity}>
            <InputNumber min={0} step={0.001} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="purchasePrice" label={t.warehouses.purchasePrice}>
            <InputNumber min={0} precision={4} className={s.fullWidth} addonAfter="UAH" />
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
        <Form form={transferForm} layout="vertical" className={s.spaced1}>
          <Form.Item name="sourceWarehouseId" label={t.warehouses.fromWarehouse} rules={[{ required: true, message: t.common.required }]}>
            <Select options={warehouseOptions} placeholder={t.warehouses.selectWarehouse} />
          </Form.Item>
          <Form.Item name="destinationWarehouseId" label={t.warehouses.toWarehouse} rules={[{ required: true, message: t.common.required }]}>
            <Select options={warehouseOptions} placeholder={t.warehouses.selectWarehouse} />
          </Form.Item>
          <Form.Item name="itemId" label={t.warehouses.item} rules={[{ required: true, message: t.common.required }]}>
            <Select options={itemOptions} placeholder={t.warehouses.selectItem} showSearch optionFilterProp="label" />
          </Form.Item>
          <Form.Item noStyle dependencies={['sourceWarehouseId', 'itemId']}>
            {({ getFieldValue }) => {
              const wh = getFieldValue('sourceWarehouseId');
              const item = getFieldValue('itemId');
              const avail = getAvailableBalance(wh, item);
              const selectedItem = items.find((i) => i.id === item);
              const unit = selectedItem?.baseUnit ?? '';
              return wh && item ? (
                <Alert
                  type={avail > 0 ? 'info' : 'warning'}
                  showIcon
                  style={{ marginBottom: 16 }}
                  message={`${t.warehouses.availableStock}: ${avail.toFixed(2)} ${unit}`}
                />
              ) : null;
            }}
          </Form.Item>
          <Form.Item name="quantity" label={t.warehouses.quantity}
            dependencies={['sourceWarehouseId', 'itemId']}
            rules={[
              { required: true, message: t.common.required },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  const avail = getAvailableBalance(getFieldValue('sourceWarehouseId'), getFieldValue('itemId'));
                  if (value && avail > 0 && value > avail) return Promise.reject(t.warehouses.exceedsAvailable);
                  return Promise.resolve();
                },
              }),
            ]}
          >
            <InputNumber min={0.001} step={0.001} className={s.fullWidth} />
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
        <Form form={editItemForm} layout="vertical" className={s.spaced1}>
          <Form.Item name="name" label={t.warehouses.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label={t.warehouses.code} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="category" label={t.warehouses.category} rules={[{ required: true, message: t.common.required }]}>
            <Select
              showSearch
              optionFilterProp="label"
              options={categories.map(c => ({ value: c.name, label: c.name }))}
              placeholder={t.warehouses.selectCategory}
            />
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
          <Form.Item name="minimumQuantity" label={t.warehouses.minimumQuantity}>
            <InputNumber min={0} step={0.001} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="purchasePrice" label={t.warehouses.purchasePrice}>
            <InputNumber min={0} precision={4} className={s.fullWidth} addonAfter="UAH" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
