import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Row, Col, Modal, Form, Select, Input, InputNumber, Popconfirm, Space } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, DownloadOutlined } from '@ant-design/icons';
import { getFieldById, assignCrop, createRotationPlan, deleteRotationPlan, updateFieldGeometry } from '../../api/fields';
import type { FieldDetailDto, CropHistoryDto, CropRotationPlanDto, CropType } from '../../types/field';
import PageHeader from '../../components/PageHeader';
import FieldDrawMap from '../../components/Map/FieldDrawMap';
import { useTranslation } from '../../i18n';

export default function FieldDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [field, setField] = useState<FieldDetailDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentGeoJson, setCurrentGeoJson] = useState<string | null>(null);
  const [savingGeometry, setSavingGeometry] = useState(false);
  const [cadastreLoading, setCadastreLoading] = useState(false);
  const [assignForm] = Form.useForm();
  const [planForm] = Form.useForm();
  const { t } = useTranslation();

  const load = () => {
    if (!id) return;
    getFieldById(id)
      .then(setField)
      .catch(() => message.error(t.fields.notFound))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  const handleAssignCrop = async () => {
    try {
      const values = await assignForm.validateFields();
      setSaving(true);
      await assignCrop({ fieldId: id!, ...values });
      message.success(t.fields.assignCropSuccess);
      assignForm.resetFields();
      setAssignModalOpen(false);
      setLoading(true);
      load();
    } catch {
      message.error(t.fields.assignCropError);
    } finally {
      setSaving(false);
    }
  };

  const handleAddPlan = async () => {
    try {
      const values = await planForm.validateFields();
      setSaving(true);
      await createRotationPlan({ fieldId: id!, ...values });
      message.success(t.fields.addRotationPlanSuccess);
      planForm.resetFields();
      setPlanModalOpen(false);
      setLoading(true);
      load();
    } catch {
      message.error(t.fields.addRotationPlanError);
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePlan = async (planId: string) => {
    try {
      await deleteRotationPlan(planId);
      message.success(t.fields.deleteRotationPlanSuccess);
      setLoading(true);
      load();
    } catch {
      message.error(t.fields.deleteRotationPlanError);
    }
  };

  const handleLoadFromCadastre = async () => {
    if (!field.cadastralNumber) return;
    setCadastreLoading(true);
    try {
      const url = `https://kadastr.live/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=kadastr:cadaster_parcel&outputFormat=application/json&CQL_FILTER=cadnum='${encodeURIComponent(field.cadastralNumber)}'`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const geojson = await response.json();

      if (!geojson.features || geojson.features.length === 0) {
        message.warning(t.fields.cadastreNotFound);
        return;
      }

      const feature = geojson.features[0];
      const geometryJson = JSON.stringify(feature.geometry);
      await updateFieldGeometry(id!, { geoJson: geometryJson });
      message.success(t.fields.cadastreLoaded);
      setLoading(true);
      load();
    } catch (error) {
      console.error('Cadastre loading failed:', error);
      message.error(t.fields.cadastreError);
    } finally {
      setCadastreLoading(false);
    }
  };

  const handleSaveGeometry = async () => {
    if (!currentGeoJson) {
      message.warning(t.fields.noPolygonToDraw);
      return;
    }
    setSavingGeometry(true);
    try {
      await updateFieldGeometry(id!, { geoJson: currentGeoJson });
      message.success(t.fields.saveGeometrySuccess);
      setLoading(true);
      load();
    } catch {
      message.error(t.fields.saveGeometryError);
    } finally {
      setSavingGeometry(false);
    }
  };

  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!field) return null;

  const hasGeometry = !!field.geoJson;
  const cropOptions = Object.entries(t.crops).map(([k, v]) => ({ value: k as CropType, label: v }));

  const historyColumns = [
    { title: t.fields.year, dataIndex: 'year', key: 'year', sorter: (a: CropHistoryDto, b: CropHistoryDto) => a.year - b.year },
    { title: t.fields.crop, dataIndex: 'cropType', key: 'cropType', render: (v: string) => <Tag color="green">{t.crops[v as keyof typeof t.crops] || v}</Tag> },
    { title: t.fields.yieldPerHa, dataIndex: 'yieldTonnesPerHa', key: 'yieldTonnesPerHa', render: (v: number) => v ? v.toFixed(2) : '—' },
    { title: t.fields.notes, dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
  ];

  const planColumns = [
    { title: t.fields.plannedYear, dataIndex: 'plannedYear', key: 'plannedYear' },
    { title: t.fields.plannedCrop, dataIndex: 'plannedCrop', key: 'plannedCrop', render: (v: string) => <Tag color="blue">{t.crops[v as keyof typeof t.crops] || v}</Tag> },
    { title: t.fields.notes, dataIndex: 'notes', key: 'notes', render: (v: string) => v || '—' },
    {
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: CropRotationPlanDto) => (
        <Popconfirm title={t.common.confirm} onConfirm={() => handleDeletePlan(record.id)}>
          <Button size="small" danger icon={<DeleteOutlined />} />
        </Popconfirm>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/fields')}>
          {t.fields.backToList}
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => setAssignModalOpen(true)} style={{ background: '#52c41a', borderColor: '#52c41a', color: '#fff' }}>
          {t.fields.assignCrop}
        </Button>
        <Button icon={<PlusOutlined />} onClick={() => setPlanModalOpen(true)}>
          {t.fields.addRotationPlan}
        </Button>
      </Space>
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
              <Descriptions.Item label={t.fields.ownershipType}>
                {field.ownershipType === 1
                  ? <Tag color="blue">{t.fields.ownershipLease}</Tag>
                  : field.ownershipType === 2
                  ? <Tag color="purple">{t.fields.ownershipShareLease}</Tag>
                  : <Tag color="green">{t.fields.ownershipOwnLand}</Tag>}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={t.fields.fieldMap}
            styles={{ body: { padding: 0 } }}
            extra={
              <Space>
                {field.cadastralNumber && !hasGeometry && (
                  <Button
                    icon={<DownloadOutlined />}
                    size="small"
                    loading={cadastreLoading}
                    onClick={handleLoadFromCadastre}
                  >
                    {t.fields.loadFromCadastre}
                  </Button>
                )}
                <Button
                  type="primary"
                  icon={<SaveOutlined />}
                  size="small"
                  loading={savingGeometry}
                  disabled={!currentGeoJson}
                  onClick={handleSaveGeometry}
                >
                  {t.fields.saveGeometry}
                </Button>
              </Space>
            }
          >
            <FieldDrawMap field={field} onGeometryChange={setCurrentGeoJson} height={300} />
          </Card>
        </Col>
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

      <Card title={t.fields.rotationPlans} style={{ marginTop: 16 }}>
        <Table
          dataSource={field.rotationPlans}
          columns={planColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: t.fields.rotationPlansEmpty }}
        />
      </Card>

      {/* Assign Crop Modal */}
      <Modal
        title={t.fields.assignCrop}
        open={assignModalOpen}
        onOk={handleAssignCrop}
        onCancel={() => { setAssignModalOpen(false); assignForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={assignForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="cropType" label={t.fields.crop} rules={[{ required: true, message: t.common.required }]}>
            <Select options={cropOptions} />
          </Form.Item>
          <Form.Item name="year" label={t.fields.cropYear} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.fields.notes}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Rotation Plan Modal */}
      <Modal
        title={t.fields.addRotationPlan}
        open={planModalOpen}
        onOk={handleAddPlan}
        onCancel={() => { setPlanModalOpen(false); planForm.resetFields(); }}
        okText={t.common.add}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={planForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="plannedCrop" label={t.fields.plannedCrop} rules={[{ required: true, message: t.common.required }]}>
            <Select options={cropOptions} />
          </Form.Item>
          <Form.Item name="plannedYear" label={t.fields.plannedYear} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.fields.notes}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
