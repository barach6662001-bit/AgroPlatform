import EmptyState from '../../components/EmptyState';
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Table, Button, Spin, message, Row, Col,
  Statistic, Badge, Modal, Form, Input, InputNumber, DatePicker, Space, Select, Tag,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined, ToolOutlined, DownloadOutlined } from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getMachineById, addWorkLog } from '../../api/machinery';
import { getMaintenanceRecords, addMaintenanceRecord, exportMaintenanceRecords, type MaintenanceRecordDto } from '../../api/maintenance';
import { getFuelTransactions } from '../../api/fuel';
import type { MachineDetailDto, WorkLogDto } from '../../types/machinery';
import type { FuelTransactionDto } from '../../types/fuel';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { formatDate } from '../../utils/dateFormat';

const statusColors: Record<string, string> = {
  Active: 'success', UnderRepair: 'warning', Decommissioned: 'error',
};

const MAINTENANCE_TYPES = ['Scheduled', 'Repair', 'Inspection'];

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<MachineDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [workLogOpen, setWorkLogOpen] = useState(false);
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [exportingMaintenance, setExportingMaintenance] = useState(false);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecordDto[]>([]);
  const [fuelTransactions, setFuelTransactions] = useState<FuelTransactionDto[]>([]);
  const [workForm] = Form.useForm();
  const [maintenanceForm] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canEdit = hasRole(['Administrator', 'Manager']);

  const load = () => {
    if (!id) return;
    Promise.all([
      getMachineById(id),
      getMaintenanceRecords(id),
    ])
      .then(([m, maint]) => {
        setMachine(m);
        setMaintenanceRecords(maint);
      })
      .catch(() => message.error(t.machinery.notFound))
      .finally(() => setLoading(false));
    getFuelTransactions({ machineId: id, pageSize: 50 })
      .then(setFuelTransactions)
      .catch(() => {});
  };

  useEffect(() => { load(); }, [id]);

  const handleWorkLog = async () => {
    if (!id || !machine) return;
    try {
      const values = await workForm.validateFields();
      setSaving(true);
      const date = values.date
        ? (values.date as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      await addWorkLog(id, { date, hoursWorked: values.hoursWorked, description: values.description });
      message.success(t.machinery.workLogSuccess);
      workForm.resetFields();
      setWorkLogOpen(false);
      setLoading(true);
      load();
    } catch {
      message.error(t.machinery.workLogError);
    } finally {
      setSaving(false);
    }
  };

  const handleAddMaintenance = async () => {
    if (!id) return;
    try {
      const values = await maintenanceForm.validateFields();
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
      maintenanceForm.resetFields();
      setMaintenanceOpen(false);
      load();
    } catch {
      message.error(t.maintenance.addError);
    } finally {
      setSaving(false);
    }
  };

  const handleExportMaintenance = async () => {
    if (!id) return;
    setExportingMaintenance(true);
    try {
      const resp = await exportMaintenanceRecords(id);
      const url = window.URL.createObjectURL(new Blob([resp.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `maintenance-${id}-${new Date().toISOString().slice(0, 10)}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch {
      message.error(t.machinery.loadError);
    } finally {
      setExportingMaintenance(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!machine) return null;

  const workLogColumns = [
    { title: t.machinery.date, dataIndex: 'date', key: 'date', render: (v: string) => formatDate(v) },
    { title: t.machinery.hours, dataIndex: 'hoursWorked', key: 'hoursWorked', render: (v: number) => v.toFixed(2) },
    { title: t.machinery.notes, dataIndex: 'description', key: 'description', render: (v: string) => v || '—' },
  ];

  const fuelLogColumns = [
    { title: t.machinery.date, dataIndex: 'date', key: 'date', render: (v: string) => formatDate(v) },
    { title: t.machinery.liters, dataIndex: 'quantity', key: 'quantity', render: (v: number) => v != null ? v.toFixed(2) : '—' },
    { title: t.machinery.notes, dataIndex: 'note', key: 'note', render: (v: string) => v || '—' },
  ];

  const maintenanceColumns = [
    { title: t.maintenance.date, dataIndex: 'date', key: 'date', render: (v: string) => formatDate(v) },
    {
      title: t.maintenance.type, dataIndex: 'type', key: 'type',
      render: (v: string) => {
        const key = `type${v}` as keyof typeof t.maintenance;
        const label = t.maintenance[key] as string ?? v;
        const colors: Record<string, string> = { Scheduled: 'blue', Repair: 'red', Inspection: 'green' };
        return <Tag color={colors[v] ?? 'default'}>{label}</Tag>;
      },
    },
    { title: t.maintenance.description, dataIndex: 'description', key: 'description', render: (v: string) => v || '—' },
    { title: t.maintenance.cost, dataIndex: 'cost', key: 'cost', render: (v: number) => v ? `${v.toFixed(2)} UAH` : '—' },
    { title: t.maintenance.hoursAtMaintenance, dataIndex: 'hoursAtMaintenance', key: 'hours', render: (v: number) => v ? v.toFixed(1) : '—' },
  ];

  const workChartData = [...machine.recentWorkLogs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-15)
    .map((l: WorkLogDto) => ({ date: formatDate(l.date), [t.machinery.hours]: l.hoursWorked }));

  const fuelChartData = [...fuelTransactions]
    .filter((tx) => tx.transactionType === 'Issue')
    .sort((a, b) => new Date(a.transactionDate).getTime() - new Date(b.transactionDate).getTime())
    .slice(-15)
    .map((l: FuelTransactionDto) => ({ date: formatDate(l.transactionDate), [t.machinery.liters]: l.quantityLiters }));

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/machinery')}>
          {t.machinery.back}
        </Button>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setWorkLogOpen(true)}
        >
          {t.machinery.logWork}
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => navigate('/fuel')}>
          {t.machinery.refuelAtStation}
        </Button>
        {canEdit && (
          <Button icon={<ToolOutlined />} onClick={() => setMaintenanceOpen(true)}>
            {t.maintenance.addRecord}
          </Button>
        )}
        <Button onClick={() => navigate(`/machinery/${id}/maintenance`)}>
          {t.maintenance.title}
        </Button>
      </Space>

      <PageHeader
        title={machine.name}
        subtitle={`${t.machineryTypes[machine.type as keyof typeof t.machineryTypes] || machine.type} | ${machine.inventoryNumber}`}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t.machinery.machineInfo}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t.machinery.invNumberFull}>{machine.inventoryNumber}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.type}>
                {t.machineryTypes[machine.type as keyof typeof t.machineryTypes] || machine.type}
              </Descriptions.Item>
              <Descriptions.Item label={t.machinery.brand}>{machine.brand || '—'}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.model}>{machine.model || '—'}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.year}>{machine.year || '—'}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.status}>
                <Badge
                  status={statusColors[machine.status] as 'success' | 'warning' | 'error'}
                  text={t.machineryStatuses[machine.status as keyof typeof t.machineryStatuses] || machine.status}
                />
              </Descriptions.Item>
              <Descriptions.Item label={t.machinery.fuelType}>
                {t.fuelTypes[machine.fuelType as keyof typeof t.fuelTypes] || machine.fuelType}
              </Descriptions.Item>
              <Descriptions.Item label={t.machinery.fuelConsumption}>
                {machine.fuelConsumptionPerHour || '—'}
              </Descriptions.Item>
              {machine.nextMaintenanceDate && (
                <Descriptions.Item label={t.maintenance.nextMaintenanceDate}>
                  <Tag color={new Date(machine.nextMaintenanceDate) < new Date() ? 'error' : 'warning'}>
                    {formatDate(machine.nextMaintenanceDate)}
                  </Tag>
                </Descriptions.Item>
              )}
              {machine.lastMaintenanceDate && (
                <Descriptions.Item label={t.maintenance.lastMaintenanceDate}>
                  {formatDate(machine.lastMaintenanceDate)}
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card>
                <Statistic
                  title={t.machinery.totalHours}
                  value={machine.totalHoursWorked}
                  precision={1}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic
                  title={t.machinery.totalFuel}
                  value={machine.totalFuelConsumed}
                  precision={1}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      {/* Work Log Table + Chart */}
      <Card title={t.machinery.workLog} style={{ marginTop: 16 }}>
        <Table
          dataSource={machine.recentWorkLogs}
          columns={workLogColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <EmptyState message={t.machinery.workLogEmpty || 'Напрацювань немає'} actionLabel={t.machinery.logWork} onAction={() => setWorkLogOpen(true)} /> }}
        />
        {workChartData.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={workChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="date" tick={{ fill: '#8B949E', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }} />
                <Line type="monotone" dataKey={t.machinery.hours} stroke="#1890ff" strokeWidth={2} dot={{ fill: '#1890ff', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Fuel Log Table + Chart */}
      <Card title={t.machinery.fuelLog} style={{ marginTop: 16 }}>
        <Table
          dataSource={fuelTransactions.filter((tx) => tx.transactionType === 'Issue')}
          columns={fuelLogColumns}
          rowKey="id"
          pagination={false}
          locale={{ emptyText: t.machinery.fuelLogEmpty }}
        />
        {fuelChartData.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fuelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="date" tick={{ fill: '#8B949E', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }} />
                <Bar dataKey={t.machinery.liters} fill="#faad14" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Maintenance Records */}
      <Card
        title={t.maintenance.title}
        style={{ marginTop: 16 }}
        extra={
          <Button icon={<DownloadOutlined />} loading={exportingMaintenance} onClick={handleExportMaintenance}>
            {t.warehouses_export.exportCosts}
          </Button>
        }
      >
        <Table
          dataSource={maintenanceRecords}
          columns={maintenanceColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: <EmptyState message={t.maintenance.noRecords || 'Записів ТО немає'} actionLabel={canEdit ? t.maintenance.addRecord : undefined} onAction={canEdit ? () => setMaintenanceOpen(true) : undefined} /> }}
        />
      </Card>

      {/* Work Log Modal */}
      <Modal
        title={t.machinery.logWork}
        open={workLogOpen}
        onOk={handleWorkLog}
        onCancel={() => { setWorkLogOpen(false); workForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={workForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="date" label={t.machinery.date} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hoursWorked" label={t.machinery.hoursWorked} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label={t.machinery.notes}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Maintenance Modal */}
      <Modal
        title={t.maintenance.addRecord}
        open={maintenanceOpen}
        onOk={handleAddMaintenance}
        onCancel={() => { setMaintenanceOpen(false); maintenanceForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={maintenanceForm} layout="vertical" style={{ marginTop: 16 }}>
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
