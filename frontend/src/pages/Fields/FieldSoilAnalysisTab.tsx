import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, DatePicker, Popconfirm, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSoilAnalyses, createSoilAnalysis, deleteSoilAnalysis } from '../../api/fields';
import type { SoilAnalysisDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';

interface Props {
  fieldId: string;
}

export default function FieldSoilAnalysisTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager', 'Agronomist']);
  const [data, setData] = useState<SoilAnalysisDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    getSoilAnalyses(fieldId, year)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId, year]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createSoilAnalysis(fieldId, {
        ...values,
        sampleDate: values.sampleDate ? values.sampleDate.toISOString() : undefined,
      });
      message.success(t.fields.addSuccess);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch {
      message.error(t.fields.addError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSoilAnalysis(fieldId, id);
      message.success(t.fields.deleteSuccess);
      load();
    } catch {
      message.error(t.fields.deleteError);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: undefined, label: t.fields.allYears },
    ...Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => ({ value: y, label: String(y) })),
  ];

  const columns = [
    { title: t.fields.year, dataIndex: 'year', key: 'year' },
    { title: t.fields.soilSampleDate, dataIndex: 'sampleDate', key: 'sampleDate', render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—' },
    { title: t.fields.soilPh, dataIndex: 'ph', key: 'ph', render: (v: number) => v ?? '—' },
    { title: t.fields.soilOrganicMatter, dataIndex: 'organicMatter', key: 'organicMatter', render: (v: number) => v != null ? `${v}%` : '—' },
    { title: t.fields.soilNitrogen, dataIndex: 'nitrogen', key: 'nitrogen', render: (v: number) => v ?? '—' },
    { title: t.fields.soilPhosphorus, dataIndex: 'phosphorus', key: 'phosphorus', render: (v: number) => v ?? '—' },
    { title: t.fields.soilPotassium, dataIndex: 'potassium', key: 'potassium', render: (v: number) => v ?? '—' },
    { title: t.fields.soilLabName, dataIndex: 'labName', key: 'labName', render: (v: string) => v || '—' },
    ...(canWrite ? [{
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: SoilAnalysisDto) => (
        <Popconfirm
          title="Видалити запис?"
          description="Цю дію неможливо скасувати"
          okText="Видалити"
          cancelText="Скасувати"
          okButtonProps={{ danger: true }}
          onConfirm={() => handleDelete(record.id)}
        >
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    }] : []),
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <span style={{ color: 'var(--agro-text-secondary)', fontSize: 13 }}>{t.fields.year}:</span>
        <select
          style={{ padding: '4px 8px', border: '1px solid var(--agro-border)', borderRadius: 6, background: 'var(--agro-bg-card)', color: 'var(--agro-text-primary)' }}
          value={year ?? ''}
          onChange={(e) => setYear(e.target.value ? Number(e.target.value) : undefined)}
        >
          {yearOptions.map((opt) => (
            <option key={opt.value ?? 'all'} value={opt.value ?? ''}>{opt.label}</option>
          ))}
        </select>
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t.fields.addSoilAnalysis}
          </Button>
        )}
      </Space>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: <EmptyState
            message={t.fields.noSoilAnalyses}
            actionLabel={canWrite ? t.fields.addSoilAnalysis : undefined}
            onAction={canWrite ? () => setModalOpen(true) : undefined}
          />,
        }}
      />

      <Modal
        title={t.fields.addSoilAnalysis}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.add}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }} initialValues={{ year: currentYear }}>
          <Form.Item name="year" label={t.fields.year} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="sampleDate" label={t.fields.soilSampleDate}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="ph" label={t.fields.soilPh}>
            <InputNumber min={0} max={14} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="organicMatter" label={t.fields.soilOrganicMatter}>
            <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} addonAfter="%" />
          </Form.Item>
          <Form.Item name="nitrogen" label={t.fields.soilNitrogen}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} addonAfter="мг/100г" />
          </Form.Item>
          <Form.Item name="phosphorus" label={t.fields.soilPhosphorus}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} addonAfter="мг/100г" />
          </Form.Item>
          <Form.Item name="potassium" label={t.fields.soilPotassium}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} addonAfter="мг/100г" />
          </Form.Item>
          <Form.Item name="sampleDepthCm" label={t.fields.soilSampleDepth}>
            <InputNumber min={0} style={{ width: '100%' }} addonAfter="см" />
          </Form.Item>
          <Form.Item name="labName" label={t.fields.soilLabName}>
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
