import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, DatePicker, Space, message } from 'antd';
import { PlusOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getSoilAnalyses, createSoilAnalysis, updateSoilAnalysis, deleteSoilAnalysis } from '../../api/fields';
import type { SoilAnalysisDto } from '../../types/field';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';

interface Props {
  fieldId: string;
}

export default function FieldSoilAnalysisTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const { hasPermission } = useRole();
  const canWrite = hasPermission('fields', 'manage');
  const [data, setData] = useState<SoilAnalysisDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    getSoilAnalyses(fieldId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId]);

  const openCreate = () => {
    setEditingId(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEdit = (record: SoilAnalysisDto) => {
    setEditingId(record.id);
    form.setFieldsValue({
      ...record,
      sampleDate: dayjs(record.sampleDate),
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const payload = {
        ...values,
        sampleDate: values.sampleDate.toISOString(),
        zoneId: values.zoneId || undefined,
      };
      if (editingId) {
        await updateSoilAnalysis(fieldId, editingId, payload);
      } else {
        await createSoilAnalysis(fieldId, payload);
      }
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

  const columns = [
    {
      title: t.fields.soilSampleDate,
      dataIndex: 'sampleDate',
      key: 'sampleDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: t.fields.soilPH,
      dataIndex: 'pH',
      key: 'pH',
      render: (v: number) => v ?? '—',
    },
    {
      title: t.fields.soilNitrogen,
      dataIndex: 'nitrogen',
      key: 'nitrogen',
      render: (v: number) => v ?? '—',
    },
    {
      title: t.fields.soilPhosphorus,
      dataIndex: 'phosphorus',
      key: 'phosphorus',
      render: (v: number) => v ?? '—',
    },
    {
      title: t.fields.soilPotassium,
      dataIndex: 'potassium',
      key: 'potassium',
      render: (v: number) => v ?? '—',
    },
    {
      title: t.fields.soilHumus,
      dataIndex: 'humus',
      key: 'humus',
      render: (v: number) => v ?? '—',
    },
    {
      title: t.fields.notes,
      dataIndex: 'notes',
      key: 'notes',
      render: (v: string) => v || '—',
    },
    ...(canWrite
      ? [
          {
            title: t.common.actions,
            key: 'actions',
            render: (_: unknown, record: SoilAnalysisDto) => (
              <Space>
                <Button size="small" icon={<EditOutlined />} onClick={() => openEdit(record)} />
                <DeleteConfirmButton
                  title={t.common.confirm}
                  onConfirm={() => handleDelete(record.id)}
                />
              </Space>
            ),
          },
        ]
      : []),
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={openCreate}>
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
          emptyText: (
            <EmptyState
              message={t.fields.noSoilAnalyses}
              actionLabel={canWrite ? t.fields.addSoilAnalysis : undefined}
              onAction={canWrite ? openCreate : undefined}
            />
          ),
        }}
      />

      <Modal
        title={editingId ? t.fields.editSoilAnalysis : t.fields.addSoilAnalysis}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="sampleDate"
            label={t.fields.soilSampleDate}
            rules={[{ required: true, message: t.common.required }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pH" label={t.fields.soilPH}>
            <InputNumber min={0} max={14} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="nitrogen" label={t.fields.soilNitrogen}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="phosphorus" label={t.fields.soilPhosphorus}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="potassium" label={t.fields.soilPotassium}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="humus" label={t.fields.soilHumus}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.fields.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
