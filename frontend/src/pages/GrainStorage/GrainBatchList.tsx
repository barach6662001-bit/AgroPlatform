import { useEffect, useState } from 'react';
import { Table, Badge, message, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, AutoComplete } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getGrainBatches, createGrainBatch, createGrainMovement, getGrainMovements, getGrainTypes } from '../../api/grain';
import type { GrainBatchDto, GrainMovementDto, GrainOwnershipType } from '../../types/grain';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const QUICK_GRAIN_TYPES = ['Пшениця озима', 'Кукурудза', 'Соняшник'];
const LAST_GRAIN_KEY = 'lastGrainType';

const ownershipOptions = (t: ReturnType<typeof useTranslation>['t']) => [
  { value: 0, label: t.grain.ownGrain },
  { value: 1, label: t.grain.consignment },
  { value: 2, label: t.grain.storage },
  { value: 3, label: t.grain.other },
];

export default function GrainBatchList() {
  const [result, setResult] = useState<PaginatedResult<GrainBatchDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [filterOwnership, setFilterOwnership] = useState<number | undefined>(undefined);

  const [grainTypes, setGrainTypes] = useState<string[]>([]);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchForm] = Form.useForm();

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementBatchId, setMovementBatchId] = useState<string | null>(null);
  const [savingMovement, setSavingMovement] = useState(false);
  const [movementForm] = Form.useForm();

  const [movementsModalOpen, setMovementsModalOpen] = useState(false);
  const [movements, setMovements] = useState<GrainMovementDto[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);

  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canCreate = hasRole(['Administrator', 'Manager', 'Storekeeper']);

  useEffect(() => {
    getGrainTypes()
      .then(setGrainTypes)
      .catch(() => message.warning(t.grain.loadError));
  }, []);

  const load = (p = page, ps = pageSize, ownership = filterOwnership) => {
    setLoading(true);
    getGrainBatches({ page: p, pageSize: ps, ownershipType: ownership })
      .then(setResult)
      .catch(() => message.error(t.grain.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize, filterOwnership]);

  const openBatchModal = () => {
    const lastGrainType = localStorage.getItem(LAST_GRAIN_KEY);
    batchForm.resetFields();
    batchForm.setFieldsValue({
      grainType: lastGrainType ?? grainTypes[0],
      receivedDate: dayjs(),
    });
    setBatchModalOpen(true);
  };

  const openMovementModal = (batchId: string) => {
    movementForm.resetFields();
    movementForm.setFieldsValue({
      movementType: 'In',
      movementDate: dayjs(),
    });
    setMovementBatchId(batchId);
    setMovementModalOpen(true);
  };

  const handleCreateBatch = async () => {
    try {
      const values = await batchForm.validateFields();
      setSavingBatch(true);
      await createGrainBatch({
        ...values,
        receivedDate: values.receivedDate?.toISOString(),
      });
      message.success(t.grain.createSuccess);
      localStorage.setItem(LAST_GRAIN_KEY, values.grainType);
      batchForm.resetFields();
      setBatchModalOpen(false);
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingBatch(false);
    }
  };

  const handleCreateMovement = async () => {
    if (!movementBatchId) return;
    try {
      const values = await movementForm.validateFields();
      setSavingMovement(true);
      await createGrainMovement(movementBatchId, {
        ...values,
        movementDate: values.movementDate?.toISOString(),
      });
      message.success(t.grain.movementSuccess);
      movementForm.resetFields();
      setMovementModalOpen(false);
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingMovement(false);
    }
  };

  const openMovementsModal = async (batchId: string) => {
    setMovementsModalOpen(true);
    setLoadingMovements(true);
    try {
      const data = await getGrainMovements(batchId);
      setMovements(data);
    } catch {
      message.error(t.grain.loadError);
    } finally {
      setLoadingMovements(false);
    }
  };

  const ownershipLabel = (type: GrainOwnershipType) => {
    const labels: Record<number, string> = {
      0: t.grain.ownGrain,
      1: t.grain.consignment,
      2: t.grain.storage,
      3: t.grain.other,
    };
    return labels[type] ?? type;
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
          <Badge
            status={v === 0 ? 'success' : v === 1 ? 'processing' : v === 2 ? 'warning' : 'default'}
            text={ownershipLabel(v)}
          />
          {record.ownerName && <span>({record.ownerName})</span>}
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
      render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—',
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, record: GrainBatchDto) => (
        <Space>
          {canCreate && (
            <Button
              size="small"
              onClick={e => { e.stopPropagation(); openMovementModal(record.id); }}
            >
              + {t.grain.createMovement}
            </Button>
          )}
          <Button
            size="small"
            onClick={e => { e.stopPropagation(); openMovementsModal(record.id); }}
          >
            {t.common.details}
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
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: t.grain.movementType,
      dataIndex: 'movementType',
      key: 'movementType',
      render: (v: string) => (
        <Badge
          status={v === 'In' ? 'success' : 'error'}
          text={v === 'In' ? t.grain.movementIn : t.grain.movementOut}
        />
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
  ];

  return (
    <div>
      <PageHeader title={t.grain.title} subtitle={t.grain.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        <Select
          allowClear
          placeholder={t.grain.ownershipType}
          style={{ width: 160 }}
          options={ownershipOptions(t)}
          value={filterOwnership}
          onChange={v => { setFilterOwnership(v); setPage(1); }}
        />
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#d4a017', borderColor: '#d4a017' }}
            onClick={openBatchModal}
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

      {/* Create Batch Modal */}
      <Modal
        title={t.grain.receiveGrain}
        open={batchModalOpen}
        onOk={handleCreateBatch}
        onCancel={() => { setBatchModalOpen(false); batchForm.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={savingBatch}
      >
        <Form form={batchForm} layout="vertical" style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8 }}>
            <span style={{ fontSize: 12, color: '#888' }}>{t.grain.quickSelect}: </span>
            {QUICK_GRAIN_TYPES.map(grain => (
              <Button
                key={grain}
                size="small"
                onClick={() => batchForm.setFieldsValue({ grainType: grain })}
                style={{ marginRight: 8, marginBottom: 4 }}
              >
                {grain}
              </Button>
            ))}
          </div>
          <Form.Item name="grainType" label={t.grain.grainType} rules={[{ required: true, message: t.common.required }]}>
            <AutoComplete
              options={grainTypes.map(g => ({ value: g, label: g }))}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              placeholder={t.grain.selectGrainType}
            />
          </Form.Item>
          <Form.Item name="ownershipType" label={t.grain.ownershipType} rules={[{ required: true, message: t.common.required }]}>
            <Select options={ownershipOptions(t)} />
          </Form.Item>
          <Form.Item name="ownerName" label={t.grain.ownerName}>
            <Input />
          </Form.Item>
          <Form.Item name="quantityTons" label={t.grain.initialQuantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pricePerTon" label={t.grain.pricePerTon}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contractNumber" label={t.grain.contractNumber}>
            <Input />
          </Form.Item>
          <Form.Item name="receivedDate" label={t.grain.receivedDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

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
          <Form.Item name="movementType" label={t.grain.movementType} rules={[{ required: true, message: t.common.required }]}>
            <Select options={[
              { value: 'In', label: t.grain.movementIn },
              { value: 'Out', label: t.grain.movementOut },
            ]} />
          </Form.Item>
          <Form.Item name="quantityTons" label={t.grain.quantityTons} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.001} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="movementDate" label={t.grain.movementDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="reason" label={t.grain.reason}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Movements Details Modal */}
      <Modal
        title={t.grain.batchList}
        open={movementsModalOpen}
        onCancel={() => setMovementsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Table
          dataSource={movements}
          columns={movementColumns}
          rowKey="id"
          loading={loadingMovements}
          pagination={false}
          size="small"
        />
      </Modal>
    </div>
  );
}

