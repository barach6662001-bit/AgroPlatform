import { exportToCsv } from '../../utils/exportCsv';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Badge, message, Button, Space, Modal, Form, Input, Select, DatePicker, InputNumber, AutoComplete, Alert, Row, Col, Card, Typography, Tabs, Tag, Tooltip, Collapse,  } from 'antd';
import {
  PlusOutlined, ExportOutlined, DownloadOutlined, SwapOutlined,
  ScissorOutlined, EditOutlined, DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getGrainBatches, createGrainBatch, createGrainMovement, getGrainMovements,
  getGrainTypes, getGrainStorages, transferGrain, splitGrainBatch,
  adjustGrainBatch, writeOffGrainBatch, getGrainLedger,
} from '../../api/grain';
import { getFields } from '../../api/fields';
import type { GrainBatchDto, GrainMovementDto, GrainMovementType, GrainOwnershipType, GrainStorageDto } from '../../types/grain';
import type { FieldDto } from '../../types/field';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import { useFormatCurrency, useCurrencySymbol } from '../../hooks/useFormatCurrency';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';
import s from './GrainBatchList.module.css';
import DataTable from '../../components/ui/DataTable';

const QUICK_GRAIN_TYPES = ['Пшениця озима', 'Кукурудза', 'Соняшник'];
const LAST_GRAIN_KEY = 'lastGrainType';

const ownershipOptions = (t: ReturnType<typeof useTranslation>['t']) => [
  { value: 0, label: t.grain.ownershipOwn },
  { value: 1, label: t.grain.ownershipConsignment },
  { value: 2, label: t.grain.ownershipStorage },
  { value: 3, label: t.grain.ownershipOther },
];

const movementTypeColor = (type: GrainMovementType): string => {
  switch (type) {
    case 'Receipt': return 'green';
    case 'SaleDispatch': return 'gold';
    case 'Issue': return 'orange';
    case 'Transfer': return 'blue';
    case 'Split': return 'purple';
    case 'Merge': return 'cyan';
    case 'Adjustment': return 'geekblue';
    case 'WriteOff': return 'red';
    default: return 'default';
  }
};

function MovementTypeLabel({ type, t }: { type: GrainMovementType; t: ReturnType<typeof useTranslation>['t'] }) {
  const labelMap: Record<GrainMovementType, string> = {
    Receipt: t.grain.typeReceipt,
    Transfer: t.grain.typeTransfer,
    Split: t.grain.typeSplit,
    Merge: t.grain.typeMerge,
    Issue: t.grain.typeIssue,
    SaleDispatch: t.grain.typeSaleDispatch,
    Adjustment: t.grain.typeAdjustment,
    WriteOff: t.grain.typeWriteOff,
  };
  return <Tag color={movementTypeColor(type)}>{labelMap[type] ?? type}</Tag>;
}

