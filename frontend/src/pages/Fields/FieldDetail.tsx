import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Row, Col } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import type { GeoJsonObject } from 'geojson';
import 'leaflet/dist/leaflet.css';
import { getFieldById } from '../../api/fields';
import type { FieldDetailDto, CropHistoryDto } from '../../types/field';
import PageHeader from '../../components/PageHeader';

const cropLabels: Record<string, string> = {
  Wheat: 'Пшеница', Barley: 'Ячмень', Corn: 'Кукуруза', Sunflower: 'Подсолнечник',
  Soybean: 'Соя', Rapeseed: 'Рапс', SugarBeet: 'Сах. свёкла', Potato: 'Картофель',
  Fallow: 'Пар', Other: 'Другое',
};

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<FieldDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getFieldById(id)
      .then(setField)
      .catch(() => message.error('Поле не найдено'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!field) return null;

  let geoJsonData: GeoJsonObject | null = null;
  try {
    if (field.geoJson) geoJsonData = JSON.parse(field.geoJson) as GeoJsonObject;
  } catch {
    // ignore parse error
  }

  const historyColumns = [
    { title: 'Год', dataIndex: 'year', key: 'year', sorter: (a: CropHistoryDto, b: CropHistoryDto) => a.year - b.year },
    { title: 'Культура', dataIndex: 'cropType', key: 'cropType', render: (v: string) => <Tag color="green">{cropLabels[v] || v}</Tag> },
    { title: 'Урожайность (т/га)', dataIndex: 'yieldTonnesPerHa', key: 'yieldTonnesPerHa', render: (v: number) => v ? v.toFixed(2) : '—' },
    { title: 'Заметки', dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/fields')} style={{ marginBottom: 16 }}>
        Назад к списку
      </Button>
      <PageHeader title={field.name} subtitle={`Площадь: ${field.areaHectares.toFixed(2)} га`} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="Информация о поле">
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Кадастровый номер">{field.cadastralNumber || '—'}</Descriptions.Item>
              <Descriptions.Item label="Площадь (га)">{field.areaHectares.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label="Тип почвы">{field.soilType || '—'}</Descriptions.Item>
              <Descriptions.Item label="Текущая культура">
                {field.currentCrop ? (
                  <Tag color="green">{cropLabels[field.currentCrop] || field.currentCrop}{field.currentCropYear ? ` (${field.currentCropYear})` : ''}</Tag>
                ) : 'Не засеяно'}
              </Descriptions.Item>
              <Descriptions.Item label="Заметки">{field.notes || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {geoJsonData && (
          <Col xs={24} lg={12}>
            <Card title="Карта поля" styles={{ body: { padding: 0 } }}>
              <MapContainer
                style={{ height: 300, width: '100%' }}
                center={[48.5, 35.0]}
                zoom={12}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <GeoJSON data={geoJsonData} />
              </MapContainer>
            </Card>
          </Col>
        )}
      </Row>

      <Card title="История культур" style={{ marginTop: 16 }}>
        <Table
          dataSource={field.cropHistory}
          columns={historyColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'История культур пуста' }}
        />
      </Card>
    </div>
  );
}
