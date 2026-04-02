import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Select, Input, Space, message, Tag, Progress, InputNumber, Descriptions } from 'antd';
import { PlusOutlined, EyeOutlined, CheckOutlined, SendOutlined } from '@ant-design/icons';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { formatDate } from '../../utils/dateFormat';
import {
  getInventorySessions,
  getInventorySessionById,
  startInventorySession,
  recordInventoryCount,
  submitInventorySession,
  approveInventorySession,
  completeInventorySession,
  getWarehouses,
} from '../../api/warehouses';
import type { InventorySessionDto, InventorySessionDetailDto } from '../../types/warehouse';
import type { WarehouseDto } from '../../types/warehouse';
import type { PaginatedResult } from '../../types/common';
import s from './InventorySessions.module.css';

const STATUS_LABELS: Record<number, string> = {
  0: 'Draft',
  1: 'InProgress',
  2: 'PendingApproval',
  3: 'Approved',
  4: 'Completed',
  5: 'Cancelled',
};

const STATUS_COLORS: Record<number, string> = {
  0: 'default',
  1: 'processing',
  2: 'warning',
  3: 'success',
  4: 'green',
  5: 'red',
};

export default function InventorySessions() {
  const { t } = useTranslation();
  const { hasPermission } = useRole();
  const canManage = hasPermission('inventory', 'manage');

  const [result, setResult] = useState<PaginatedResult<InventorySessionDto> | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedWarehouse, setSelectedWarehouse] = useState<string | undefined>();

  // Start session modal
  const [startOpen, setStartOpen] = useState(false);
  const [startForm] = Form.useForm();
  const [startSaving, setStartSaving] = useState(false);

  // Session detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [detail, setDetail] = useState<InventorySessionDetailDto | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Record count modal
  const [countOpen, setCountOpen] = useState(false);
  const [countForm] = Form.useForm();
  const [countLineId, setCountLineId] = useState<string | null>(null);
  const [countSaving, setCountSaving] = useState(false);

  const loadSessions = (wh?: string, p = page) => {
    setLoading(true);
    getInventorySessions({ warehouseId: wh, page: p, pageSize })
      .then(setResult)
      .catch(() => message.error(t.inventorySessions.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    getWarehouses({ page: 1, pageSize: 100 }).then(r => setWarehouses(r.items)).catch(() => {});
    loadSessions();
  }, []);

  useEffect(() => { loadSessions(selectedWarehouse, page); }, [page]);

  const handleStart = async () => {
    try {
      const values = await startForm.validateFields();
      setStartSaving(true);
      await startInventorySession(values);
      message.success(t.inventorySessions.startSuccess);
      startForm.resetFields();
      setStartOpen(false);
      loadSessions(selectedWarehouse, 1);
      setPage(1);
    } catch {
      message.error(t.inventorySessions.startError);
    } finally {
      setStartSaving(false);
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setDetailOpen(true);
    setDetail(null);
    try {
      const d = await getInventorySessionById(id);
      setDetail(d);
    } catch {
      message.error(t.inventorySessions.loadError);
      setDetailOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRecordCount = async () => {
    if (!detail || !countLineId) return;
    try {
      const values = await countForm.validateFields();
      setCountSaving(true);
      const line = detail.lines.find(l => l.id === countLineId);
      if (!line) return;
      await recordInventoryCount(detail.id, {
        itemId: line.itemId,
        batchId: line.batchId,
        actualQuantity: values.actualQuantity,
        note: values.note,
      });
      message.success(t.inventorySessions.recordSuccess);
      countForm.resetFields();
      setCountOpen(false);
      setCountLineId(null);
      const updated = await getInventorySessionById(detail.id);
      setDetail(updated);
    } catch {
      message.error(t.inventorySessions.recordError);
    } finally {
      setCountSaving(false);
    }
  };

  const handleSubmit = async (id: string) => {
    try {
      await submitInventorySession(id);
      message.success(t.inventorySessions.submitSuccess);
      loadSessions(selectedWarehouse, page);
      if (detail?.id === id) {
        const updated = await getInventorySessionById(id);
        setDetail(updated);
      }
    } catch {
      message.error(t.inventorySessions.submitError);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveInventorySession(id);
      message.success(t.inventorySessions.approveSuccess);
      loadSessions(selectedWarehouse, page);
      if (detail?.id === id) {
        const updated = await getInventorySessionById(id);
        setDetail(updated);
      }
    } catch {
      message.error(t.inventorySessions.approveError);
    }
  };

  const handleComplete = async (id: string) => {
    try {
      await completeInventorySession(id);
      message.success(t.inventorySessions.completeSuccess);
      loadSessions(selectedWarehouse, page);
      if (detail?.id === id) {
        const updated = await getInventorySessionById(id);
        setDetail(updated);
      }
    } catch {
      message.error(t.inventorySessions.completeError);
    }
  };

  const getStatusLabel = (status: number) => {
    const map: Record<number, string> = {
      1: t.inventorySessions.statusInProgress,
      2: t.inventorySessions.statusPendingApproval,
      3: t.inventorySessions.statusApproved,
      4: t.inventorySessions.statusCompleted,
      5: t.inventorySessions.statusCancelled,
    };
    return map[status] ?? STATUS_LABELS[status] ?? String(status);
  };

  const columns = [
    {
      title: t.inventorySessions.warehouse,
      dataIndex: 'warehouseName',
      key: 'warehouseName',
    },
    {
      title: t.inventorySessions.status,
      dataIndex: 'status',
      key: 'status',
      render: (s: number) => <Tag color={STATUS_COLORS[s]}>{getStatusLabel(s)}</Tag>,
    },
    {
      title: t.inventorySessions.progress,
      key: 'progress',
      render: (_: unknown, r: InventorySessionDto) =>
        r.totalLines > 0 ? (
          <Progress
            percent={Math.round((r.countedLines / r.totalLines) * 100)}
            size="small"
            format={() => `${r.countedLines}/${r.totalLines}`}
          />
        ) : '—',
    },
    {
      title: t.inventorySessions.createdAt,
      dataIndex: 'createdAtUtc',
      key: 'createdAtUtc',
      render: (v: string) => formatDate(v),
    },
    {
      title: t.common?.actions ?? 'Actions',
      key: 'actions',
      render: (_: unknown, r: InventorySessionDto) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => openDetail(r.id)}>
            {t.inventorySessions.viewSession}
          </Button>
          {canManage && r.status === 1 && (
            <Button size="small" icon={<SendOutlined />} onClick={() => handleSubmit(r.id)}>
              {t.inventorySessions.submit}
            </Button>
          )}
          {canManage && r.status === 2 && (
            <Button size="small" icon={<CheckOutlined />} onClick={() => handleApprove(r.id)}>
              {t.inventorySessions.approve}
            </Button>
          )}
          {canManage && r.status === 3 && (
            <Button size="small" type="primary" onClick={() => handleComplete(r.id)}>
              {t.inventorySessions.complete}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const lineColumns = [
    { title: t.inventorySessions.item, key: 'item', render: (_: unknown, l: InventorySessionDetailDto['lines'][0]) => `${l.itemName} (${l.itemCode})` },
    { title: t.inventorySessions.expected, dataIndex: 'expectedQuantityBase', key: 'expected', render: (v: number, l: InventorySessionDetailDto['lines'][0]) => `${v.toFixed(2)} ${l.baseUnit}` },
    { title: t.inventorySessions.actual, key: 'actual', render: (_: unknown, l: InventorySessionDetailDto['lines'][0]) => l.isCountRecorded && l.actualQuantityBase != null ? `${l.actualQuantityBase.toFixed(2)} ${l.baseUnit}` : '—' },
    {
      title: t.inventorySessions.difference, key: 'diff',
      render: (_: unknown, l: InventorySessionDetailDto['lines'][0]) => {
        if (!l.isCountRecorded || l.actualQuantityBase == null) return '—';
        const diff = l.actualQuantityBase - l.expectedQuantityBase;
        return <span style={{ color: diff === 0 ? 'inherit' : diff > 0 ? 'var(--success)' : 'var(--error)' }}>{diff >= 0 ? '+' : ''}{diff.toFixed(2)} {l.baseUnit}</span>;
      },
    },
    {
      title: t.inventorySessions.recorded, key: 'recorded',
      render: (_: unknown, l: InventorySessionDetailDto['lines'][0]) => (
        <Tag color={l.isCountRecorded ? 'green' : 'default'}>{l.isCountRecorded ? '✓' : '—'}</Tag>
      ),
    },
    {
      title: '',
      key: 'action',
      render: (_: unknown, l: InventorySessionDetailDto['lines'][0]) =>
        canManage && detail?.status === 1 ? (
          <Button size="small" onClick={() => { setCountLineId(l.id); setCountOpen(true); }}>
            {t.inventorySessions.recordCount}
          </Button>
        ) : null,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.inventorySessions.title}
        subtitle={t.inventorySessions.subtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.warehouses, path: '/warehouses' }, { label: t.nav.inventory }]} />}
      />
      <Space className={s.spaced}>
        <Select
          placeholder={t.inventorySessions.selectWarehouse}
          allowClear
          className={s.block2}
          options={warehouses.map(w => ({ value: w.id, label: w.name }))}
          onChange={(v) => { setSelectedWarehouse(v); setPage(1); loadSessions(v, 1); }}
        />
        {canManage && (
          <Button icon={<PlusOutlined />} type="primary" onClick={() => setStartOpen(true)}>
            {t.inventorySessions.start}
          </Button>
        )}
      </Space>

      <Table
        dataSource={result?.items ?? []}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total: result?.totalCount ?? 0,
          onChange: (p) => setPage(p),
        }}
        locale={{ emptyText: t.inventorySessions.noSessions }}
      />

      {/* Start Session Modal */}
      <Modal
        title={t.inventorySessions.start}
        open={startOpen}
        onOk={handleStart}
        onCancel={() => { setStartOpen(false); startForm.resetFields(); }}
        okText={t.common?.save ?? 'Save'}
        cancelText={t.common?.cancel ?? 'Cancel'}
        confirmLoading={startSaving}
      >
        <Form form={startForm} layout="vertical" className={s.spaced1}>
          <Form.Item name="warehouseId" label={t.inventorySessions.warehouse} rules={[{ required: true }]}>
            <Select options={warehouses.map(w => ({ value: w.id, label: w.name }))} placeholder={t.inventorySessions.selectWarehouse} />
          </Form.Item>
          <Form.Item name="notes" label={t.inventorySessions.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Session Detail Modal */}
      <Modal
        title={t.inventorySessions.title}
        open={detailOpen}
        onCancel={() => { setDetailOpen(false); setDetail(null); }}
        footer={
          detail && canManage ? (
            <Space>
              {detail.status === 1 && (
                <Button icon={<SendOutlined />} onClick={() => handleSubmit(detail.id)}>
                  {t.inventorySessions.submit}
                </Button>
              )}
              {detail.status === 2 && (
                <Button icon={<CheckOutlined />} onClick={() => handleApprove(detail.id)}>
                  {t.inventorySessions.approve}
                </Button>
              )}
              {detail.status === 3 && (
                <Button type="primary" onClick={() => handleComplete(detail.id)}>
                  {t.inventorySessions.complete}
                </Button>
              )}
              <Button onClick={() => { setDetailOpen(false); setDetail(null); }}>
                {t.common?.cancel ?? 'Close'}
              </Button>
            </Space>
          ) : null
        }
        width={900}
        loading={detailLoading}
      >
        {detail && (
          <>
            <Descriptions size="small" className={s.spaced}>
              <Descriptions.Item label={t.inventorySessions.warehouse}>{detail.warehouseName}</Descriptions.Item>
              <Descriptions.Item label={t.inventorySessions.status}>
                <Tag color={STATUS_COLORS[detail.status]}>{getStatusLabel(detail.status)}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label={t.inventorySessions.progress}>
                {detail.countedLines}/{detail.totalLines} {t.inventorySessions.countedLines}
              </Descriptions.Item>
            </Descriptions>
            <Table
              dataSource={detail.lines}
              columns={lineColumns}
              rowKey="id"
              size="small"
              pagination={false}
            />
          </>
        )}
      </Modal>

      {/* Record Count Modal */}
      <Modal
        title={t.inventorySessions.recordCount}
        open={countOpen}
        onOk={handleRecordCount}
        onCancel={() => { setCountOpen(false); countForm.resetFields(); setCountLineId(null); }}
        okText={t.common?.save ?? 'Save'}
        cancelText={t.common?.cancel ?? 'Cancel'}
        confirmLoading={countSaving}
      >
        <Form form={countForm} layout="vertical" className={s.spaced1}>
          <Form.Item name="actualQuantity" label={t.inventorySessions.actual} rules={[{ required: true }]}>
            <InputNumber min={0} step={0.001} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="note" label={t.inventorySessions.notes}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
