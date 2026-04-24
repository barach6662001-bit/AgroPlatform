import { useEffect, useState } from 'react';
import { Tag, Space, Select, message, Button, Modal, Form, Input, InputNumber, DatePicker, Card, Typography, Radio, Progress,  } from 'antd';
import { PlusOutlined, DollarOutlined, EditOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getLeaseSummary, createLease, addLeasePayment, getLeases, updateLease } from '../../api/leases';
import { getFields } from '../../api/fields';
import { getGrainBatches } from '../../api/grain';
import type { LeaseSummaryDto, LandLeaseDto } from '../../types/lease';
import type { FieldDto } from '../../types/field';
import type { GrainBatchDto } from '../../types/grain';
import type { PaginatedResult } from '../../types/common';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import { useFormatCurrency, useCurrencySymbol } from '../../hooks/useFormatCurrency';
import { useRole } from '../../hooks/useRole';
import dayjs from 'dayjs';
import s from './LeasePage.module.css';
import DataTable from '../../components/ui/DataTable';

const { Text } = Typography;

const statusColors: Record<string, string> = {
  Paid: 'success',
  Partial: 'warning',
  Unpaid: 'error',
  Overpaid: 'cyan',
};

export default function LeasePage() {
  const [summary, setSummary] = useState<LeaseSummaryDto[]>([]);
  const [leases, setLeases] = useState<LandLeaseDto[]>([]);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingLease, setEditingLease] = useState<LandLeaseDto | null>(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payIsAdvance, setPayIsAdvance] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'grain'>('cash');
  const [grainBatches, setGrainBatches] = useState<GrainBatchDto[]>([]);
  const [selectedBatch, setSelectedBatch] = useState<GrainBatchDto | undefined>(undefined);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [payForm] = Form.useForm();
  const { t } = useTranslation();
  const fmt = useFormatCurrency();
  const currencySymbol = useCurrencySymbol();
  const { hasPermission } = useRole();

  const canWrite = hasPermission('fields', 'manage');

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const y = new Date().getFullYear() - 2 + i;
    return { value: y, label: String(y) };
  });

  useEffect(() => {
    getFields({ ownershipType: [1, 2], pageSize: 200 })
      .then((r) => setFields(r.items))
      .catch(() => {/* ignore */});
  }, []);

  useEffect(() => {
    getGrainBatches({ pageSize: 200 })
      .then((r: PaginatedResult<GrainBatchDto>) =>
        setGrainBatches((r.items ?? []).filter(b => b.quantityTons >= 0.001))
      )
      .catch(() => {/* ignore */});
  }, []);

  const load = () => {
    setLoading(true);
    Promise.all([getLeaseSummary(year), getLeases()])
      .then(([s, l]) => { setSummary(s); setLeases(l); })
      .catch(() => message.error(t.lease.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [year]);

  useEffect(() => {
    if (payModalOpen) {
      getGrainBatches({ pageSize: 200 })
        .then(r => setGrainBatches(r.items ?? []))
        .catch(() => {/* ignore */});
    }
  }, [payModalOpen]);

  const fieldOptions = fields.map((f) => ({
    value: f.id,
    label: `${f.name} (${f.areaHectares.toFixed(1)} га)`,
  }));

  const handleAddLease = async () => {
    try {
      const values = await addForm.validateFields();
      setSaving(true);
      const contractStartDate = values.contractStartDate
        ? (values.contractStartDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      const contractEndDate = values.contractEndDate
        ? (values.contractEndDate as { toISOString: () => string }).toISOString()
        : undefined;
      await createLease({ ...values, contractStartDate, contractEndDate });
      message.success(t.lease.addSuccess);
      setAddModalOpen(false);
      addForm.resetFields();
      load();
    } catch {
      message.error(t.lease.addError);
    } finally {
      setSaving(false);
    }
  };

  const handleEditLease = async () => {
    if (!editingLease) return;
    try {
      const values = await editForm.validateFields();
      setSaving(true);
      const contractEndDate = values.contractEndDate
        ? (values.contractEndDate as { toISOString: () => string }).toISOString()
        : undefined;
      await updateLease(editingLease.id, { ...values, contractEndDate, isActive: editingLease.isActive });
      message.success(t.lease.editSuccess);
      setEditModalOpen(false);
      editForm.resetFields();
      setEditingLease(null);
      load();
    } catch {
      message.error(t.lease.editError);
    } finally {
      setSaving(false);
    }
  };

  const openEditModal = (lease: LandLeaseDto) => {
    setEditingLease(lease);
    editForm.setFieldsValue({
      ownerName: lease.ownerName,
      ownerPhone: lease.ownerPhone,
      contractNumber: lease.contractNumber,
      annualPayment: lease.annualPayment,
      paymentType: lease.paymentType,
      grainPaymentTons: lease.grainPaymentTons,
      contractEndDate: lease.contractEndDate ? dayjs(lease.contractEndDate) : undefined,
      notes: lease.notes,
      isActive: lease.isActive,
    });
    setEditModalOpen(true);
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
        paymentMethod: paymentMethod === 'grain' ? 'Grain' : 'Cash',
        grainBatchId: paymentMethod === 'grain' ? values.grainBatchId : undefined,
        grainQuantityTons: paymentMethod === 'grain' ? values.grainQuantityTons : undefined,
        grainPricePerTon: paymentMethod === 'grain' ? values.grainPricePerTon : undefined,
      });
      message.success(t.lease.paySuccess);
      setPayModalOpen(false);
      payForm.resetFields();
      setPaymentMethod('cash');
      setSelectedBatch(undefined);
      setSelectedLeaseId(null);
      load();
    } catch {
      message.error(t.lease.payError);
    } finally {
      setSaving(false);
    }
  };

  const openPayModal = (leaseId: string, isAdvance: boolean) => {
    setSelectedLeaseId(leaseId);
    setPayIsAdvance(isAdvance);
    setPaymentMethod('cash');
    setSelectedBatch(undefined);
    payForm.setFieldsValue({ year });
    setPayModalOpen(true);
  };

  const columns: ColumnsType<LeaseSummaryDto> = [
    { title: t.lease.field, dataIndex: 'fieldName', key: 'fieldName', sorter: (a, b) => a.fieldName.localeCompare(b.fieldName) },
    { title: t.lease.ownerName, dataIndex: 'ownerName', key: 'ownerName' },
    {
      title: t.lease.annual,
      dataIndex: 'annualPayment',
      key: 'annualPayment',
      align: 'right',
      render: (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 2 }),
    },
    {
      title: t.lease.advance,
      dataIndex: 'advancePaid',
      key: 'advancePaid',
      align: 'right',
      render: (v: number) => v > 0 ? <Text type="warning">{v.toLocaleString('uk-UA', { maximumFractionDigits: 2 })}</Text> : '—',
    },
    {
      title: 'Оплата',
      key: 'progress',
      width: 200,
      render: (_: unknown, record: LeaseSummaryDto) => {
        const paid = record.totalPaid || 0;
        const total = record.annualPayment || 0;
        const pct = total > 0 ? Math.min(Math.round((paid / total) * 100), 100) : 0;
        return (
          <div>
            <Progress percent={pct} size="small" strokeColor={pct >= 100 ? 'var(--success)' : pct > 0 ? 'var(--warning)' : 'var(--error)'} showInfo={false} />
            <Text type="secondary" className={s.text11}>{fmt(paid, { fractionDigits: 0 })} / {fmt(total, { fractionDigits: 0 })}</Text>
          </div>
        );
      },
    },
    {
      title: t.lease.remaining,
      dataIndex: 'remaining',
      key: 'remaining',
      align: 'right',
      render: (v: number) => (
        <Text type={v > 0 ? 'danger' : v < 0 ? 'warning' : 'success'}>
          {Math.abs(v).toLocaleString('uk-UA', { maximumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: t.common.actions,
      key: 'status',
      render: (_, record) => {
        const statusLabel =
          record.status === 'Paid' ? t.lease.statusPaid :
          record.status === 'Partial' ? t.lease.statusPartial :
          record.status === 'Overpaid' ? t.lease.statusOverpaid :
          t.lease.statusUnpaid;
        const lease = leases.find((l) => l.id === record.landLeaseId);
        return (
          <Space>
            <Tag color={statusColors[record.status]}>{statusLabel}</Tag>
            {canWrite && (
              <>
                <Button size="small" icon={<DollarOutlined />} onClick={() => openPayModal(record.landLeaseId, false)}>
                  {t.lease.makePayment}
                </Button>
                <Button size="small" onClick={() => openPayModal(record.landLeaseId, true)}>
                  {t.lease.makeAdvance}
                </Button>
                {lease && (
                  <Button size="small" icon={<EditOutlined />} onClick={() => openEditModal(lease)} />
                )}
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.lease.title}
        subtitle={t.lease.subtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.fields, path: '/fields' }, { label: t.nav.leases }]} />}
      />

      <Card className={s.spaced}>
        <Space wrap>
          <span>{t.lease.year}:</span>
          <Select
            value={year}
            options={yearOptions}
            onChange={setYear}
            className={s.block2}
          />
          {canWrite && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
              {t.lease.addLease}
            </Button>
          )}
        </Space>
      </Card>

      <DataTable
        dataSource={summary}
        columns={columns}
        rowKey="landLeaseId"
        loading={loading}
        pagination={false}
        locale={{ emptyText: t.lease.noLeases }}
        expandable={{
          expandedRowRender: (record) => {
            const payments = record.payments || [];
            if (!payments.length) return <Text type="secondary">Виплат ще не було</Text>;
            return (
              <DataTable
                size="small"
                dataSource={payments}
                columns={[
                  { title: 'Дата', dataIndex: 'paymentDate', render: (d: string) => dayjs(d).format('DD.MM.YYYY') },
                  { title: 'Сума', dataIndex: 'amount', render: (v: number) => fmt(v) },
                  { title: 'Спосіб', dataIndex: 'paymentMethod', render: (v: string) => v === 'Grain' ? 'Зерном' : 'Грошима' },
                  { title: 'Примітка', dataIndex: 'notes', render: (v: string) => v || '—' },
                ]}
                rowKey="id"
                pagination={false}
              />
            );
          },
        }}
      />

      {/* Add Lease Modal */}
      <Modal
        title={t.lease.addLease}
        open={addModalOpen}
        onOk={handleAddLease}
        onCancel={() => { setAddModalOpen(false); addForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
        width={600}
      >
        <Form form={addForm} layout="vertical" className={s.spaced1}>
          <Form.Item name="fieldId" label={t.lease.field} rules={[{ required: true, message: t.common.required }]}>
            <Select
              showSearch
              placeholder={t.lease.selectField}
              options={fieldOptions}
              optionFilterProp="label"
            />
          </Form.Item>
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
            <InputNumber min={0} precision={2} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="paymentType" label={t.lease.paymentType} initialValue="Cash">
            <Select options={[
              { value: 'Cash', label: t.lease.cash },
              { value: 'Grain', label: t.lease.grain },
              { value: 'Mixed', label: t.lease.mixed },
            ]} />
          </Form.Item>
          <Form.Item name="grainPaymentTons" label={t.lease.grainTons}>
            <InputNumber min={0} precision={4} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="contractStartDate" label={t.lease.contractStart} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="contractEndDate" label={t.lease.contractEnd}>
            <DatePicker className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Lease Modal */}
      <Modal
        title={t.lease.editLease}
        open={editModalOpen}
        onOk={handleEditLease}
        onCancel={() => { setEditModalOpen(false); editForm.resetFields(); setEditingLease(null); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
        width={600}
      >
        <Form form={editForm} layout="vertical" className={s.spaced1}>
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
            <InputNumber min={0} precision={2} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="paymentType" label={t.lease.paymentType}>
            <Select options={[
              { value: 'Cash', label: t.lease.cash },
              { value: 'Grain', label: t.lease.grain },
              { value: 'Mixed', label: t.lease.mixed },
            ]} />
          </Form.Item>
          <Form.Item name="grainPaymentTons" label={t.lease.grainTons}>
            <InputNumber min={0} precision={4} className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="contractEndDate" label={t.lease.contractEnd}>
            <DatePicker className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Pay Modal */}
      <Modal
        title={payIsAdvance ? t.lease.makeAdvance : t.lease.makePayment}
        open={payModalOpen}
        onOk={handlePay}
        onCancel={() => { setPayModalOpen(false); payForm.resetFields(); setSelectedLeaseId(null); setPaymentMethod('cash'); setSelectedBatch(undefined); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={saving}
      >
        <Form form={payForm} layout="vertical" className={s.spaced1}>
          <Form.Item name="paymentMethod" label={t.lease.paymentMethod} initialValue="cash">
            <Radio.Group onChange={e => setPaymentMethod(e.target.value)}>
              <Radio.Button value="cash">{t.lease.paymentCash}</Radio.Button>
              <Radio.Button value="grain">{t.lease.paymentGrain}</Radio.Button>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="year" label={t.lease.year} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={2000} max={2100} className={s.fullWidth} />
          </Form.Item>
          {paymentMethod === 'cash' && (
            <Form.Item name="amount" label={t.lease.paymentAmount} rules={[{ required: true, message: t.common.required }]}>
              <InputNumber min={0} precision={2} className={s.fullWidth} />
            </Form.Item>
          )}
          {paymentMethod === 'grain' && (
            <>
              <Form.Item name="grainBatchId" label={t.lease.grainBatch} rules={[{ required: true, message: t.common.required }]}>
                <Select
                  showSearch
                  placeholder={t.lease.grainBatch}
                  options={grainBatches.map(b => ({
                    value: b.id,
                    label: `${b.grainType} — ${t.lease.grainQuantity.split(' ')[0]}: ${b.quantityTons} т`,
                  }))}
                  onChange={(val) => {
                    const batch = grainBatches.find(b => b.id === val);
                    setSelectedBatch(batch);
                    if (batch?.pricePerTon) {
                      payForm.setFieldsValue({ grainPricePerTon: batch.pricePerTon });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item name="grainQuantityTons" label={t.lease.grainQuantity} rules={[{ required: true, message: t.common.required }]}>
                <InputNumber
                  min={0.001}
                  max={selectedBatch?.quantityTons}
                  precision={3}
                  addonAfter="т"
                  className={s.fullWidth}
                  onChange={(val) => {
                    const price = payForm.getFieldValue('grainPricePerTon');
                    if (val && price) {
                      payForm.setFieldsValue({ amount: parseFloat((val * price).toFixed(2)) });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item name="grainPricePerTon" label={t.lease.grainPricePerTon}>
                <InputNumber
                  min={0}
                  precision={2}
                  addonAfter={`${currencySymbol}/т`}
                  className={s.fullWidth}
                  onChange={(price) => {
                    const qty = payForm.getFieldValue('grainQuantityTons');
                    if (qty && price) {
                      payForm.setFieldsValue({ amount: parseFloat((qty * price).toFixed(2)) });
                    }
                  }}
                />
              </Form.Item>
              <Form.Item name="amount" label={t.lease.calculatedAmount}>
                <InputNumber disabled addonAfter={currencySymbol} className={s.fullWidth} />
              </Form.Item>
            </>
          )}
          <Form.Item name="paymentDate" label={t.lease.paymentDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker className={s.fullWidth} />
          </Form.Item>
          <Form.Item name="notes" label={t.lease.paymentNotes}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
