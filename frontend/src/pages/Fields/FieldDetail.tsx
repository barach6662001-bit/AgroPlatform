import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Table, Tag, Button, Spin, message, Row, Col, Modal, Form, Select, Input, InputNumber, Popconfirm, Space, DatePicker } from 'antd';
import { ArrowLeftOutlined, PlusOutlined, DeleteOutlined, SaveOutlined, DownloadOutlined, DollarOutlined } from '@ant-design/icons';
import { getFieldById, assignCrop, createRotationPlan, deleteRotationPlan, updateFieldGeometry } from '../../api/fields';
import { getLeases, createLease, addLeasePayment } from '../../api/leases';
import type { FieldDetailDto, CropHistoryDto, CropRotationPlanDto, CropType } from '../../types/field';
import type { LandLeaseDto } from '../../types/lease';
import PageHeader from '../../components/PageHeader';
import FieldDrawMap from '../../components/Map/FieldDrawMap';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

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
  const [leases, setLeases] = useState<LandLeaseDto[]>([]);
  const [leaseModalOpen, setLeaseModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payIsAdvance, setPayIsAdvance] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [leaseForm] = Form.useForm();
  const [payForm] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager']);

  const load = () => {
    if (!id) return;
    getFieldById(id)
      .then(setField)
      .catch(() => message.error(t.fields.notFound))
      .finally(() => setLoading(false));
    getLeases(id).then(setLeases).catch(() => {});
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
    if (!field?.cadastralNumber) {
      message.warning(t.fields.noCadastralNumber);
      return;
    }
    setCadastreLoading(true);
    try {
      const cadnum = field.cadastralNumber.replace(/\s/g, '');
      const response = await fetch(`/api/cadastre/parcel?cadnum=${encodeURIComponent(cadnum)}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const geojson = await response.json();

      if (!geojson.features || geojson.features.length === 0) {
        message.warning(t.fields.cadastreNotFound);
        return;
      }

      const geometry = geojson.features[0].geometry;
      if (!geometry) {
        message.warning(t.fields.cadastreNoGeometry);
        return;
      }

      const geoJsonString = JSON.stringify(geometry);
      setCurrentGeoJson(geoJsonString);
      await updateFieldGeometry(id!, { geoJson: geoJsonString });
      message.success(t.fields.cadastreLoaded);
      setField(prev => prev ? { ...prev, geoJson: geoJsonString } : prev);
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

  const handleAddLease = async () => {
    try {
      const values = await leaseForm.validateFields();
      setSaving(true);
      const contractStartDate = values.contractStartDate
        ? (values.contractStartDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      const contractEndDate = values.contractEndDate
        ? (values.contractEndDate as { toISOString: () => string }).toISOString()
        : undefined;
      await createLease({ ...values, fieldId: id!, contractStartDate, contractEndDate });
      message.success(t.lease.addSuccess);
      setLeaseModalOpen(false);
      leaseForm.resetFields();
      getLeases(id!).then(setLeases);
    } catch {
      message.error(t.lease.addError);
    } finally {
      setSaving(false);
    }
  };

  const handlePay = async () => {
    if (!selectedLeaseId) return;
    try {
      const values = await payForm.validateFields();
      setSaving(true);
      const paymentDate = values.paymentDate
        ? (values.paymentDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      await addLeasePayment(selectedLeaseId, {
        ...values,
        paymentDate,
        paymentType: payIsAdvance ? 'Advance' : 'Payment',
      });
      message.success(t.lease.paySuccess);
      setPayModalOpen(false);
      payForm.resetFields();
      setSelectedLeaseId(null);
    } catch {
      message.error(t.lease.payError);
    } finally {
      setSaving(false);
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
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setAssignModalOpen(true)}>
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
                {field.cadastralNumber && (
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

      {(field.ownershipType === 1 || field.ownershipType === 2) && (
        <Card
          title={t.lease.title}
          style={{ marginTop: 16 }}
          extra={
            canWrite && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setLeaseModalOpen(true)} size="small">
                {t.lease.addLease}
              </Button>
            )
          }
        >
          {leases.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '16px 0', color: '#888' }}>
              {t.lease.noLeases}
              {canWrite && (
                <div style={{ marginTop: 8 }}>
                  <Button icon={<PlusOutlined />} onClick={() => setLeaseModalOpen(true)}>
                    {t.lease.addLease}
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <Table
              dataSource={leases}
              rowKey="id"
              pagination={false}
              columns={[
                { title: t.lease.ownerName, dataIndex: 'ownerName', key: 'ownerName' },
                { title: t.lease.contractNumber, dataIndex: 'contractNumber', key: 'contractNumber', render: (v: string) => v || '—' },
                {
                  title: t.lease.annualPayment,
                  dataIndex: 'annualPayment',
                  key: 'annualPayment',
                  align: 'right' as const,
                  render: (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 2 }),
                },
                { title: t.lease.paymentType, dataIndex: 'paymentType', key: 'paymentType', render: (v: string) => v === 'Cash' ? t.lease.cash : v === 'Grain' ? t.lease.grain : t.lease.mixed },
                {
                  title: t.common.actions,
                  key: 'actions',
                  render: (_: unknown, record: LandLeaseDto) =>
                    canWrite ? (
                      <Space>
                        <Button size="small" icon={<DollarOutlined />} onClick={() => { setSelectedLeaseId(record.id); setPayIsAdvance(false); payForm.setFieldsValue({ year: new Date().getFullYear() }); setPayModalOpen(true); }}>
                          {t.lease.makePayment}
                        </Button>
                        <Button size="small" onClick={() => { setSelectedLeaseId(record.id); setPayIsAdvance(true); payForm.setFieldsValue({ year: new Date().getFullYear() }); setPayModalOpen(true); }}>
                          {t.lease.makeAdvance}
                        </Button>
                      </Space>
                    ) : null,
                },
              ]}
            />
          )}
        </Card>
      )}

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
      {/* Add Lease Modal */}
      <Modal
        title={t.lease.addLease}
        open={leaseModalOpen}
        onOk={handleAddLease}
        onCancel={() => { setLeaseModalOpen(false); leaseForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
        width={600}
      >
        <Form form={leaseForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="ownerName" label={t.lease.ownerName} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="ownerPhone" label={t.lease.ownerPhone}>
            <Input />
          </Form.Item>
          <Form.Item name="contractNumber" label={t.lease.contractNumber}>
            <Input />
          </Form.Item>
          <Form.Item name="annualPayment" label={t.lease.annualPayment} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentType" label={t.lease.paymentType} initialValue="Cash">
            <Select options={[
              { value: 'Cash', label: t.lease.cash },
              { value: 'Grain', label: t.lease.grain },
              { value: 'Mixed', label: t.lease.mixed },
            ]} />
          </Form.Item>
          <Form.Item name="grainPaymentTons" label={t.lease.grainTons}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contractStartDate" label={t.lease.contractStart} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="contractEndDate" label={t.lease.contractEnd}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
      {/* Pay / Advance Modal */}
      <Modal
        title={payIsAdvance ? t.lease.makeAdvance : t.lease.makePayment}
        open={payModalOpen}
        onOk={handlePay}
        onCancel={() => { setPayModalOpen(false); payForm.resetFields(); setSelectedLeaseId(null); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={payForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="year" label={t.lease.year} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={2000} max={2100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="amount" label={t.lease.paymentAmount} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentDate" label={t.lease.paymentDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.lease.paymentNotes}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
