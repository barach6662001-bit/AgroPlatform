import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Select, DatePicker, Popconfirm, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFieldFertilizers, createFieldFertilizer, deleteFieldFertilizer } from '../../api/fields';
import type { FieldFertilizerDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

interface Props {
  fieldId: string;
}

export default function FieldFertilizerTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager', 'Agronomist']);
  const [data, setData] = useState<FieldFertilizerDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    getFieldFertilizers(fieldId, year)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId, year]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createFieldFertilizer(fieldId, {
        ...values,
        applicationDate: values.applicationDate.toISOString(),
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
      await deleteFieldFertilizer(fieldId, id);
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

  const appTypeOptions = [
    { value: 'Основне', label: t.fields.mainFertilizer },
    { value: 'Підживлення', label: t.fields.topDressing },
  ];

  const columns = [
    { title: t.fields.fertilizerName, dataIndex: 'fertilizerName', key: 'fertilizerName' },
    { title: t.fields.applicationType, dataIndex: 'applicationType', key: 'applicationType', render: (v: string) => v || '—' },
    { title: t.fields.rateKgPerHa, dataIndex: 'rateKgPerHa', key: 'rateKgPerHa', render: (v: number) => v ?? '—' },
    { title: 'Всього (кг)', dataIndex: 'totalKg', key: 'totalKg', render: (v: number) => v ?? '—' },
    { title: t.fields.pricePerTon, dataIndex: 'costPerKg', key: 'costPerKg', render: (v: number) => v ?? '—' },
    { title: t.fields.totalRevenue, dataIndex: 'totalCost', key: 'totalCost', render: (v: number) => v ?? '—' },
    { title: t.fields.applicationDate, dataIndex: 'applicationDate', key: 'applicationDate', render: (v: string) => dayjs(v).format('DD.MM.YYYY') },
    ...(canWrite ? [{
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: FieldFertilizerDto) => (
        <Popconfirm title={t.common.confirm} onConfirm={() => handleDelete(record.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    }] : []),
  ];

  return (
    <div>
      <Space style={{ marginBottom: 12 }}>
        <Select
          style={{ width: 120 }}
          value={year}
          onChange={setYear}
          options={yearOptions}
        />
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t.fields.addFertilizer}
          </Button>
        )}
      </Space>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} locale={{ emptyText: t.common.noData }} />

      <Modal
        title={t.fields.addFertilizer}
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
          <Form.Item name="fertilizerName" label={t.fields.fertilizerName} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="applicationType" label={t.fields.applicationType}>
            <Select options={appTypeOptions} allowClear />
          </Form.Item>
          <Form.Item name="rateKgPerHa" label={t.fields.rateKgPerHa}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalKg" label="Всього (кг)">
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="costPerKg" label="Ціна (грн/кг)">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="totalCost" label="Сума (грн)">
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="applicationDate" label={t.fields.applicationDate} rules={[{ required: true, message: t.common.required }]}>
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
