import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Select, DatePicker, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFieldSeedings, createFieldSeeding, deleteFieldSeeding } from '../../api/fields';
import type { FieldSeedingDto } from '../../types/field';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';

interface Props {
  fieldId: string;
  fieldArea?: number;
}

export default function FieldSeedingTab({ fieldId, fieldArea }: Props) {
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager', 'Agronomist']);
  const [data, setData] = useState<FieldSeedingDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    getFieldSeedings(fieldId, year)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId, year]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createFieldSeeding(fieldId, {
        ...values,
        seedingDate: values.seedingDate ? values.seedingDate.toISOString() : undefined,
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
      await deleteFieldSeeding(fieldId, id);
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
    { title: t.fields.cropName, dataIndex: 'cropName', key: 'cropName' },
    { title: t.fields.variety, dataIndex: 'variety', key: 'variety', render: (v: string) => v || '—' },
    { title: t.fields.seedingRate, dataIndex: 'seedingRateKgPerHa', key: 'seedingRateKgPerHa', render: (v: number) => v ?? '—' },
    { title: t.fields.totalSeed, dataIndex: 'totalSeedKg', key: 'totalSeedKg', render: (v: number) => v ?? '—' },
    { title: t.fields.seedingDate, dataIndex: 'seedingDate', key: 'seedingDate', render: (v: string) => v ? dayjs(v).format('DD.MM.YYYY') : '—' },
    { title: t.fields.year, dataIndex: 'year', key: 'year' },
    ...(canWrite ? [{
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: FieldSeedingDto) => (
        <DeleteConfirmButton
          title={t.common.confirm}
          onConfirm={() => handleDelete(record.id)}
        />
      ),
    }] : []),
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <span style={{ color: 'var(--agro-text-secondary)', fontSize: 13 }}>{t.fields.year}:</span>
        <Select
          style={{ width: 90 }}
          value={year}
          onChange={setYear}
          options={yearOptions}
          allowClear
          placeholder={t.fields.allYears}
        />
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t.fields.addSeeding}
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
            message={t.fields.noSeedings || 'Ще немає записів про посів'}
            actionLabel={canWrite ? t.fields.addSeeding : undefined}
            onAction={canWrite ? () => setModalOpen(true) : undefined}
          />,
        }}
      />

      <Modal
        title={t.fields.addSeeding}
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
          <Form.Item name="cropName" label={t.fields.cropName} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="variety" label={t.fields.variety}>
            <Input />
          </Form.Item>
          <Form.Item name="seedingRateKgPerHa" label={t.fields.seedingRate}>
            <InputNumber
              min={0}
              precision={4}
              style={{ width: '100%' }}
              onChange={(val) => {
                const area = fieldArea ?? 0;
                if (val != null && area > 0) {
                  form.setFieldsValue({ totalSeedKg: Math.round(Number(val) * area * 100) / 100 });
                }
              }}
            />
          </Form.Item>
          <Form.Item name="totalSeedKg" label={t.fields.totalSeed}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="seedingDate" label={t.fields.seedingDate}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
