import { useEffect, useState } from 'react';
import { Button, Modal, Form, Input, InputNumber, Select, DatePicker, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getFieldProtections, createFieldProtection, deleteFieldProtection } from '../../api/fields';
import { getWarehouseItemsByCategory } from '../../api/warehouses';
import type { FieldProtectionDto } from '../../types/field';
import type { WarehouseItemDto } from '../../types/warehouse';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { useTranslation } from '../../i18n';
import { useCurrencySymbol } from '../../hooks/useFormatCurrency';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';
import s from './FieldProtectionTab.module.css';
import DataTable from '../../components/ui/DataTable';

interface Props {
  fieldId: string;
  fieldArea?: number;
}

export default function FieldProtectionTab({ fieldId, fieldArea }: Props) {
  const { t } = useTranslation();
  const currencySymbol = useCurrencySymbol();
  const { hasPermission } = useRole();
  const canWrite = hasPermission('fields', 'manage');
  const [data, setData] = useState<FieldProtectionDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItemDto[]>([]);

  useEffect(() => {
    getWarehouseItemsByCategory('Pesticides')
      .then((r) => setWarehouseItems(r.items))
      .catch(() => {});
  }, []);

  const load = () => {
    setLoading(true);
    getFieldProtections(fieldId, year)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId, year]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      await createFieldProtection(fieldId, {
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
      await deleteFieldProtection(fieldId, id);
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

  const protectionTypeOptions = [
    { value: 'Гербіцид', label: t.fields.herbicide },
    { value: 'Фунгіцид', label: t.fields.fungicide },
    { value: 'Інсектицид', label: t.fields.insecticide },
  ];

  const columns = [
    { title: t.fields.productName, dataIndex: 'productName', key: 'productName' },
    { title: t.fields.protectionType, dataIndex: 'protectionType', key: 'protectionType', render: (v: string) => v || '—' },
    { title: t.fields.rateLPerHa, dataIndex: 'rateLPerHa', key: 'rateLPerHa', render: (v: number) => v ?? '—' },
    { title: t.fields.totalLiters, dataIndex: 'totalLiters', key: 'totalLiters', render: (v: number) => v ?? '—' },
    { title: t.fields.costPerLiterLabel, dataIndex: 'costPerLiter', key: 'costPerLiter', render: (v: number) => v ?? '—' },
    { title: t.fields.totalCostLabel, dataIndex: 'totalCost', key: 'totalCost', render: (v: number) => v ?? '—' },
    { title: t.fields.applicationDate, dataIndex: 'applicationDate', key: 'applicationDate', render: (v: string) => dayjs(v).format('DD.MM.YYYY') },
    ...(canWrite ? [{
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: FieldProtectionDto) => (
        <DeleteConfirmButton
          title={t.common.confirm}
          onConfirm={() => handleDelete(record.id)}
        />
      ),
    }] : []),
  ];

  return (
    <div>
      <Space className={s.spaced}>
        <span className={s.text13}>{t.fields.year}:</span>
        <Select
          className={s.block2}
          value={year}
          onChange={setYear}
          options={yearOptions}
          allowClear
          placeholder={t.fields.allYears}
        />
        {canWrite && (
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
            {t.fields.addProtection}
          </Button>
        )}
      </Space>
      <DataTable
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: <EmptyState
            message={t.fields.noProtection || 'Ще немає записів про захист'}
            actionLabel={canWrite ? t.fields.addProtection : undefined}
            onAction={canWrite ? () => setModalOpen(true) : undefined}
          />,
        }}
      />

      <Modal
        title={t.fields.addProtection}
        open={modalOpen}
        onOk={handleCreate}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.add}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" className={s.spaced1} initialValues={{ year: currentYear }}>
          <Form.Item name="year" label={t.fields.year} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={2000} max={2100} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="productName" label={t.fields.productName} rules={[{ required: true, message: t.common.required }]}>
            <Select
              showSearch
              allowClear
              placeholder={t.fields.selectPesticide}
              filterOption={(input, option) =>
                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
              options={warehouseItems.map((item) => ({
                value: item.name,
                label: `${item.name} (${item.purchasePrice != null ? item.purchasePrice + ' ' + currencySymbol + '/' + item.baseUnit : 'ціна не вказана'})`,
              }))}
              onChange={(val) => {
                const item = warehouseItems.find((i) => i.name === val);
                if (item?.purchasePrice != null) {
                  form.setFieldsValue({ costPerLiter: item.purchasePrice });
                  const totalLiters = form.getFieldValue('totalLiters');
                  if (totalLiters) {
                    form.setFieldsValue({ totalCost: Math.round(Number(totalLiters) * item.purchasePrice * 100) / 100 });
                  }
                }
              }}
            />
          </Form.Item>
          <Form.Item name="protectionType" label={t.fields.protectionType}>
            <Select options={protectionTypeOptions} allowClear />
          </Form.Item>
          <Form.Item name="rateLPerHa" label={t.fields.rateLPerHa}>
            <InputNumber
              min={0}
              precision={4}
              className={s.fullWidth}
              onChange={(val) => {
                const area = fieldArea ?? 0;
                if (val != null && area > 0) {
                  const total = Math.round(Number(val) * area * 100) / 100;
                  form.setFieldsValue({ totalLiters: total });
                  const price = form.getFieldValue('costPerLiter');
                  if (price) {
                    form.setFieldsValue({ totalCost: Math.round(total * Number(price) * 100) / 100 });
                  }
                }
              }}
            />
          </Form.Item>
          <Form.Item name="totalLiters" label={t.fields.totalLiters}>
            <InputNumber min={0} precision={4} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="costPerLiter" label={t.fields.costPerLiterLabel}>
            <InputNumber min={0} precision={2} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="totalCost" label={t.fields.totalCostLabel}>
            <InputNumber min={0} precision={2} className={s.fullWidth} addonAfter={currencySymbol} />
          </Form.Item>
          <Form.Item name="applicationDate" label={t.fields.applicationDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
