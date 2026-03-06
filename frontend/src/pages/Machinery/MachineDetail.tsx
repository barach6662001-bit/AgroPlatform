import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Spin, message, Row, Col, Statistic, Badge } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getMachineById } from '../../api/machinery';
import type { MachineDetailDto, WorkLogDto, FuelLogDto } from '../../types/machinery';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const statusColors: Record<string, string> = { Active: 'success', UnderRepair: 'warning', Decommissioned: 'error' };

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<MachineDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!id) return;
    getMachineById(id)
      .then(setMachine)
      .catch(() => message.error(t.machinery.notFound))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!machine) return null;

  const workLogColumns = [
    { title: t.machinery.date, dataIndex: 'date', key: 'date', render: (v: string) => new Date(v).toLocaleDateString() },
    { title: t.machinery.hours, dataIndex: 'hoursWorked', key: 'hoursWorked', render: (v: number) => v.toFixed(2) },
    { title: t.machinery.fieldName, dataIndex: 'fieldName', key: 'fieldName', render: (v: string) => v || '—' },
    { title: t.machinery.notes, dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
  ];

  const fuelLogColumns = [
    { title: t.machinery.date, dataIndex: 'date', key: 'date', render: (v: string) => new Date(v).toLocaleDateString() },
    { title: t.machinery.liters, dataIndex: 'liters', key: 'liters', render: (v: number) => v.toFixed(2) },
    { title: t.machinery.pricePerLiter, dataIndex: 'pricePerLiter', key: 'pricePerLiter', render: (v: number) => v ? v.toFixed(2) : '—' },
    { title: t.machinery.total, dataIndex: 'totalCost', key: 'totalCost', render: (v: number) => v ? `${v.toFixed(2)} UAH` : '—' },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/machinery')} style={{ marginBottom: 16 }}>
        {t.machinery.back}
      </Button>
      <PageHeader title={machine.name} subtitle={`${t.machineryTypes[machine.type as keyof typeof t.machineryTypes] || machine.type} | ${machine.inventoryNumber}`} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t.machinery.machineInfo}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t.machinery.invNumberFull}>{machine.inventoryNumber}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.type}>{t.machineryTypes[machine.type as keyof typeof t.machineryTypes] || machine.type}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.brand}>{machine.brand || '—'}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.model}>{machine.model || '—'}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.year}>{machine.year || '—'}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.status}>
                <Badge status={statusColors[machine.status] as 'success' | 'warning' | 'error'} text={t.machineryStatuses[machine.status as keyof typeof t.machineryStatuses] || machine.status} />
              </Descriptions.Item>
              <Descriptions.Item label={t.machinery.fuelType}>{t.fuelTypes[machine.fuelType as keyof typeof t.fuelTypes] || machine.fuelType}</Descriptions.Item>
              <Descriptions.Item label={t.machinery.fuelConsumption}>{machine.fuelConsumptionPerHour || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card>
                <Statistic title={t.machinery.totalHours} value={machine.totalHoursWorked} precision={1} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic title={t.machinery.totalFuel} value={machine.totalFuelConsumed} precision={1} valueStyle={{ color: '#faad14' }} />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Card title={t.machinery.workLog} style={{ marginTop: 16 }}>
        <Table dataSource={machine.recentWorkLogs} columns={workLogColumns} rowKey="id" pagination={{ pageSize: 10 }} locale={{ emptyText: t.machinery.workLogEmpty }} />
      </Card>

      <Card title={t.machinery.fuelLog} style={{ marginTop: 16 }}>
        <Table dataSource={machine.recentFuelLogs} columns={fuelLogColumns} rowKey="id" pagination={{ pageSize: 10 }} locale={{ emptyText: t.machinery.fuelLogEmpty }} />
      </Card>
    </div>
  );
}