export default function GrainBatchList() {
  const [result, setResult] = useState<PaginatedResult<GrainBatchDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [filterOwnership, setFilterOwnership] = useState<number | undefined>(undefined);
  const [selectedStorageId, setSelectedStorageId] = useState<string | undefined>(undefined);
  const [storages, setStorages] = useState<GrainStorageDto[]>([]);

  const [grainTypes, setGrainTypes] = useState<string[]>([]);
  const [fields, setFields] = useState<FieldDto[]>([]);

  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [savingBatch, setSavingBatch] = useState(false);
  const [batchForm] = Form.useForm();

  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [savingIssue, setSavingIssue] = useState(false);
  const [issueForm] = Form.useForm();
  const [selectedIssueBatch, setSelectedIssueBatch] = useState<GrainBatchDto | null>(null);

  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [savingTransfer, setSavingTransfer] = useState(false);
  const [transferForm] = Form.useForm();

  const [splitModalOpen, setSplitModalOpen] = useState(false);
  const [savingSplit, setSavingSplit] = useState(false);
  const [splitForm] = Form.useForm();
  const [selectedSplitBatch, setSelectedSplitBatch] = useState<GrainBatchDto | null>(null);

  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [savingAdjust, setSavingAdjust] = useState(false);
  const [adjustForm] = Form.useForm();
  const [selectedAdjustBatch, setSelectedAdjustBatch] = useState<GrainBatchDto | null>(null);

  const [writeOffModalOpen, setWriteOffModalOpen] = useState(false);
  const [savingWriteOff, setSavingWriteOff] = useState(false);
  const [writeOffForm] = Form.useForm();
  const [selectedWriteOffBatch, setSelectedWriteOffBatch] = useState<GrainBatchDto | null>(null);

  const [movementsModalOpen, setMovementsModalOpen] = useState(false);
  const [movements, setMovements] = useState<GrainMovementDto[]>([]);
  const [loadingMovements, setLoadingMovements] = useState(false);
  const [movementsBatchLabel, setMovementsBatchLabel] = useState('');

  const [ledgerResult, setLedgerResult] = useState<PaginatedResult<GrainMovementDto> | null>(null);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [ledgerPageSize, setLedgerPageSize] = useState(25);
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<string | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<string>('batches');

  const { t } = useTranslation();
  const fmt = useFormatCurrency();
  const currencySymbol = useCurrencySymbol();
  const { hasPermission } = useRole();
  const canCreate = hasPermission('inventory', 'manage');

  useEffect(() => {
    getGrainTypes().then(setGrainTypes).catch(() => message.warning(t.grain.loadError));
  }, []);

  useEffect(() => {
    getFields({ pageSize: 200 }).then((r) => setFields(r.items)).catch(() => {/* ignore */});
  }, []);

  useEffect(() => {
    getGrainStorages({ activeOnly: true }).then(setStorages).catch(() => {/* ignore */});
  }, []);

  const load = (p = page, ps = pageSize, ownership = filterOwnership, storageId = selectedStorageId) => {
    setLoading(true);
    getGrainBatches({ page: p, pageSize: ps, ownershipType: ownership, storageId })
      .then(setResult)
      .catch(() => message.error(t.grain.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize, filterOwnership, selectedStorageId]);

  const loadLedger = (p = ledgerPage, ps = ledgerPageSize, type = ledgerTypeFilter, storageId = selectedStorageId) => {
    setLedgerLoading(true);
    getGrainLedger({ page: p, pageSize: ps, movementType: type, storageId })
      .then(setLedgerResult)
      .catch(() => message.error(t.grain.loadError))
      .finally(() => setLedgerLoading(false));
  };

  useEffect(() => {
    if (activeTab === 'ledger') loadLedger();
  }, [activeTab, ledgerPage, ledgerPageSize, ledgerTypeFilter, selectedStorageId]);

  // ---- Batch create ----
  const openBatchModal = () => {
    const lastGrainType = localStorage.getItem(LAST_GRAIN_KEY);
    batchForm.resetFields();
    batchForm.setFieldsValue({ grainType: lastGrainType ?? grainTypes[0], receivedDate: dayjs() });
    setBatchModalOpen(true);
  };

  const handleCreateBatch = async () => {
    try {
      const values = await batchForm.validateFields();
      setSavingBatch(true);
      await createGrainBatch({ ...values, receivedDate: values.receivedDate?.toISOString() });
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

  // ---- Issue grain ----
  const openIssueModal = () => {
    issueForm.resetFields();
    setSelectedIssueBatch(null);
    setIssueModalOpen(true);
  };

  const handleIssueGrain = async () => {
    try {
      const values = await issueForm.validateFields();
      setSavingIssue(true);
      const isSale = values.reason === 'sale';
      await createGrainMovement(values.grainBatchId, {
        movementType: isSale ? 'SaleDispatch' : 'Issue',
        quantityTons: values.quantityTons,
        reason: values.reason,
        pricePerTon: values.pricePerTon,
        buyerName: values.buyerName,
        movementDate: new Date().toISOString(),
      });
      message.success(t.grain.issueSuccess);
      issueForm.resetFields();
      setSelectedIssueBatch(null);
      setIssueModalOpen(false);
      load();
      if (activeTab === 'ledger') loadLedger();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingIssue(false);
    }
  };

  // ---- Transfer ----
  const handleTransfer = async () => {
    try {
      const values = await transferForm.validateFields();
      setSavingTransfer(true);
      await transferGrain({
        sourceBatchId: values.sourceBatchId,
        targetBatchId: values.targetBatchId,
        quantityTons: values.quantityTons,
        notes: values.notes,
        movementDate: new Date().toISOString(),
      });
      message.success(t.grain.transferSuccess);
      transferForm.resetFields();
      setTransferModalOpen(false);
      load();
      if (activeTab === 'ledger') loadLedger();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingTransfer(false);
    }
  };

  // ---- Split ----
  const openSplitModal = (batch: GrainBatchDto) => {
    splitForm.resetFields();
    setSelectedSplitBatch(batch);
    setSplitModalOpen(true);
  };

  const handleSplit = async () => {
    if (!selectedSplitBatch) return;
    try {
      const values = await splitForm.validateFields();
      setSavingSplit(true);
      await splitGrainBatch({
        sourceBatchId: selectedSplitBatch.id,
        splitQuantityTons: values.splitQuantityTons,
        targetStorageId: values.targetStorageId,
        notes: values.notes,
        movementDate: new Date().toISOString(),
      });
      message.success(t.grain.splitSuccess);
      splitForm.resetFields();
      setSelectedSplitBatch(null);
      setSplitModalOpen(false);
      load();
      if (activeTab === 'ledger') loadLedger();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingSplit(false);
    }
  };

  // ---- Adjust ----
  const openAdjustModal = (batch: GrainBatchDto) => {
    adjustForm.resetFields();
    setSelectedAdjustBatch(batch);
    setAdjustModalOpen(true);
  };

  const handleAdjust = async () => {
    if (!selectedAdjustBatch) return;
    try {
      const values = await adjustForm.validateFields();
      setSavingAdjust(true);
      await adjustGrainBatch(selectedAdjustBatch.id, {
        adjustmentTons: values.adjustmentTons,
        reason: values.reason,
        notes: values.notes,
        movementDate: new Date().toISOString(),
      });
      message.success(t.grain.adjustSuccess);
      adjustForm.resetFields();
      setSelectedAdjustBatch(null);
      setAdjustModalOpen(false);
      load();
      if (activeTab === 'ledger') loadLedger();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingAdjust(false);
    }
  };

  // ---- WriteOff ----
  const openWriteOffModal = (batch: GrainBatchDto) => {
    writeOffForm.resetFields();
    setSelectedWriteOffBatch(batch);
    setWriteOffModalOpen(true);
  };

  const handleWriteOff = async () => {
    if (!selectedWriteOffBatch) return;
    try {
      const values = await writeOffForm.validateFields();
      setSavingWriteOff(true);
      await writeOffGrainBatch(selectedWriteOffBatch.id, {
        quantityTons: values.quantityTons,
        reason: values.reason,
        notes: values.notes,
        movementDate: new Date().toISOString(),
      });
      message.success(t.grain.writeOffSuccess);
      writeOffForm.resetFields();
      setSelectedWriteOffBatch(null);
      setWriteOffModalOpen(false);
      load();
      if (activeTab === 'ledger') loadLedger();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.grain.loadError);
    } finally {
      setSavingWriteOff(false);
    }
  };

  // ---- Movements history per batch ----
  const openMovementsModal = async (batch: GrainBatchDto) => {
    setMovementsModalOpen(true);
    setLoadingMovements(true);
    setMovementsBatchLabel(`${batch.grainType} — ${batch.quantityTons.toFixed(2)} т`);
    try {
      const data = await getGrainMovements(batch.id);
      setMovements(data);
    } catch {
      message.error(t.grain.loadError);
    } finally {
      setLoadingMovements(false);
    }
  };

  const ownershipLabel = (type: GrainOwnershipType): string => {
    const labels: Record<number, string> = {
      0: t.grain.ownershipOwn,
      1: t.grain.ownershipConsignment,
      2: t.grain.ownershipStorage,
      3: t.grain.ownershipOther,
    };
    return labels[type] ?? String(type);
  };

  const batchColumns = [
    { title: t.grain.grainType, dataIndex: 'grainType', key: 'grainType' },
    {
      title: t.grain.ownershipType, dataIndex: 'ownershipType', key: 'ownershipType',
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
    { title: t.grain.sourceField, dataIndex: 'sourceFieldName', key: 'sourceFieldName', render: (v?: string) => v || '—' },
    {
      title: t.grain.moisture, dataIndex: 'moisturePercent', key: 'moisturePercent',
      render: (v?: number) => v != null ? `${v.toFixed(1)}%` : '—',
    },
    {
      title: t.grain.qualityClass, dataIndex: 'qualityClass', key: 'qualityClass',
      render: (v?: number) => {
        if (v == null) return '—';
        const color = v <= 2 ? 'green' : v <= 4 ? 'gold' : 'red';
        return <Tag color={color}>{v}</Tag>;
      },
    },
    {
      title: t.grain.protein, dataIndex: 'proteinPercent', key: 'proteinPercent',
      render: (v?: number) => v != null ? `${v.toFixed(1)}%` : '—',
    },
    {
      title: t.grain.gluten, dataIndex: 'glutenPercent', key: 'glutenPercent',
      render: (v?: number) => v != null ? `${v.toFixed(1)}%` : '—',
    },
    {
      title: t.grain.impurity, dataIndex: 'impurityPercent', key: 'impurityPercent',
      render: (v?: number) => v != null ? `${v.toFixed(2)}%` : '—',
    },
    {
      title: t.grain.nature, dataIndex: 'naturePerLiter', key: 'naturePerLiter',
      render: (v?: number) => v != null ? String(v) : '—',
    },
    {
      title: t.grain.initialQuantity, dataIndex: 'initialQuantityTons', key: 'initialQuantityTons',
      render: (v: number) => `${v.toFixed(2)} т`,
    },
    {
      title: t.grain.quantityTons, dataIndex: 'quantityTons', key: 'quantityTons',
      render: (v: number) => `${v.toFixed(2)} т`,
    },
    {
      title: t.grain.pricePerTon, dataIndex: 'pricePerTon', key: 'pricePerTon',
      render: (v?: number) => v != null ? `${v.toFixed(2)}` : '—',
    },
    {
      title: t.grain.receivedDate, dataIndex: 'receivedDate', key: 'receivedDate',
      render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—',
    },
    {
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: GrainBatchDto) => (
        <Space wrap>
          <Button size="small" onClick={e => { e.stopPropagation(); openMovementsModal(record); }}>
            {t.common.details}
          </Button>
          {canCreate && (
            <>
              <Tooltip title={t.grain.splitBatch}>
                <Button size="small" icon={<ScissorOutlined />} onClick={e => { e.stopPropagation(); openSplitModal(record); }} />
              </Tooltip>
              <Tooltip title={t.grain.adjustBatch}>
                <Button size="small" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); openAdjustModal(record); }} />
              </Tooltip>
              <Tooltip title={t.grain.writeOffBatch}>
                <Button size="small" danger icon={<DeleteOutlined />} onClick={e => { e.stopPropagation(); openWriteOffModal(record); }} />
              </Tooltip>
            </>
          )}
        </Space>
      ),
    },
  ];

  const movementColumns = [
    {
      title: t.grain.movementDate, dataIndex: 'movementDate', key: 'movementDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: t.grain.movementType, dataIndex: 'movementType', key: 'movementType',
      render: (v: GrainMovementType) => <MovementTypeLabel type={v} t={t} />,
    },
    {
      title: t.grain.quantityTons, dataIndex: 'quantityTons', key: 'quantityTons',
      render: (v: number) => `${v.toFixed(4)} т`,
    },
    { title: t.grain.reason, dataIndex: 'reason', key: 'reason', render: (v?: string) => v || '—' },
    {
      title: t.grain.operationId, dataIndex: 'operationId', key: 'operationId',
      render: (v?: string) => v
        ? <Tooltip title={v}><Tag color="blue">{v.substring(0, 8)}…</Tag></Tooltip>
        : '—',
    },
    {
      title: t.grain.sourceStorage, dataIndex: 'sourceStorageName', key: 'sourceStorageName',
      render: (v?: string) => v || '—',
    },
    {
      title: t.grain.targetStorage, dataIndex: 'targetStorageName', key: 'targetStorageName',
      render: (v?: string) => v || '—',
    },
    { title: t.grain.createdBy, dataIndex: 'createdBy', key: 'createdBy', render: (v?: string) => v || '—' },
  ];

  const batches = result?.items ?? [];
  const totalTons = batches.reduce((s, b) => s + b.quantityTons, 0);
  const totalValue = batches.reduce((s, b) => s + b.quantityTons * (b.pricePerTon || 0), 0);
  const cultures = [...new Set(batches.map(b => b.grainType))];
  const { Text } = Typography;

  const batchOptions = (result?.items ?? []).map(b => ({
    value: b.id,
    label: `${b.grainType} — ${b.quantityTons.toFixed(2)} т (${ownershipLabel(b.ownershipType)})`,
  }));

  const movementTypeOptions = [
    { value: 'Receipt', label: t.grain.typeReceipt },
    { value: 'Transfer', label: t.grain.typeTransfer },
    { value: 'Split', label: t.grain.typeSplit },
    { value: 'Merge', label: t.grain.typeMerge },
    { value: 'Issue', label: t.grain.typeIssue },
    { value: 'SaleDispatch', label: t.grain.typeSaleDispatch },
    { value: 'Adjustment', label: t.grain.typeAdjustment },
    { value: 'WriteOff', label: t.grain.typeWriteOff },
  ];

  return (
    <div>
      <PageHeader
        title={t.grain.title}
        subtitle={t.grain.subtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.storageLogistics, path: '/warehouses' }, { label: t.nav.grainBatches }]} />}
      />
      {!loading && storages.length === 0 && (
        <Alert
          type="warning"
          showIcon
          className={s.spaced}
          message={t.grainStorages.noStorages}
          description={t.grainStorages.noStoragesHint}
          action={
            <Button size="small" type="primary" onClick={() => navigate('/grain-storages')}>
              {t.grainStorages.create}
            </Button>
          }
        />
      )}
      <Row gutter={12} className={s.spaced}>
        <Col span={8}>
          <Card size="small" className={s.bg}>
            <Text type="secondary" className={s.upper}>Загальний обсяг</Text>
            <div className={s.text24}>{totalTons.toFixed(1)} т</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className={s.bg}>
            <Text type="secondary" className={s.upper}>Загальна вартість</Text>
            <div className={s.text24}>{fmt(totalValue, { fractionDigits: 0 })}</div>
          </Card>
        </Col>
        <Col span={8}>
          <Card size="small" className={s.bg}>
            <Text type="secondary" className={s.upper}>Культур</Text>
            <div className={s.text24}>{cultures.length}</div>
          </Card>
        </Col>
      </Row>

      {/* Filters & Actions */}
      <Space className={s.spaced} wrap>
        {storages.length > 1 && (
          <Select
            allowClear
            placeholder={t.grain.selectStorage}
            className={s.block12}
            options={storages.map(s => ({ value: s.id, label: s.name }))}
            onChange={v => { setSelectedStorageId(v); setPage(1); }}
          />
        )}
        <Select
          allowClear
          placeholder={t.grain.ownershipType}
          className={s.block13}
          options={ownershipOptions(t)}
          value={filterOwnership}
          onChange={v => { setFilterOwnership(v); setPage(1); }}
        />
        {canCreate && (
          <>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className={s.colored}
              onClick={openBatchModal}
            >
              {t.grain.receiveGrain}
            </Button>
            <Button
              icon={<ExportOutlined />}
              className={s.colored1}
              onClick={openIssueModal}
            >
              {t.grain.issueGrain}
            </Button>
            <Button
              icon={<SwapOutlined />}
              onClick={() => { transferForm.resetFields(); setTransferModalOpen(true); }}
            >
              {t.grain.transferGrain}
            </Button>
          </>
        )}
        <Button
          icon={<DownloadOutlined />}
          onClick={() => exportToCsv('grain-batches', result?.items ?? [], [
            { key: 'grainType', title: t.grain.grainType },
            { key: 'sourceFieldName', title: t.grain.sourceField },
            { key: 'moisturePercent', title: t.grain.moisture },
            { key: 'qualityClass', title: t.grain.qualityClass },
            { key: 'proteinPercent', title: t.grain.protein },
            { key: 'glutenPercent', title: t.grain.gluten },
            { key: 'impurityPercent', title: t.grain.impurity },
            { key: 'grainImpurityPercent', title: t.grain.grainImpurity },
            { key: 'naturePerLiter', title: t.grain.nature },
            { key: 'initialQuantityTons', title: t.grain.initialQuantity },
            { key: 'quantityTons', title: t.grain.quantityTons },
            { key: 'pricePerTon', title: t.grain.pricePerTon },
            { key: 'receivedDate', title: t.grain.receivedDate },
          ])}
        >
          {t.common.export}
        </Button>
      </Space>

      {/* Main tabs: Batches | Ledger */}
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'batches',
            label: t.grain.batchList,
            children: (
              <DataTable
                dataSource={result?.items ?? []}
                columns={batchColumns}
                rowKey="id"
                loading={loading}
                pagination={{
                  current: page,
                  pageSize,
                  total: result?.totalCount ?? 0,
                  onChange: (p, ps) => { setPage(p); setPageSize(ps); },
                }}
                locale={{
                  emptyText: (
                    <EmptyState
                      message={t.grain.noBatches}
                      actionLabel={canCreate ? t.grain.receiveGrain : undefined}
                      onAction={canCreate ? openBatchModal : undefined}
                    />
                  ),
                }}
              />
            ),
          },
          {
            key: 'ledger',
            label: t.grain.ledger,
            children: (
              <>
                <Space className={s.spaced1} wrap>
                  <Select
                    allowClear
                    placeholder={t.grain.movementType}
                    className={s.block13}
                    options={movementTypeOptions}
                    value={ledgerTypeFilter}
                    onChange={v => { setLedgerTypeFilter(v); setLedgerPage(1); }}
                  />
                </Space>
                <DataTable
                  dataSource={ledgerResult?.items ?? []}
                  columns={[
                    {
                      title: t.grain.movementDate, dataIndex: 'movementDate', key: 'movementDate',
                      render: (v: string) => dayjs(v).format('DD.MM.YYYY HH:mm'),
                    },
                    { title: t.grain.grainType, dataIndex: 'grainType', key: 'grainType' },
                    { title: t.grain.storageName, dataIndex: 'storageName', key: 'storageName' },
                    {
                      title: t.grain.movementType, dataIndex: 'movementType', key: 'movementType',
                      render: (v: GrainMovementType) => <MovementTypeLabel type={v} t={t} />,
                    },
                    {
                      title: t.grain.quantityTons, dataIndex: 'quantityTons', key: 'quantityTons',
                      render: (v: number) => `${v.toFixed(4)} т`,
                    },
                    { title: t.grain.reason, dataIndex: 'reason', key: 'reason', render: (v?: string) => v || '—' },
                    {
                      title: t.grain.linkedOperation, dataIndex: 'operationId', key: 'operationId',
                      render: (v?: string) => v
                        ? <Tooltip title={v}><Tag color="blue">{v.substring(0, 8)}…</Tag></Tooltip>
                        : '—',
                    },
                    {
                      title: t.grain.sourceStorage, dataIndex: 'sourceStorageName', key: 'sourceStorageName',
                      render: (v?: string) => v || '—',
                    },
                    {
                      title: t.grain.targetStorage, dataIndex: 'targetStorageName', key: 'targetStorageName',
                      render: (v?: string) => v || '—',
                    },
                    { title: t.grain.createdBy, dataIndex: 'createdBy', key: 'createdBy', render: (v?: string) => v || '—' },
                  ]}
                  rowKey="id"
                  loading={ledgerLoading}
                  pagination={{
                    current: ledgerPage,
                    pageSize: ledgerPageSize,
                    total: ledgerResult?.totalCount ?? 0,
                    onChange: (p, ps) => { setLedgerPage(p); setLedgerPageSize(ps); },
                  }}
                  locale={{ emptyText: <EmptyState message={t.grain.noMovements} /> }}
                />
              </>
            ),
          },
        ]}
      />

      {/* ── Create Batch Modal ── */}
      <Modal
        title={t.grain.receiveGrain}
        open={batchModalOpen}
        onOk={handleCreateBatch}
        onCancel={() => { setBatchModalOpen(false); batchForm.resetFields(); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={savingBatch}
      >
        <Form form={batchForm} layout="vertical" className={s.spaced2}>
          <div className={s.spaced3}>
            <span className={s.text12}>{t.grain.quickSelect}: </span>
            {QUICK_GRAIN_TYPES.map(grain => (
              <Button key={grain} size="small" onClick={() => batchForm.setFieldsValue({ grainType: grain })} className={s.spaced4}>
                {grain}
              </Button>
            ))}
          </div>
          <Form.Item name="grainType" label={t.grain.grainType} rules={[{ required: true, message: t.common.required }]}>
            <AutoComplete
              options={grainTypes.map(g => ({ value: g, label: g }))}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              placeholder={t.grain.selectGrainType}
            />
          </Form.Item>
          <Form.Item name="grainStorageId" label={t.grain.selectStorage} rules={[{ required: true, message: t.common.required }]}>
            <Select
              showSearch
              placeholder={t.grain.selectStorage}
              options={storages.map(s => ({ value: s.id, label: s.name }))}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="ownershipType" label={t.grain.ownershipType} rules={[{ required: true, message: t.common.required }]}>
            <Select options={ownershipOptions(t)} />
          </Form.Item>
          <Form.Item name="ownerName" label={t.grain.ownerName}>
            <Input />
          </Form.Item>
          <Form.Item name="initialQuantityTons" label={t.grain.initialQuantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="pricePerTon" label={t.grain.pricePerTon}>
            <InputNumber min={0} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="contractNumber" label={t.grain.contractNumber}>
            <Input />
          </Form.Item>
          <Form.Item name="sourceFieldId" label={t.grain.sourceField}>
            <Select
              allowClear showSearch placeholder={t.grain.selectSourceField}
              options={fields.map(f => ({ value: f.id, label: f.name }))}
              optionFilterProp="label"
            />
          </Form.Item>
          <Form.Item name="moisturePercent" label={t.grain.moisture}>
            <InputNumber min={0} max={30} precision={1} addonAfter="%" className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="receivedDate" label={t.grain.receivedDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker className={s.fullWidth} />
          </Form.Item>
          <Collapse
            ghost
            items={[{
              key: 'quality',
              label: t.grain.qualitySectionTitle,
              children: (
                <Row gutter={12}>
                  <Col xs={24} sm={12}>
                    <Form.Item name="impurityPercent" label={t.grain.impurity}>
                      <InputNumber min={0} max={100} precision={2} addonAfter="%" className={s.fullWidth} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="grainImpurityPercent" label={t.grain.grainImpurity}>
                      <InputNumber min={0} max={100} precision={2} addonAfter="%" className={s.fullWidth} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="proteinPercent" label={t.grain.protein}>
                      <InputNumber min={0} max={100} precision={2} addonAfter="%" className={s.fullWidth} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="glutenPercent" label={t.grain.gluten}>
                      <InputNumber min={0} max={100} precision={2} addonAfter="%" className={s.fullWidth} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="naturePerLiter" label={t.grain.nature}>
                      <InputNumber min={400} max={900} className={s.fullWidth} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} sm={12}>
                    <Form.Item name="qualityClass" label={t.grain.qualityClass} tooltip={t.grain.qualityClassHint}>
                      <Select allowClear options={[1,2,3,4,5,6].map(n => ({ value: n, label: String(n) }))} />
                    </Form.Item>
                  </Col>
                </Row>
              ),
            }]}
          />
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Issue Grain Modal ── */}
      <Modal
        title={t.grain.issueGrain}
        open={issueModalOpen}
        onOk={handleIssueGrain}
        onCancel={() => { setIssueModalOpen(false); issueForm.resetFields(); setSelectedIssueBatch(null); }}
        okText={t.common.confirm}
        cancelText={t.common.cancel}
        confirmLoading={savingIssue}
      >
        <Form form={issueForm} layout="vertical" className={s.spaced2}>
          <Form.Item name="grainBatchId" label={t.grain.selectBatch} rules={[{ required: true, message: t.common.required }]}>
            <Select
              showSearch placeholder={t.grain.selectBatch}
              options={batchOptions}
              onChange={(val) => {
                const batch = (result?.items ?? []).find(b => b.id === val);
                setSelectedIssueBatch(batch ?? null);
              }}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
            />
          </Form.Item>
          {selectedIssueBatch && (
            <Alert type="info" message={`${t.grain.available}: ${selectedIssueBatch.quantityTons.toFixed(3)} т`} className={s.spaced1} />
          )}
          <Form.Item name="quantityTons" label={t.grain.issueQuantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.001} max={selectedIssueBatch?.quantityTons} precision={3} addonAfter="т" className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="reason" label={t.grain.exportReason}>
            <Select allowClear options={[
              { value: 'sale', label: t.grain.reasonSale },
              { value: 'processing', label: t.grain.reasonProcessing },
              { value: 'transfer', label: t.grain.reasonTransfer },
              { value: 'other', label: t.grain.reasonOther },
            ]} />
          </Form.Item>
          <Form.Item name="pricePerTon" label={t.grain.exportPrice}>
            <InputNumber min={0} precision={2} addonAfter="₴/т" className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="buyerName" label={t.grain.buyer}>
            <Input placeholder="Назва покупця або отримувача" />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Transfer Modal ── */}
      <Modal
        title={t.grain.transferGrain}
        open={transferModalOpen}
        onOk={handleTransfer}
        onCancel={() => { setTransferModalOpen(false); transferForm.resetFields(); }}
        okText={t.common.confirm}
        cancelText={t.common.cancel}
        confirmLoading={savingTransfer}
      >
        <Form form={transferForm} layout="vertical" className={s.spaced2}>
          <Form.Item name="sourceBatchId" label={t.grain.sourceBatch} rules={[{ required: true, message: t.common.required }]}>
            <Select showSearch placeholder={t.grain.selectBatch} options={batchOptions}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
          </Form.Item>
          <Form.Item name="targetBatchId" label={t.grain.targetBatch} rules={[{ required: true, message: t.common.required }]}>
            <Select showSearch placeholder={t.grain.selectBatch} options={batchOptions}
              filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())} />
          </Form.Item>
          <Form.Item name="quantityTons" label={t.grain.issueQuantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.001} precision={3} addonAfter="т" className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Split Batch Modal ── */}
      <Modal
        title={`${t.grain.splitBatch}${selectedSplitBatch ? `: ${selectedSplitBatch.grainType}` : ''}`}
        open={splitModalOpen}
        onOk={handleSplit}
        onCancel={() => { setSplitModalOpen(false); splitForm.resetFields(); setSelectedSplitBatch(null); }}
        okText={t.common.confirm}
        cancelText={t.common.cancel}
        confirmLoading={savingSplit}
      >
        {selectedSplitBatch && (
          <Alert type="info" message={`${t.grain.available}: ${selectedSplitBatch.quantityTons.toFixed(3)} т`} className={s.spaced1} />
        )}
        <Form form={splitForm} layout="vertical" className={s.spaced5}>
          <Form.Item name="splitQuantityTons" label={t.grain.splitQuantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.001} max={selectedSplitBatch?.quantityTons} precision={3} addonAfter="т" className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="targetStorageId" label={t.grain.selectStorage}>
            <Select allowClear options={storages.map(s => ({ value: s.id, label: s.name }))} placeholder={t.grain.selectStorage} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Adjust Batch Modal ── */}
      <Modal
        title={`${t.grain.adjustBatch}${selectedAdjustBatch ? `: ${selectedAdjustBatch.grainType}` : ''}`}
        open={adjustModalOpen}
        onOk={handleAdjust}
        onCancel={() => { setAdjustModalOpen(false); adjustForm.resetFields(); setSelectedAdjustBatch(null); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={savingAdjust}
      >
        {selectedAdjustBatch && (
          <Alert type="info" message={`${t.grain.available}: ${selectedAdjustBatch.quantityTons.toFixed(3)} т`} className={s.spaced1} />
        )}
        <Form form={adjustForm} layout="vertical" className={s.spaced5}>
          <Form.Item name="adjustmentTons" label={t.grain.adjustmentTons} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber precision={3} addonAfter="т" className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="reason" label={t.grain.reason}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── WriteOff Batch Modal ── */}
      <Modal
        title={`${t.grain.writeOffBatch}${selectedWriteOffBatch ? `: ${selectedWriteOffBatch.grainType}` : ''}`}
        open={writeOffModalOpen}
        onOk={handleWriteOff}
        onCancel={() => { setWriteOffModalOpen(false); writeOffForm.resetFields(); setSelectedWriteOffBatch(null); }}
        okText={t.common.confirm}
        cancelText={t.common.cancel}
        confirmLoading={savingWriteOff}
        okButtonProps={{ danger: true }}
      >
        {selectedWriteOffBatch && (
          <Alert type="warning" message={`${t.grain.available}: ${selectedWriteOffBatch.quantityTons.toFixed(3)} т`} className={s.spaced1} />
        )}
        <Form form={writeOffForm} layout="vertical" className={s.spaced5}>
          <Form.Item name="quantityTons" label={t.grain.issueQuantity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.001} max={selectedWriteOffBatch?.quantityTons} precision={3} addonAfter="т" className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="reason" label={t.grain.reason}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* ── Movement History Modal (per batch) ── */}
      <Modal
        title={movementsBatchLabel || t.grain.batchList}
        open={movementsModalOpen}
        onCancel={() => setMovementsModalOpen(false)}
        footer={null}
        width={900}
      >
        <DataTable
          dataSource={movements}
          columns={movementColumns}
          rowKey="id"
          loading={loadingMovements}
          pagination={false}
          size="small"
          locale={{ emptyText: <EmptyState message={t.grain.noMovements} /> }}
        />
      </Modal>
    </div>
  );
}
