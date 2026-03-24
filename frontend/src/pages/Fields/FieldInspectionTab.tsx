import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, Select, DatePicker, Popconfirm, Space, message, Tag } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFieldInspections, createFieldInspection, deleteFieldInspection } from '../../api/fields';
import type { FieldInspectionDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';

interface Props {
  fieldId: string;
}

const severityColor: Record<string, string> = {
  Low: 'green',
  Medium: 'orange',
  High: 'red',
};

export default function FieldInspectionTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager', 'Agronomist']);
  const [data, setData] = useState<FieldInspectionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    getFieldInspections(fieldId)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createFieldInspection(fieldId, {
        ...values,
        date: values.date ? values.date.toISOString() : new Date().toISOString(),
      });
      message.success(t.fields.inspectionCreated);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch {
      message.error(t.fields.inspectionCreateError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFieldInspection(fieldId, id);
      message.success(t.fields.inspectionDeleted);
      load();
    } catch {
      message.error(t.fields.inspectionDeleteError);
    }
  };

  const columns = [
    {
      title: t.fields.inspectionDate,
      dataIndex: 'date',
      key: 'date',
      render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—',
    },
    {
      title: t.fields.inspectorName,
      dataIndex: 'inspectorName',
      key: 'inspectorName',
    },
    {
      title: t.fields.severity,
      dataIndex: 'severity',
      key: 'severity',
      render: (v: string) =>
        v ? <Tag color={severityColor[v] ?? 'default'}>{(t.fields as Record<string, string>)[`severity${v}`] ?? v}</Tag> : '—',
    },
    {
      title: t.common.notes,
      dataIndex: 'notes',
      key: 'notes',
      render: (v: string) => v || '—',
    },
    {
      title: t.fields.photoUrl,
      dataIndex: 'photoUrl',
      key: 'photoUrl',
      render: (v: string) =>
        v ? <a href={v} target="_blank" rel="noreferrer">{t.fields.photoUrl}</a> : '—',
    },
    ...(canWrite
      ? [
          {
            title: t.common.actions,
            key: 'actions',
            render: (_: unknown, record: FieldInspectionDto) => (
              <Popconfirm
                title={t.common.confirm}
                okText={t.common.delete}
                cancelText={t.common.cancel}
                okButtonProps={{ danger: true }}
                onConfirm={() => handleDelete(record.id)}
              >
                <Button size="small" danger icon={<DeleteOutlined />} />
              </Popconfirm>
            ),
          },
        ]
      : []),
  ];

  const severityOptions = [
    { value: 'Low', label: t.fields.severityLow },
    { value: 'Medium', label: t.fields.severityMedium },
    { value: 'High', label: t.fields.severityHigh },
  ];

  return (
    <div>
      {canWrite && (
        <Space style={{ marginBottom: 12 }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t.fields.addInspection}
          </Button>
        </Space>
      )}

      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: (
            <EmptyState
              message={t.fields.noInspections}
              actionLabel={canWrite ? t.fields.addInspection : undefined}
              onAction={canWrite ? () => setModalOpen(true) : undefined}
            />
          ),
        }}
      />

      <Modal
        title={t.fields.addInspection}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.add}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="date"
            label={t.fields.inspectionDate}
            rules={[{ required: true, message: t.common.required }]}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="inspectorName"
            label={t.fields.inspectorName}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Input />
          </Form.Item>
          <Form.Item name="severity" label={t.fields.severity}>
            <Select options={severityOptions} allowClear />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="photoUrl" label={t.fields.photoUrl}>
            <Input placeholder="https://..." />
          </Form.Item>
          <Form.Item name="latitude" label={t.fields.latitude}>
            <Input type="number" step="any" />
          </Form.Item>
          <Form.Item name="longitude" label={t.fields.longitude}>
            <Input type="number" step="any" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
