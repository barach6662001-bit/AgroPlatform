import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Table, Button, message, Modal, Form, Input, InputNumber, DatePicker, Space, Select, Tag,
} from 'antd';
import TableSkeleton from '../../components/TableSkeleton';
import { ArrowLeftOutlined, PlusOutlined, DownloadOutlined } from '@ant-design/icons';
import { getMaintenanceRecords, addMaintenanceRecord, exportMaintenanceRecords, type MaintenanceRecordDto } from '../../api/maintenance';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { formatDate } from '../../utils/dateFormat';

const MAINTENANCE_TYPES = ['Scheduled', 'Repair', 'Inspection'];

export default function MaintenancePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [records, setRecords] = useState<MaintenanceRecordDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [form] = Form.useForm();

  const load = () => {
    if (!id) return;
    setLoading(true);
    getMaintenanceRecords(id)
      .then(setRecords)
      .catch(() => message.error(t.maintenance.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAdd = async () => {
    if (!id) return;
    try {
      const values = await form.validateFields();
      setSaving(true);
      const date = values.date
        ? (values.date as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      const nextDate = values.nextMaintenanceDate
        ? (values.nextMaintenanceDate as { toISOString: () => string }).toISOString()
        : undefined;
      await addMaintenanceRecord(id, {
        machineId: id,
        date,
        type: values.type,
        description: values.description,
        cost: values.cost,
        hoursAtMaintenance: values.hoursAtMaintenance,
        nextMaintenanceDate: nextDate,
      });
      message.success(t.maintenance.addSuccess);
      form.resetFields();
      setModalOpen(false);
      load();
    } catch {
      message.error(t.maintenance.addError);
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async () => {
    if (!id) return;
    setExporting(true);
    try {
      const resp = await exportMaintenanceRecords(id);
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `maintenance-${id}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error(t.maintenance.loadError);
    } finally {
      setExporting(false);
    }
  };

  if (loading) return <TableSkeleton rows={8} />;

  const columns = [
    {
      title: t.maintenance.date,
      dataIndex: 'date',
      key: 'date',
      render: (v: string) => formatDate(v),
    },
    {
      title: t.maintenance.type,
      dataIndex: 'type',
      key: 'type',
      render: (v: string) => {
        const key = `type${v}` as keyof typeof t.maintenance;
        const label = t.maintenance[key] as string ?? v;
        const colors: Record<string, string> = { Scheduled: 'blue', Repair: 'red', Inspection: 'green' };
        return <Tag color={colors[v] ?? 'default'}>{label}</Tag>;
      },
    },
    {
      title: t.maintenance.description,
      dataIndex: 'description',
      key: 'description',
      render: (v: string) => v || '—',
    },
    {
      title: t.maintenance.cost,
      dataIndex: 'cost',
      key: 'cost',
      render: (v: number) => (v ? `${v.toFixed(2)} UAH` : '—'),
    },
    {
      title: t.maintenance.hoursAtMaintenance,
      dataIndex: 'hoursAtMaintenance',
      key: 'hoursAtMaintenance',
      render: (v: number) => (v ? v.toFixed(1) : '—'),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/machinery/${id}`)}>
          {t.machinery.back}
        </Button>
        <Button icon={<PlusOutlined />} type="primary" onClick={() => setModalOpen(true)}>
          {t.maintenance.addRecord}
        </Button>
        <Button icon={<DownloadOutlined />} loading={exporting} onClick={handleExport}>
          {t.warehouses_export.exportCosts}
        </Button>
      </Space>

      <PageHeader title={t.maintenance.title} />

      <Card>
        <Table
          dataSource={records}
          columns={columns}
          rowKey="id"
          pagination={{ pageSize: 20 }}
          locale={{ emptyText: t.maintenance.noRecords }}
        />
      </Card>

      <Modal
        title={t.maintenance.addRecord}
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="date" label={t.maintenance.date} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="type" label={t.maintenance.type} rules={[{ required: true, message: t.common.required }]}>
            <Select options={MAINTENANCE_TYPES.map((tp) => ({
              value: tp,
              label: t.maintenance[`type${tp}` as keyof typeof t.maintenance] as string ?? tp,
            }))} />
          </Form.Item>
          <Form.Item name="description" label={t.maintenance.description}>
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="cost" label={t.maintenance.cost}>
            <InputNumber min={0} step={100} style={{ width: '100%' }} addonAfter="UAH" />
          </Form.Item>
          <Form.Item name="hoursAtMaintenance" label={t.maintenance.hoursAtMaintenance}>
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="nextMaintenanceDate" label={t.maintenance.nextMaintenanceDate}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
