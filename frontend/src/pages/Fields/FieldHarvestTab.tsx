import { useEffect, useState } from 'react';
import { Button, Table, Modal, Form, Input, InputNumber, Select, DatePicker, Popconfirm, Space, message } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFieldHarvests, createFieldHarvest, deleteFieldHarvest } from '../../api/fields';
import type { FieldHarvestDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

interface Props {
  fieldId: string;
}

export default function FieldHarvestTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager', 'Agronomist']);
  const [data, setData] = useState<FieldHarvestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    setLoading(true);
    getFieldHarvests(fieldId, year)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId, year]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createFieldHarvest(fieldId, {
        ...values,
        harvestDate: values.harvestDate.toISOString(),
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
      await deleteFieldHarvest(fieldId, id);
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
    { title: t.fields.totalTons, dataIndex: 'totalTons', key: 'totalTons', render: (v: number) => v.toFixed(2) },
    { title: t.fields.yieldPerHaLabel, dataIndex: 'yieldTonsPerHa', key: 'yieldTonsPerHa', render: (v: number) => v ? v.toFixed(2) : '—' },
    { title: t.fields.moisture, dataIndex: 'moisturePercent', key: 'moisturePercent', render: (v: number) => v != null ? `${v}%` : '—' },
    { title: t.fields.pricePerTon, dataIndex: 'pricePerTon', key: 'pricePerTon', render: (v: number) => v ?? '—' },
    { title: t.fields.totalRevenue, dataIndex: 'totalRevenue', key: 'totalRevenue', render: (v: number) => v ? v.toLocaleString('uk-UA', { maximumFractionDigits: 2 }) : '—' },
    { title: t.fields.harvestDate, dataIndex: 'harvestDate', key: 'harvestDate', render: (v: string) => dayjs(v).format('DD.MM.YYYY') },
    ...(canWrite ? [{
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: FieldHarvestDto) => (
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
            {t.fields.addHarvest}
          </Button>
        )}
      </Space>
      <Table dataSource={data} columns={columns} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} locale={{ emptyText: t.common.noData }} />

      <Modal
        title={t.fields.addHarvest}
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
          <Form.Item name="totalTons" label={t.fields.totalTons} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="moisturePercent" label={t.fields.moisture}>
            <InputNumber min={0} max={100} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pricePerTon" label={t.fields.pricePerTon}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="harvestDate" label={t.fields.harvestDate} rules={[{ required: true, message: t.common.required }]}>
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
