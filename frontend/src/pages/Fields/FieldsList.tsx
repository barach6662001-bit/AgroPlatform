import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getFields, deleteField } from '../../api/fields';
import type { FieldDto } from '../../types/field';
import PageHeader from '../../components/PageHeader';

const cropLabels: Record<string, string> = {
  Wheat: 'Пшеница', Barley: 'Ячмень', Corn: 'Кукуруза', Sunflower: 'Подсолнечник',
  Soybean: 'Соя', Rapeseed: 'Рапс', SugarBeet: 'Сах. свёкла', Potato: 'Картофель',
  Fallow: 'Пар', Other: 'Другое',
};

export default function FieldsList() {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const load = () => {
    setLoading(true);
    getFields()
      .then(setFields)
      .catch(() => message.error('Ошибка загрузки полей'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteField(id);
      message.success('Поле удалено');
      load();
    } catch {
      message.error('Ошибка удаления');
    }
  };

  const filtered = fields.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.cadastralNumber ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: 'Название', dataIndex: 'name', key: 'name', sorter: (a: FieldDto, b: FieldDto) => a.name.localeCompare(b.name) },
    { title: 'Кадастровый номер', dataIndex: 'cadastralNumber', key: 'cadastralNumber', render: (v: string) => v || '—' },
    { title: 'Площадь (га)', dataIndex: 'areaHectares', key: 'areaHectares', sorter: (a: FieldDto, b: FieldDto) => a.areaHectares - b.areaHectares, render: (v: number) => v.toFixed(2) },
    { title: 'Тип почвы', dataIndex: 'soilType', key: 'soilType', render: (v: string) => v || '—' },
    {
      title: 'Текущая культура', dataIndex: 'currentCrop', key: 'currentCrop',
      render: (v: string, r: FieldDto) => v ? <Tag color="green">{cropLabels[v] || v}{r.currentCropYear ? ` (${r.currentCropYear})` : ''}</Tag> : <Tag>Не засеяно</Tag>,
    },
    {
      title: 'Действия', key: 'actions',
      render: (_: unknown, record: FieldDto) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/fields/${record.id}`)}>Детали</Button>
          <Popconfirm title="Удалить поле?" onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title="Поля" subtitle="Управление полями предприятия" />
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder="Поиск по названию или кадастровому номеру"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
        />
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
          Добавить поле
        </Button>
      </Space>
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showTotal: (total) => `Всего: ${total}` }}
      />
    </div>
  );
}
