import { useCallback, useEffect, useRef, useState } from 'react';
import { Table, Button, Space, Tag, Input, message, Popconfirm, Modal, Form, InputNumber, Segmented, Select, Spin } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, EyeOutlined, UnorderedListOutlined, GlobalOutlined, EditOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getFields, deleteField, createField, updateField } from '../../api/fields';
import { getCadastreParcel } from '../../api/cadastre';
import type { CadastreParcelResult } from '../../api/cadastre';
import type { FieldDto } from '../../types/field';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import FieldMap from '../../components/Map/FieldMap';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

export default function FieldsList() {
  const [result, setResult] = useState<PaginatedResult<FieldDto> | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [form] = Form.useForm();
  const [editRecord, setEditRecord] = useState<FieldDto | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editForm] = Form.useForm();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { hasRole } = useRole();

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

  const canCreate = hasRole(['Administrator', 'Manager']);
  const canDelete = hasRole(['Administrator', 'Manager']);
  const canEdit = hasRole(['Administrator', 'Manager']);

  const load = (p = page, ps = pageSize, s = search) => {
    setLoading(true);
    getFields({ page: p, pageSize: ps, search: s || undefined })
      .then(setResult)
      .catch(() => message.error(t.fields.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [page, pageSize]);

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    load(1, pageSize, value);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteField(id);
      message.success(t.fields.deleteSuccess);
      load();
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
      load();
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
      load();
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
      render: (v: string, r: FieldDto) => v ? <Tag color="green">{t.crops[v as keyof typeof t.crops] || v}{r.currentCropYear ? ` (${r.currentCropYear})` : ''}</Tag> : <Tag>{t.fields.notSeeded}</Tag>,
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
            <Popconfirm title={t.fields.deleteField} onConfirm={() => handleDelete(record.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.fields.title} subtitle={t.fields.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder={t.fields.searchPlaceholder}
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{ width: 320 }}
        />
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
          >
            {t.fields.addField}
          </Button>
        )}
        <Segmented
          value={viewMode}
          onChange={(v) => setViewMode(v as 'list' | 'map')}
          options={[
            { value: 'list', icon: <UnorderedListOutlined />, label: t.fields.listView },
            { value: 'map', icon: <GlobalOutlined />, label: t.fields.mapView },
          ]}
        />
      </Space>

      {viewMode === 'map' ? (
        <FieldMap fields={result?.items ?? []} height={500} />
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
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t.fields.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cadastralNumber" label={t.fields.cadastralNumber}>
            <Input
              placeholder="1810400000:00:022:0005"
              onChange={e => handleCadastralNumberChange(e.target.value)}
              suffix={cadastreLoading ? <Spin size="small" /> : <SearchOutlined style={{ color: '#484f58' }} />}
            />
          </Form.Item>
          {cadastreResult?.found && (
            <div style={{ marginBottom: 16, padding: '8px 12px', background: 'var(--agro-bg-input)', borderRadius: 6 }}>
              <div style={{ fontSize: 12, color: 'rgba(0,0,0,0.45)', marginBottom: 4 }}>
                {t.fields.cadastreInfo} — {t.fields.cadastreDataNote}
              </div>
              {cadastreResult.purpose && (
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'rgba(0,0,0,0.45)' }}>{t.fields.cadastrePurpose}: </span>
                  {cadastreResult.purpose}
                </div>
              )}
              {cadastreResult.ownership && (
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'rgba(0,0,0,0.45)' }}>{t.fields.cadastreOwnership}: </span>
                  {cadastreResult.ownership}
                </div>
              )}
              {cadastreResult.area && (
                <div style={{ fontSize: 13 }}>
                  <span style={{ color: 'rgba(0,0,0,0.45)'}}>{t.fields.area}: </span>
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
                  <span style={{ color: '#484f58', fontSize: 12, marginLeft: 8 }}>
                    ({t.fields.fromCadastre}: {cadastreArea} га)
                  </span>
                )}
              </span>
            }
            rules={[{ required: true, message: t.common.required }]}
          >
            <InputNumber min={0} step={0.01} precision={4} style={{ width: '100%' }} addonAfter="га" />
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
        <Form form={editForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="name" label={t.fields.name} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="cadastralNumber" label={t.fields.cadastralNumber}>
            <Input />
          </Form.Item>
          <Form.Item name="areaHectares" label={t.fields.area} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
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
              style={{ width: '100%' }}
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
