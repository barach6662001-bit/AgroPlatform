import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Button, Spin, message, Row, Col, Statistic, Badge } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { getMachineById } from '../../api/machinery';
import type { MachineDetailDto, WorkLogDto, FuelLogDto } from '../../types/machinery';
import PageHeader from '../../components/PageHeader';

const typeLabels: Record<string, string> = {
  Tractor: 'Трактор', Combine: 'Комбайн', Sprayer: 'Опрыскиватель',
  Seeder: 'Сеялка', Cultivator: 'Культиватор', Truck: 'Грузовик', Other: 'Другое',
};
const statusColors: Record<string, string> = { Active: 'success', UnderRepair: 'warning', Decommissioned: 'error' };
const statusLabels: Record<string, string> = { Active: 'Активна', UnderRepair: 'В ремонте', Decommissioned: 'Списана' };
const fuelLabels: Record<string, string> = { Diesel: 'Дизель', Gasoline: 'Бензин', Electric: 'Электро', Gas: 'Газ' };

export default function MachineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [machine, setMachine] = useState<MachineDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getMachineById(id)
      .then(setMachine)
      .catch(() => message.error('Техника не найдена'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!machine) return null;

  const workLogColumns = [
    { title: 'Дата', dataIndex: 'date', key: 'date', render: (v: string) => new Date(v).toLocaleDateString('ru-RU') },
    { title: 'Наработка (ч)', dataIndex: 'hoursWorked', key: 'hoursWorked', render: (v: number) => v.toFixed(2) },
    { title: 'Поле', dataIndex: 'fieldName', key: 'fieldName', render: (v: string) => v || '—' },
    { title: 'Заметки', dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
  ];

  const fuelLogColumns = [
    { title: 'Дата', dataIndex: 'date', key: 'date', render: (v: string) => new Date(v).toLocaleDateString('ru-RU') },
    { title: 'Литры', dataIndex: 'liters', key: 'liters', render: (v: number) => v.toFixed(2) },
    { title: 'Цена/л', dataIndex: 'pricePerLiter', key: 'pricePerLiter', render: (v: number) => v ? v.toFixed(2) : '—' },
    { title: 'Итого', dataIndex: 'totalCost', key: 'totalCost', render: (v: number) => v ? `${v.toFixed(2)} UAH` : '—' },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/machinery')} style={{ marginBottom: 16 }}>
        Назад
      </Button>
      <PageHeader title={machine.name} subtitle={`${typeLabels[machine.type] || machine.type} | ${machine.inventoryNumber}`} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Информация о технике">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Инвентарный номер">{machine.inventoryNumber}</Descriptions.Item>
              <Descriptions.Item label="Тип">{typeLabels[machine.type] || machine.type}</Descriptions.Item>
              <Descriptions.Item label="Марка">{machine.brand || '—'}</Descriptions.Item>
              <Descriptions.Item label="Модель">{machine.model || '—'}</Descriptions.Item>
              <Descriptions.Item label="Год">{machine.year || '—'}</Descriptions.Item>
              <Descriptions.Item label="Статус">
                <Badge status={statusColors[machine.status] as 'success' | 'warning' | 'error'} text={statusLabels[machine.status] || machine.status} />
              </Descriptions.Item>
              <Descriptions.Item label="Вид топлива">{fuelLabels[machine.fuelType] || machine.fuelType}</Descriptions.Item>
              <Descriptions.Item label="Расход топлива (л/ч)">{machine.fuelConsumptionPerHour || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Row gutter={[16, 16]}>
            <Col span={12}>
              <Card>
                <Statistic title="Всего наработано (ч)" value={machine.totalHoursWorked} precision={1} valueStyle={{ color: '#1890ff' }} />
              </Card>
            </Col>
            <Col span={12}>
              <Card>
                <Statistic title="Всего топлива (л)" value={machine.totalFuelConsumed} precision={1} valueStyle={{ color: '#faad14' }} />
              </Card>
            </Col>
          </Row>
        </Col>
      </Row>

      <Card title="Журнал наработки" style={{ marginTop: 16 }}>
        <Table dataSource={machine.recentWorkLogs} columns={workLogColumns} rowKey="id" pagination={{ pageSize: 10 }} locale={{ emptyText: 'Наработок нет' }} />
      </Card>

      <Card title="Журнал заправок" style={{ marginTop: 16 }}>
        <Table dataSource={machine.recentFuelLogs} columns={fuelLogColumns} rowKey="id" pagination={{ pageSize: 10 }} locale={{ emptyText: 'Заправок нет' }} />
      </Card>
    </div>
  );
}
