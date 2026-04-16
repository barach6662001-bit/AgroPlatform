import { useCallback, useRef, useState } from 'react';
import { Button, Space, Tag, Input, message, Modal, Form, InputNumber, Select, Spin } from 'antd';
import { SearchOutlined, EyeOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { deleteField, createField, updateField } from '../../api/fields';
import { getCadastreParcel } from '../../api/cadastre';
import type { CadastreParcelResult } from '../../api/cadastre';
import type { FieldDto } from '../../types/field';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import FieldMap from '../../components/Map/FieldMap';
import TableSkeleton from '../../components/TableSkeleton';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { exportToCsv } from '../../utils/exportCsv';
import { getCropTagStyle } from '../../utils/cropTagColors';
import { useFieldsQuery } from '../../hooks/useFieldsQuery';
import { useAuthStore } from '../../stores/authStore';
import s from './FieldsList.module.css';
import DataTable from '../../components/ui/DataTable';
import FieldSidePanel from './components/FieldSidePanel';
import FieldCard from './components/FieldCard';
import FieldsToolbar from './components/FieldsToolbar';
import type { ViewMode } from './components/FieldsToolbar';

interface FieldDetailPanelProps {
  fieldName: string;
  fields: FieldDto[];
  t: ReturnType<typeof useTranslation>['t'];
}

function FieldDetailPanel({ fieldName, fields, t }: FieldDetailPanelProps) {
  const field = fields.find(f => f.name === fieldName);
  if (!field) {
    return (
      <div>
        <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{fieldName}</h3>
        <p style={{ fontSize: 13, color: '#6b7b9a' }}>{t.fields.noCoordinates}</p>
      </div>
    );
  }

  const ownershipLabels: Record<number, string> = {
    0: t.fields.ownershipOwnLand,
    1: t.fields.ownershipLease,
    2: t.fields.ownershipShareLease,
  };

  return (
    <div>
      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{field.name}</h3>
      <p style={{ fontSize: 13, color: '#6b7b9a', marginBottom: 20 }}>
        {field.soilType || t.fields.soilType}
      </p>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#111A2E', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#6b7b9a', marginBottom: 4 }}>{t.fields.area.toUpperCase()}</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>{field.areaHectares} га</div>
        </div>
        <div style={{ background: '#111A2E', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#6b7b9a', marginBottom: 4 }}>{t.fields.currentCrop.toUpperCase()}</div>
          <div style={{ fontSize: 18, fontWeight: 600 }}>
            {field.currentCrop ? (t.crops[field.currentCrop as keyof typeof t.crops] || field.currentCrop) : '—'}
          </div>
        </div>
        <div style={{ background: '#111A2E', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#6b7b9a', marginBottom: 4 }}>{t.fields.ownershipType.toUpperCase()}</div>
          <div style={{ fontSize: 14 }}>{ownershipLabels[field.ownershipType] ?? '—'}</div>
        </div>
        <div style={{ background: '#111A2E', borderRadius: 8, padding: 12 }}>
          <div style={{ fontSize: 11, color: '#6b7b9a', marginBottom: 4 }}>{t.fields.cadastralNumber.toUpperCase()}</div>
          <div style={{ fontSize: 12, fontFamily: 'monospace' }}>{field.cadastralNumber || '—'}</div>
        </div>
      </div>

      {/* NDVI placeholder */}
      <div style={{
        background: '#111A2E',
        borderRadius: 8,
        padding: 16,
        marginBottom: 16,
        border: '1px dashed #253350',
      }}>
        <div style={{ fontSize: 12, color: '#6b7b9a', marginBottom: 8 }}>{t.fields.ndviIndex}</div>
        <div style={{ fontSize: 24, fontWeight: 600, color: '#22C55E' }}>0.72</div>
        <div style={{ fontSize: 11, color: '#6b7b9a' }}>{t.fields.ndviStatusGood} · {t.fields.ndviUpdated}</div>
        {/* Color bar */}
        <div style={{
          marginTop: 8,
          height: 6,
          borderRadius: 3,
          background: 'linear-gradient(90deg, #EF4444 0%, #F59E0B 30%, #22C55E 60%, #065F46 100%)',
          position: 'relative',
        }}>
          <div style={{
            position: 'absolute',
            left: '72%',
            top: -3,
            width: 12,
            height: 12,
            borderRadius: '50%',
            background: '#22C55E',
            border: '2px solid #060B14',
          }} />
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <a href={`/fields/${field.id}`} style={{
          flex: 1,
          textAlign: 'center',
          padding: '8px 16px',
          background: 'rgba(34, 197, 94, 0.1)',
          color: '#22C55E',
          borderRadius: 8,
          border: '1px solid rgba(34, 197, 94, 0.2)',
          fontSize: 13,
          textDecoration: 'none',
        }}>
          {t.fields.details} →
        </a>
      </div>
    </div>
  );
}

export default function FieldsList() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('map');
  const [form] = Form.useForm();
  const [editRecord, setEditRecord] = useState<FieldDto | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm] = Form.useForm();
  const [selectedField, setSelectedField] = useState<string | undefined>(undefined);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasPermission } = useRole();
  const queryClient = useQueryClient();
  const { tenantId } = useAuthStore();

  const { data: result, isFetching: loading, isLoading } = useFieldsQuery({ page, pageSize, search: search || undefined });
  const cropOptions = (['Wheat', 'Corn', 'Sunflower', 'Soybean', 'Barley', 'Rapeseed', 'SugarBeet', 'Fallow', 'Other'] as const)
    .map(v => ({ value: v, label: t.crops[v] }));

  // Cadastre auto-fill for create form
  const [cadastreLoading, setCadastreLoading] = useState(false);
  const [cadastreResult, setCadastreResult] = useState<CadastreParcelResult | null>(null);
  const [cadastreArea, setCadastreArea] = useState<number | null>(null);
  const cadastreTimer = useRef<ReturnType<typeof setTimeout>>();
  const handleCadastralNumberChange = useCallback((value: string) => {
    clearTimeout(cadastreTimer.current);
    setCadastreArea(null);
    setCadastreResult(null);
    if (!value || value.length < 10) return;
    const cadnum = value.replace(/\s/g, '');
    if (!/^\d{10}:\d{2}:\d{3}:\d{4}$/.test(cadnum)) return;
    cadastreTimer.current = setTimeout(async () => {
      setCadastreLoading(true);
      try {
        const result = await getCadastreParcel(cadnum);
        setCadastreResult(result);
        if (result.found && result.area) {
          const parsedArea = parseFloat(parseFloat(result.area).toFixed(4));
          setCadastreArea(parsedArea);
          const currentArea = form.getFieldValue('areaHectares');
          if (!currentArea || currentArea === 0) {
            form.setFieldsValue({ areaHectares: parsedArea });
            message.info(t.fields.areaAutoFilled);
          }
        } else if (!result.found) {
          message.warning(t.fields.cadastreNotFound);
        }
      } catch {
        // silently ignore — cadastre unavailable
      } finally {
        setCadastreLoading(false);
      }
    }, 800);
  }, [form, t]);

  const canCreate = hasPermission('fields', 'manage');
  const canDelete = hasPermission('fields', 'manage');
  const canEdit = hasPermission('fields', 'manage');

  const invalidateFields = () =>
    queryClient.invalidateQueries({ queryKey: ['fields', tenantId] });

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteField(id);
      message.success(t.fields.deleteSuccess);
      invalidateFields();
    } catch {
      message.error(t.fields.deleteError);
    }
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createField(values);
      message.success(t.fields.createSuccess);
      form.resetFields();
      setModalOpen(false);
      invalidateFields();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        // axios interceptor already shows the conflict notification
        return;
      }
      if (status) {
        message.error(t.fields.createError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = async () => {
    if (!editRecord) return;
    try {
      const values = await editForm.validateFields();
      setEditSaving(true);
      await updateField(editRecord.id, values);
      message.success(t.fields.fieldUpdated);
      editForm.resetFields();
      setEditModalOpen(false);
      setEditRecord(null);
      invalidateFields();
    } catch {
      message.error(t.fields.fieldUpdateError);
    } finally {
      setEditSaving(false);
    }
  };

  const columns = [
    { title: t.fields.name, dataIndex: 'name', key: 'name', sorter: (a: FieldDto, b: FieldDto) => a.name.localeCompare(b.name) },
    { title: t.fields.cadastralNumber, dataIndex: 'cadastralNumber', key: 'cadastralNumber', render: (v: string) => v || '—' },
    { title: t.fields.area, dataIndex: 'areaHectares', key: 'areaHectares', sorter: (a: FieldDto, b: FieldDto) => a.areaHectares - b.areaHectares, render: (v: number) => v.toFixed(2) },
    { title: t.fields.soilType, dataIndex: 'soilType', key: 'soilType', render: (v: string) => v || '—' },
    {
      title: t.fields.currentCrop, dataIndex: 'currentCrop', key: 'currentCrop',
      render: (v: string, r: FieldDto) => v ? <Tag style={getCropTagStyle(t.crops[v as keyof typeof t.crops] || v)}>{t.crops[v as keyof typeof t.crops] || v}{r.currentCropYear ? ` (${r.currentCropYear})` : ''}</Tag> : <Tag>{t.fields.notSeeded}</Tag>,
    },
    {
      title: t.fields.ownershipType,
      dataIndex: 'ownershipType',
      key: 'ownershipType',
      render: (v: number) => {
        const colors: Record<number, string> = { 0: 'blue', 1: 'orange', 2: 'purple' };
        const labels: Record<number, string> = {
          0: t.fields.ownershipOwnLand,
          1: t.fields.ownershipLease,
          2: t.fields.ownershipShareLease,
        };
        return <Tag color={colors[v] ?? 'default'}>{labels[v] ?? '—'}</Tag>;
      },
      filters: [
        { text: t.fields.ownershipOwnLand, value: 0 },
        { text: t.fields.ownershipLease, value: 1 },
        { text: t.fields.ownershipShareLease, value: 2 },
      ],
      onFilter: (value: unknown, record: FieldDto) => record.ownershipType === value,
    },
    {
      title: t.fields.actions, key: 'actions',
      render: (_: unknown, record: FieldDto) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/fields/${record.id}`)}>{t.fields.details}</Button>
          {canEdit && (
            <Button
              size="small"
              icon={<EditOutlined />}
              onClick={() => { setEditRecord(record); editForm.setFieldsValue({ ...record, currentCrop: record.currentCrop ?? undefined, currentCropYear: record.currentCropYear ?? new Date().getFullYear() }); setEditModalOpen(true); }}
            />
          )}
          {canDelete && (
            <DeleteConfirmButton
              title={t.fields.deleteField}
              description={t.fields.deleteCannotBeUndone}
              onConfirm={() => handleDelete(record.id)}
            />
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.fields.title} subtitle={t.fields.subtitle} breadcrumbs={<Breadcrumbs items={[{ label: t.nav.fields }]} />} />

      <FieldsToolbar
        search={search}
        onSearchChange={handleSearchChange}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        canCreate={canCreate}
        onAdd={() => setModalOpen(true)}
        onExport={() => exportToCsv('fields', result?.items ?? [], [
          { key: 'name', title: t.fields.name },
          { key: 'cadastralNumber', title: t.fields.cadastralNumber },
          { key: 'areaHectares', title: t.fields.area },
          { key: 'currentCrop', title: t.fields.currentCrop },
          { key: 'soilType', title: t.fields.soilType },
        ])}
        loading={loading}
        addLabel={t.fields.addField}
        exportLabel={t.common.export}
      />

      {viewMode === 'map' ? (
        <div style={{ display: 'flex', gap: 16, height: 'calc(100vh - 200px)' }}>
          {/* Map — 65% */}
          <div style={{ flex: '0 0 65%' }}>
            <FieldMap
              fields={result?.items ?? []}
              height="100%"
              onFieldClick={setSelectedField}
              selectedField={selectedField}
            />
          </div>
          {/* Premium side panel — 35% */}
          <div style={{
            flex: '0 0 35%',
            background: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border)',
            padding: 20,
            overflowY: 'auto',
          }}>
            <FieldSidePanel
              fieldName={selectedField}
              fields={result?.items ?? []}
              onEdit={(field) => {
                setEditRecord(field);
                editForm.setFieldsValue({ ...field, currentCrop: field.currentCrop ?? undefined, currentCropYear: field.currentCropYear ?? new Date().getFullYear() });
                setEditModalOpen(true);
              }}
            />
          </div>
        </div>

      ) : viewMode === 'grid' ? (
        isLoading ? (
          <TableSkeleton rows={8} />
        ) : (
          <div className={s.cardGrid}>
            {(result?.items ?? []).map(field => (
              <FieldCard key={field.id} field={field} />
            ))}
          </div>
        )

      ) : isLoading ? (
        <TableSkeleton rows={8} />
      ) : (
        <DataTable
          dataSource={result?.items ?? []}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total: result?.totalCount ?? 0,
            showTotal: (total) => t.fields.total.replace('{{count}}', String(total)),
            onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          }}
        />
      )}

      <Modal
        title={t.fields.createField}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); setCadastreArea(null); setCadastreResult(null); }}
        okText={t.common.create}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" className={s.spaced1}>
          <Form.Item name="name" label={t.fields.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cadastralNumber" label={t.fields.cadastralNumber}>
            <Input
              placeholder="1810400000:00:022:0005"
              onChange={e => handleCadastralNumberChange(e.target.value)}
              suffix={cadastreLoading ? <Spin size="small" /> : <SearchOutlined className={s.colored} />}
            />
          </Form.Item>
          {cadastreResult?.found && (
            <div className={s.spaced2}>
              <div className={s.text12}>
                {t.fields.cadastreInfo} — {t.fields.cadastreDataNote}
              </div>
              {cadastreResult.purpose && (
                <div className={s.text13}>
                  <span className={s.colored1}>{t.fields.cadastrePurpose}: </span>
                  {cadastreResult.purpose}
                </div>
              )}
              {cadastreResult.ownership && (
                <div className={s.text13}>
                  <span className={s.colored1}>{t.fields.cadastreOwnership}: </span>
                  {cadastreResult.ownership}
                </div>
              )}
              {cadastreResult.area && (
                <div className={s.text13}>
                  <span className={s.colored1}>{t.fields.area}: </span>
                  {cadastreResult.area} га
                </div>
              )}
            </div>
          )}
          <Form.Item
            name="areaHectares"
            label={
              <span>
                {t.fields.area}
                {cadastreArea && (
                  <span className={s.text121}>
                    ({t.fields.fromCadastre}: {cadastreArea} га)
                  </span>
                )}
              </span>
            }
            rules={[{ required: true, message: t.common.required }]}
          >
            <InputNumber min={0} step={0.01} precision={4} className={s.fullWidth} addonAfter="га" />
          </Form.Item>
          <Form.Item name="soilType" label={t.fields.soilType}>
            <Select
              allowClear
              placeholder={t.fields.selectSoilType || 'Виберіть тип ґрунту'}
              options={[
                { value: 'Чорнозем', label: t.fields.soilBlackEarth || 'Чорнозем' },
                { value: 'Суглинок', label: t.fields.soilLoam || 'Суглинок' },
                { value: 'Супісок', label: t.fields.soilSandyLoam || 'Супісок' },
                { value: 'Пісок', label: t.fields.soilSand || 'Пісок' },
                { value: 'Глина', label: t.fields.soilClay || 'Глина' },
                { value: 'Торф', label: t.fields.soilPeat || 'Торф' },
              ]}
            />
          </Form.Item>
          <Form.Item name="ownershipType" label={t.fields.ownershipType} initialValue={0}>
            <Select>
              <Select.Option value={0}>{t.fields.ownershipOwnLand}</Select.Option>
              <Select.Option value={1}>{t.fields.ownershipLease}</Select.Option>
              <Select.Option value={2}>{t.fields.ownershipShareLease}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="notes" label={t.fields.notes}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={t.fields.editField}
        open={editModalOpen}
        onOk={handleEdit}
        onCancel={() => { editForm.resetFields(); setEditModalOpen(false); setEditRecord(null); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={editSaving}
      >
        <Form form={editForm} layout="vertical" className={s.spaced1}>
          <Form.Item name="name" label={t.fields.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cadastralNumber" label={t.fields.cadastralNumber}>
            <Input />
          </Form.Item>
          <Form.Item name="areaHectares" label={t.fields.area} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} step={0.01} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="soilType" label={t.fields.soilType}>
            <Select
              allowClear
              placeholder={t.fields.selectSoilType || 'Виберіть тип ґрунту'}
              options={[
                { value: 'Чорнозем', label: t.fields.soilBlackEarth || 'Чорнозем' },
                { value: 'Суглинок', label: t.fields.soilLoam || 'Суглинок' },
                { value: 'Супісок', label: t.fields.soilSandyLoam || 'Супісок' },
                { value: 'Пісок', label: t.fields.soilSand || 'Пісок' },
                { value: 'Глина', label: t.fields.soilClay || 'Глина' },
                { value: 'Торф', label: t.fields.soilPeat || 'Торф' },
              ]}
            />
          </Form.Item>
          <Form.Item name="ownershipType" label={t.fields.ownershipType} initialValue={0}>
            <Select>
              <Select.Option value={0}>{t.fields.ownershipOwnLand}</Select.Option>
              <Select.Option value={1}>{t.fields.ownershipLease}</Select.Option>
              <Select.Option value={2}>{t.fields.ownershipShareLease}</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="currentCrop" label={t.fields.currentCrop}>
            <Select allowClear placeholder={t.fields.notSeeded} options={cropOptions} />
          </Form.Item>
          <Form.Item name="currentCropYear" label={t.fields.cropYear}>
            <InputNumber
              min={2000}
              max={new Date().getFullYear() + 1}
              className={s.fullWidth}
              placeholder={String(new Date().getFullYear())}
            />
          </Form.Item>
          <Form.Item name="notes" label={t.fields.notes}>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
