import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Table, Button, Spin, message, Row, Col,
  Statistic, Badge, Modal, Form, Input, InputNumber, DatePicker, Space, Select,
} from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';
import { getMachineById, addWorkLog, addFuelLog } from '../../api/machinery';
import type { MachineDetailDto, WorkLogDto, FuelLogDto } from '../../types/machinery';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const statusColors: Record<string, string> = {
  Active: 'success', UnderRepair: 'warning', Decommissioned: 'error',
};

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<MachineDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [workLogOpen, setWorkLogOpen] = useState(false);
  const [fuelLogOpen, setFuelLogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [workForm] = Form.useForm();
  const [fuelForm] = Form.useForm();
  const { t } = useTranslation();

  const load = () => {
    if (!id) return;
    getMachineById(id)
      .then(setMachine)
      .catch(() => message.error(t.machinery.notFound))
      .finally(() => setLoading(false));
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
      await addWorkLog(id, {
        date,
        hoursWorked: values.hoursWorked,
        description: values.description,
      });
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

  const handleFuelLog = async () => {
    if (!id || !machine) return;
    try {
      const values = await fuelForm.validateFields();
      setSaving(true);
      const date = values.date
        ? (values.date as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      // Pass machine's fuelType automatically (required by backend)
      await addFuelLog(id, {
        date,
        quantity: values.quantity,
        fuelType: machine.fuelType,
        note: values.note,
      });
      message.success(t.machinery.fuelLogSuccess);
      fuelForm.resetFields();
      setFuelLogOpen(false);
      setLoading(true);
      load();
    } catch {
      message.error(t.machinery.fuelLogError);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!machine) return null;

  const workLogColumns = [
    {
      title: t.machinery.date, dataIndex: 'date', key: 'date',
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: t.machinery.hours, dataIndex: 'hoursWorked', key: 'hoursWorked',
      render: (v: number) => v.toFixed(2),
    },
    {
      title: t.machinery.fieldName, dataIndex: 'fieldName', key: 'fieldName',
      render: (v: string) => v || '—',
    },
    {
      title: t.machinery.notes, dataIndex: 'notes', key: 'notes',
      render: (v: string) => v || '—',
    },
  ];

  const fuelLogColumns = [
    {
      title: t.machinery.date, dataIndex: 'date', key: 'date',
      render: (v: string) => new Date(v).toLocaleDateString(),
    },
    {
      title: t.machinery.liters, dataIndex: 'liters', key: 'liters',
      render: (v: number) => v != null ? v.toFixed(2) : '—',
    },
    {
      title: t.machinery.pricePerLiter, dataIndex: 'pricePerLiter', key: 'pricePerLiter',
      render: (v: number) => v ? v.toFixed(2) : '—',
    },
    {
      title: t.machinery.total, dataIndex: 'totalCost', key: 'totalCost',
      render: (v: number) => v ? `${v.toFixed(2)} UAH` : '—',
    },
  ];

  // Chart data — use recentWorkLogs sorted by date
  const workChartData = [...machine.recentWorkLogs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-15)
    .map((l: WorkLogDto) => ({
      date: new Date(l.date).toLocaleDateString(),
      [t.machinery.hours]: l.hoursWorked,
    }));

  const fuelChartData = [...machine.recentFuelLogs]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-15)
    .map((l: FuelLogDto) => ({
      date: new Date(l.date).toLocaleDateString(),
      [t.machinery.liters]: l.liters,
    }));

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/machinery')}>
          {t.machinery.back}
        </Button>
        <Button
          icon={<PlusOutlined />}
          style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}
          onClick={() => setWorkLogOpen(true)}
        >
          {t.machinery.logWork}
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => setFuelLogOpen(true)}>
          {t.machinery.logFuel}
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
          locale={{ emptyText: t.machinery.workLogEmpty }}
        />
        {workChartData.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={workChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="date" tick={{ fill: '#8B949E', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }}
                />
                <Line
                  type="monotone"
                  dataKey={t.machinery.hours}
                  stroke="#1890ff"
                  strokeWidth={2}
                  dot={{ fill: '#1890ff', r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Fuel Log Table + Chart */}
      <Card title={t.machinery.fuelLog} style={{ marginTop: 16 }}>
        <Table
          dataSource={machine.recentFuelLogs}
          columns={fuelLogColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: t.machinery.fuelLogEmpty }}
        />
        {fuelChartData.length > 1 && (
          <div style={{ marginTop: 16 }}>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={fuelChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
                <XAxis dataKey="date" tick={{ fill: '#8B949E', fontSize: 11 }} />
                <YAxis tick={{ fill: '#8B949E', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#161B22', border: '1px solid #30363D', color: '#E6EDF3' }}
                />
                <Bar dataKey={t.machinery.liters} fill="#faad14" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
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

      {/* Fuel Log Modal */}
      <Modal
        title={t.machinery.logFuel}
        open={fuelLogOpen}
        onOk={handleFuelLog}
        onCancel={() => { setFuelLogOpen(false); fuelForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={fuelForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="date" label={t.machinery.date} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="quantity" label={t.machinery.litersLabel} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="note" label={t.machinery.notes}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
