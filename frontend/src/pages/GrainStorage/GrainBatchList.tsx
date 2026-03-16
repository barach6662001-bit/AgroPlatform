import { useEffect, useState } from 'react';
import { Table, Tag, message, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, Drawer } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getGrainBatches, createGrainBatch, createGrainMovement, getGrainMovements } from '../../api/grain';
import type { GrainBatchDto, GrainMovementDto, GrainOwnershipType } from '../../types/grain';
import type { GrainBatchesResult } from '../../api/grain';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const ownershipColors: Record<GrainOwnershipType, string> = {
  0: 'green',
  1: 'blue',
  2: 'orange',
  3: 'default',
};

export default function GrainBatchList() {
  const [result, setResult] = useState<GrainBatchesResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [ownershipFilter, setOwnershipFilter] = useState<number | undefined>(undefined);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchForm] = Form.useForm();

  const [movementDrawerOpen, setMovementDrawerOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<GrainBatchDto | null>(null);
  const [movements, setMovements] = useState<GrainMovementDto[]>([]);
  const [movementsLoading, setMovementsLoading] = useState(false);
  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [savingMovement, setSavingMovement] = useState(false);
  const [movementForm] = Form.useForm();

  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canCreate = hasRole(['Administrator', 'Manager', 'Storekeeper']);

  const load = (p = page, ps = pageSize, ot = ownershipFilter) => {
    setLoading(true);
    getGrainBatches({ page: p, pageSize: ps, ownershipType: ot })
      .then(setResult)
      .catch(() => message.error(t.grain.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize, ownershipFilter]);

  const handleCreateBatch = async () => {
    try {
      const values = await batchForm.validateFields();
      setSavingBatch(true);
      await createGrainBatch({
        ...values,
        receivedDate: values.receivedDate?.toISOString(),
        ownershipType: Number(values.ownershipType),
      });
      message.success(t.grain.createSuccess);
      batchForm.resetFields();
      setBatchModalOpen(false);
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) return;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingBatch(false);
    }
  };

  const openMovements = (batch: GrainBatchDto) => {
    setSelectedBatch(batch);
    setMovementDrawerOpen(true);
    setMovementsLoading(true);
    getGrainMovements(batch.id)
      .then(setMovements)
      .catch(() => message.error(t.grain.loadError))
      .finally(() => setMovementsLoading(false));
  };

  const handleCreateMovement = async () => {
    if (!selectedBatch) return;
    try {
      const values = await movementForm.validateFields();
      setSavingMovement(true);
      await createGrainMovement(selectedBatch.id, {
        ...values,
        movementDate: values.movementDate?.toISOString(),
      });
      message.success(t.grain.movementSuccess);
      movementForm.resetFields();
      setMovementModalOpen(false);
      // Reload movements
      setMovementsLoading(true);
      getGrainMovements(selectedBatch.id)
        .then(setMovements)
        .catch(() => message.error(t.grain.loadError))
        .finally(() => setMovementsLoading(false));
      // Reload batches to reflect updated quantity
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) return;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingMovement(false);
    }
  };

  const ownershipLabel = (type: GrainOwnershipType) => {
    const labels: Record<GrainOwnershipType, string> = {
      0: t.grain.ownGrain,
      1: t.grain.consignment,
      2: t.grain.storage,
      3: t.grain.other,
    };
    return labels[type] ?? String(type);
  };

  const columns = [
    {
      title: t.grain.grainType,
      dataIndex: 'grainType',
      key: 'grainType',
    },
    {
      title: t.grain.ownershipType,
      dataIndex: 'ownershipType',
      key: 'ownershipType',
      render: (v: GrainOwnershipType, record: GrainBatchDto) => (
        <Space>
          <Tag color={ownershipColors[v]}>{ownershipLabel(v)}</Tag>
          {record.ownerName && <span>{record.ownerName}</span>}
        </Space>
      ),
    },
    {
      title: t.grain.initialQuantity,
      dataIndex: 'initialQuantityTons',
      key: 'initialQuantityTons',
      render: (v: number) => `${v.toFixed(2)} т`,
    },
    {
      title: t.grain.quantityTons,
      dataIndex: 'quantityTons',
      key: 'quantityTons',
      render: (v: number) => `${v.toFixed(2)} т`,
    },
    {
      title: t.grain.pricePerTon,
      dataIndex: 'pricePerTon',
      key: 'pricePerTon',
      render: (v?: number) => v != null ? `${v.toFixed(2)}` : '—',
    },
    {
      title: t.grain.receivedDate,
      dataIndex: 'receivedDate',
      key: 'receivedDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, record: GrainBatchDto) => (
        <Space>
          <Button size="small" onClick={() => openMovements(record)}>
            {t.grain.createMovement}
          </Button>
        </Space>
      ),
    },
  ];

  const movementColumns = [
    {
      title: t.grain.movementDate,
      dataIndex: 'movementDate',
      key: 'movementDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: t.common.actions,
      dataIndex: 'movementType',
      key: 'movementType',
      render: (v: string) => (
        <Tag color={v === 'In' ? 'green' : 'red'}>
          {v === 'In' ? t.grain.movementIn : t.grain.movementOut}
        </Tag>
      ),
    },
    {
      title: t.grain.quantityTons,
      dataIndex: 'quantityTons',
      key: 'quantityTons',
      render: (v: number) => `${v.toFixed(2)} т`,
    },
    {
      title: t.grain.reason,
      dataIndex: 'reason',
      key: 'reason',
      render: (v?: string) => v || '—',
    },
    {
      title: t.common.notes,
      dataIndex: 'notes',
      key: 'notes',
      render: (v?: string) => v || '—',
    },
  ];

  return (
    <div>
      <PageHeader title={t.grain.title} subtitle={t.grain.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder={t.grain.ownershipType}
          style={{ width: 180 }}
          value={ownershipFilter}
          onChange={(v) => { setOwnershipFilter(v); setPage(1); }}
          options={[
            { value: 0, label: t.grain.ownGrain },
            { value: 1, label: t.grain.consignment },
            { value: 2, label: t.grain.storage },
            { value: 3, label: t.grain.other },
          ]}
        />
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#d4a017', borderColor: '#d4a017' }}
            onClick={() => setBatchModalOpen(true)}
          >
            {t.grain.receiveGrain}
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
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      {/* Create Grain Batch Modal */}
      <Modal
        title={t.grain.receiveGrain}
        open={batchModalOpen}
        onOk={handleCreateBatch}
        onCancel={() => { setBatchModalOpen(false); batchForm.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={savingBatch}
        width={560}
      >
        <Form form={batchForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="grainType" label={t.grain.grainType} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="quantityTons" label={t.grain.initialQuantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber style={{ width: '100%' }} min={0} precision={4} />
          </Form.Item>
          <Form.Item name="ownershipType" label={t.grain.ownershipType} initialValue={0} rules={[{ required: true, message: t.common.required }]}>
            <Select
              options={[
                { value: 0, label: t.grain.ownGrain },
                { value: 1, label: t.grain.consignment },
                { value: 2, label: t.grain.storage },
                { value: 3, label: t.grain.other },
              ]}
            />
          </Form.Item>
          <Form.Item name="ownerName" label={t.grain.ownerName}>
            <Input />
          </Form.Item>
          <Form.Item name="contractNumber" label={t.grain.contractNumber}>
            <Input />
          </Form.Item>
          <Form.Item name="pricePerTon" label={t.grain.pricePerTon}>
            <InputNumber style={{ width: '100%' }} min={0} precision={2} />
          </Form.Item>
          <Form.Item name="receivedDate" label={t.grain.receivedDate} initialValue={dayjs()} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Movements Drawer */}
      <Drawer
        title={selectedBatch ? `${selectedBatch.grainType} — ${t.grain.batchList}` : t.grain.batchList}
        open={movementDrawerOpen}
        onClose={() => setMovementDrawerOpen(false)}
        width={700}
        extra={
          canCreate && (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setMovementModalOpen(true)}
            >
              {t.grain.createMovement}
            </Button>
          )
        }
      >
        <Table
          dataSource={movements}
          columns={movementColumns}
          rowKey="id"
          loading={movementsLoading}
          pagination={false}
          size="small"
        />
      </Drawer>

      {/* Create Movement Modal */}
      <Modal
        title={t.grain.createMovement}
        open={movementModalOpen}
        onOk={handleCreateMovement}
        onCancel={() => { setMovementModalOpen(false); movementForm.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={savingMovement}
      >
        <Form form={movementForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="movementType" label={t.grain.ownershipType} initialValue="In" rules={[{ required: true, message: t.common.required }]}>
            <Select
              options={[
                { value: 'In', label: t.grain.movementIn },
                { value: 'Out', label: t.grain.movementOut },
              ]}
            />
          </Form.Item>
          <Form.Item name="quantityTons" label={t.grain.quantityTons} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber style={{ width: '100%' }} min={0.0001} precision={4} />
          </Form.Item>
          <Form.Item name="movementDate" label={t.grain.movementDate} initialValue={dayjs()} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label={t.grain.reason}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
