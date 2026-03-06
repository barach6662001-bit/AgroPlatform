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
import { useTranslation } from '../../i18n';

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<FieldDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    if (!id) return;
    getFieldById(id)
      .then(setField)
      .catch(() => message.error(t.fields.notFound))
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
    { title: t.fields.year, dataIndex: 'year', key: 'year', sorter: (a: CropHistoryDto, b: CropHistoryDto) => a.year - b.year },
    { title: t.fields.crop, dataIndex: 'cropType', key: 'cropType', render: (v: string) => <Tag color="green">{t.crops[v as keyof typeof t.crops] || v}</Tag> },
    { title: t.fields.yieldPerHa, dataIndex: 'yieldTonnesPerHa', key: 'yieldTonnesPerHa', render: (v: number) => v ? v.toFixed(2) : '—' },
    { title: t.fields.notes, dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
  ];

  return (
    <div>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/fields')} style={{ marginBottom: 16 }}>
        {t.fields.backToList}
      </Button>
      <PageHeader title={field.name} subtitle={t.fields.areaSubtitle.replace('{{area}}', field.areaHectares.toFixed(2))} />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t.fields.fieldInfo}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t.fields.cadastralNumber}>{field.cadastralNumber || '—'}</Descriptions.Item>
              <Descriptions.Item label={t.fields.area}>{field.areaHectares.toFixed(2)}</Descriptions.Item>
              <Descriptions.Item label={t.fields.soilType}>{field.soilType || '—'}</Descriptions.Item>
              <Descriptions.Item label={t.fields.currentCrop}>
                {field.currentCrop ? (
                  <Tag color="green">{t.crops[field.currentCrop as keyof typeof t.crops] || field.currentCrop}{field.currentCropYear ? ` (${field.currentCropYear})` : ''}</Tag>
                ) : t.fields.notSeeded}
              </Descriptions.Item>
              <Descriptions.Item label={t.fields.notes}>{field.notes || '—'}</Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        {geoJsonData && (
          <Col xs={24} lg={12}>
            <Card title={t.fields.fieldMap} styles={{ body: { padding: 0 } }}>
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

      <Card title={t.fields.cropHistory} style={{ marginTop: 16 }}>
        <Table
          dataSource={field.cropHistory}
          columns={historyColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: t.fields.cropHistoryEmpty }}
        />
      </Card>
    </div>
  );
}
