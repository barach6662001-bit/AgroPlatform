import { useEffect, useState } from 'react';
import { Table, Badge, message, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, AutoComplete, Alert } from 'antd';
import { PlusOutlined, ExportOutlined, DownloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getGrainBatches, createGrainBatch, createGrainMovement, getGrainMovements, getGrainTypes } from '../../api/grain';
import { getWarehouses } from '../../api/warehouses';
import { getFields } from '../../api/fields';
import type { GrainBatchDto, GrainMovementDto, GrainOwnershipType } from '../../types/grain';
import type { FieldDto } from '../../types/field';
import type { WarehouseDto } from '../../types/warehouse';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { exportToCsv } from '../../utils/exportCsv';

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
  const [selectedStorageId, setSelectedStorageId] = useState<string | undefined>(undefined);
  const [storages, setStorages] = useState<WarehouseDto[]>([]);

  const [grainTypes, setGrainTypes] = useState<string[]>([]);
  const [fields, setFields] = useState<FieldDto[]>([]);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchForm] = Form.useForm();

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [movementBatchId, setMovementBatchId] = useState<string | null>(null);
  const [savingMovement, setSavingMovement] = useState(false);
  const [movementForm] = Form.useForm();
  const [currentMovementType, setCurrentMovementType] = useState<string>('In');

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [savingIssue, setSavingIssue] = useState(false);
  const [issueForm] = Form.useForm();
  const [selectedIssueBatch, setSelectedIssueBatch] = useState<GrainBatchDto | null>(null);

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

  useEffect(() => {
    getFields({ pageSize: 200 })
      .then((r) => setFields(r.items))
      .catch(() => {/* ignore */});
  }, []);

  useEffect(() => {
    getWarehouses({ type: 1, pageSize: 100 })
      .then((r) => setStorages(r.items))
      .catch(() => {/* ignore */});
  }, []);

  const load = (p = page, ps = pageSize, ownership = filterOwnership, storageId = selectedStorageId) => {
    setLoading(true);
    getGrainBatches({ page: p, pageSize: ps, ownershipType: ownership, storageId })
      .then(setResult)
      .catch(() => message.error(t.grain.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize, filterOwnership, selectedStorageId]);

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
    setCurrentMovementType('In');
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

  const openIssueModal = () => {
    issueForm.resetFields();
    setSelectedIssueBatch(null);
    setIssueModalOpen(true);
  };

  const handleIssueGrain = async () => {
    try {
      const values = await issueForm.validateFields();
      setSavingIssue(true);
      await createGrainMovement(values.grainBatchId, {
        movementType: 'Out',
        quantityTons: values.quantityTons,
        reason: values.reason,
        pricePerTon: values.pricePerTon,
        movementDate: new Date().toISOString(),
      });
      message.success(t.grain.issueSuccess);
      issueForm.resetFields();
      setSelectedIssueBatch(null);
      setIssueModalOpen(false);
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingIssue(false);
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
      title: t.grain.sourceField,
      dataIndex: 'sourceFieldName',
      key: 'sourceFieldName',
      render: (v?: string) => v || '—',
    },
    {
      title: t.grain.moisture,
      dataIndex: 'moisturePercent',
      key: 'moisturePercent',
      render: (v?: number) => v != null ? `${v.toFixed(1)}%` : '—',
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
      <Space style={{ marginBottom: 16 }} wrap>
        {storages.length > 1 && (
          <Select
            allowClear
            placeholder={t.grain.selectStorage}
            style={{ width: 200 }}
            options={storages.map(s => ({ value: s.id, label: s.name }))}
            onChange={v => { setSelectedStorageId(v); setPage(1); }}
          />
        )}
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
            style={{ background: '#238636', borderColor: '#238636' }}
            onClick={openBatchModal}
          >
            {t.grain.receiveGrain}
          </Button>
        )}
        {canCreate && (
          <Button
            icon={<ExportOutlined />}
            style={{ borderColor: '#d29922', color: '#d29922' }}
            onClick={openIssueModal}
          >
            {t.grain.issueGrain}
          </Button>
        )}
        <Button
          icon={<DownloadOutlined />}
          onClick={() => exportToCsv('grain-batches', result?.items ?? [], [
            { key: 'grainType', title: t.grain.grainType },
            { key: 'sourceFieldName', title: t.grain.sourceField },
            { key: 'moisturePercent', title: t.grain.moisture },
            { key: 'initialQuantityTons', title: t.grain.initialQuantity },
            { key: 'quantityTons', title: t.grain.quantityTons },
            { key: 'pricePerTon', title: t.grain.pricePerTon },
            { key: 'receivedDate', title: t.grain.receivedDate },
          ])}
        >
          {t.common.export}
        </Button>
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
          <Form.Item name="initialQuantityTons" label={t.grain.initialQuantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pricePerTon" label={t.grain.pricePerTon}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contractNumber" label={t.grain.contractNumber}>
            <Input />
          </Form.Item>
          <Form.Item name="sourceFieldId" label={t.grain.sourceField}>
            <Select
              allowClear
              showSearch
              placeholder={t.grain.selectSourceField}
              options={fields.map(f => ({ value: f.id, label: f.name }))}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="moisturePercent" label={t.grain.moisture}>
            <InputNumber min={0} max={100} precision={1} addonAfter="%" style={{ width: '100%' }} />
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
            <Select
              options={[
                { value: 'In', label: t.grain.movementIn },
                { value: 'Out', label: t.grain.movementOut },
              ]}
              onChange={(v) => setCurrentMovementType(v)}
            />
          </Form.Item>
          <Form.Item name="quantityTons" label={t.grain.quantityTons} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.001} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="movementDate" label={t.grain.movementDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          {currentMovementType === 'Out' && (
            <>
              <Form.Item name="pricePerTon" label={t.grain.exportPrice}>
                <InputNumber min={0} precision={2} addonAfter="грн/т" style={{ width: '100%' }} />
              </Form.Item>
              <Form.Item name="reason" label={t.grain.exportReason}>
                <Select options={[
                  { value: 'sale', label: t.grain.reasonSale },
                  { value: 'processing', label: t.grain.reasonProcessing },
                  { value: 'transfer', label: t.grain.reasonTransfer },
                  { value: 'other', label: t.grain.reasonOther },
                ]} />
              </Form.Item>
            </>
          )}
          {currentMovementType !== 'Out' && (
            <Form.Item name="reason" label={t.grain.reason}>
              <Input />
            </Form.Item>
          )}
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

      {/* Issue Grain Modal */}
      <Modal
        title={t.grain.issueGrain}
        open={issueModalOpen}
        onOk={handleIssueGrain}
        onCancel={() => { setIssueModalOpen(false); issueForm.resetFields(); setSelectedIssueBatch(null); }}
        okText={t.common.confirm}
        cancelText={t.common.cancel}
        confirmLoading={savingIssue}
      >
        <Form form={issueForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="grainBatchId" label={t.grain.selectBatch} rules={[{ required: true, message: t.common.required }]}>
            <Select
              showSearch
              placeholder={t.grain.selectBatch}
              options={(result?.items ?? []).map(b => ({
                value: b.id,
                label: `${b.grainType} — ${b.quantityTons.toFixed(2)} т (${ownershipLabel(b.ownershipType)})`,
              }))}
              onChange={(val) => {
                const batch = (result?.items ?? []).find(b => b.id === val);
                setSelectedIssueBatch(batch ?? null);
              }}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            />
          </Form.Item>
          {selectedIssueBatch && (
            <Alert
              type="info"
              message={`${t.grain.available}: ${selectedIssueBatch.quantityTons.toFixed(3)} т`}
              style={{ marginBottom: 12 }}
            />
          )}
          <Form.Item name="quantityTons" label={t.grain.quantityTons} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber
              min={0.001}
              max={selectedIssueBatch?.quantityTons}
              precision={3}
              addonAfter="т"
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item name="reason" label={t.grain.exportReason}>
            <Select
              allowClear
              options={[
                { value: 'sale', label: t.grain.reasonSale },
                { value: 'processing', label: t.grain.reasonProcessing },
                { value: 'transfer', label: t.grain.reasonTransfer },
                { value: 'other', label: t.grain.reasonOther },
              ]}
            />
          </Form.Item>
          <Form.Item name="pricePerTon" label={t.grain.exportPrice}>
            <InputNumber min={0} precision={2} addonAfter="грн/т" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

