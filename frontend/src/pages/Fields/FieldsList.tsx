import { useEffect, useState } from 'react';
import { Table, Button, Space, Tag, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, SearchOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getFields, deleteField } from '../../api/fields';
import type { FieldDto } from '../../types/field';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

export default function FieldsList() {
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();

  const load = () => {
    setLoading(true);
    getFields()
      .then(setFields)
      .catch(() => message.error(t.fields.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteField(id);
      message.success(t.fields.deleteSuccess);
      load();
    } catch {
      message.error(t.fields.deleteError);
    }
  };

  const filtered = fields.filter(
    (f) =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      (f.cadastralNumber ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { title: t.fields.name, dataIndex: 'name', key: 'name', sorter: (a: FieldDto, b: FieldDto) => a.name.localeCompare(b.name) },
    { title: t.fields.cadastralNumber, dataIndex: 'cadastralNumber', key: 'cadastralNumber', render: (v: string) => v || '—' },
    { title: t.fields.area, dataIndex: 'areaHectares', key: 'areaHectares', sorter: (a: FieldDto, b: FieldDto) => a.areaHectares - b.areaHectares, render: (v: number) => v.toFixed(2) },
    { title: t.fields.soilType, dataIndex: 'soilType', key: 'soilType', render: (v: string) => v || '—' },
    {
      title: t.fields.currentCrop, dataIndex: 'currentCrop', key: 'currentCrop',
      render: (v: string, r: FieldDto) => v ? <Tag color="green">{t.crops[v as keyof typeof t.crops] || v}{r.currentCropYear ? ` (${r.currentCropYear})` : ''}</Tag> : <Tag>{t.fields.notSeeded}</Tag>,
    },
    {
      title: t.fields.actions, key: 'actions',
      render: (_: unknown, record: FieldDto) => (
        <Space>
          <Button size="small" icon={<EyeOutlined />} onClick={() => navigate(`/fields/${record.id}`)}>{t.fields.details}</Button>
          <Popconfirm title={t.fields.deleteField} onConfirm={() => handleDelete(record.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader title={t.fields.title} subtitle={t.fields.subtitle} />
      <Space style={{ marginBottom: 16 }}>
        <Input
          placeholder={t.fields.searchPlaceholder}
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ width: 320 }}
        />
        <Button type="primary" icon={<PlusOutlined />} style={{ background: '#52c41a', borderColor: '#52c41a' }}>
          {t.fields.addField}
        </Button>
      </Space>
      <Table
        dataSource={filtered}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 15, showTotal: (total) => `${t.fields.total.replace('{{count}}', String(total))}` }}
      />
    </div>
  );
}
