import { useEffect, useState } from 'react';
import {
  Table, Tag, Space, Select, message, Button, Modal, Form, Input,
  InputNumber, DatePicker, Card, Typography,
} from 'antd';
import { PlusOutlined, DollarOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getLeaseSummary, createLease, addLeasePayment, getLeases } from '../../api/leases';
import type { LeaseSummaryDto, LandLeaseDto } from '../../types/lease';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

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
  const [loading, setLoading] = useState(true);
  const [year, setYear] = useState(new Date().getFullYear());
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payIsAdvance, setPayIsAdvance] = useState(false);
  const [selectedLeaseId, setSelectedLeaseId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [addForm] = Form.useForm();
  const [payForm] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();

  const canWrite = hasRole(['Administrator', 'Manager']);

  const yearOptions = Array.from({ length: 10 }, (_, i) => {
    const y = new Date().getFullYear() - 2 + i;
    return { value: y, label: String(y) };
  });

  const load = () => {
    setLoading(true);
    Promise.all([getLeaseSummary(year), getLeases()])
      .then(([s, l]) => { setSummary(s); setLeases(l); })
      .catch(() => message.error(t.lease.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [year]);

  const leaseOptions = leases.map((l) => ({
    value: l.id,
    label: `${l.fieldName} — ${l.ownerName}`,
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
      title: t.lease.totalPaid,
      dataIndex: 'totalPaid',
      key: 'totalPaid',
      align: 'right',
      render: (v: number) => v.toLocaleString('uk-UA', { maximumFractionDigits: 2 }),
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
              </>
            )}
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader title={t.lease.title} subtitle={t.lease.subtitle} />

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <span>{t.lease.year}:</span>
          <Select
            value={year}
            options={yearOptions}
            onChange={setYear}
            style={{ width: 100 }}
          />
          {canWrite && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setAddModalOpen(true)}>
              {t.lease.addLease}
            </Button>
          )}
        </Space>
      </Card>

      <Table
        dataSource={summary}
        columns={columns}
        rowKey="landLeaseId"
        loading={loading}
        pagination={false}
        locale={{ emptyText: t.lease.noLeases }}
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
        <Form form={addForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item name="fieldId" label={t.lease.field} rules={[{ required: true, message: t.common.required }]}>
            <Select options={leaseOptions.length > 0 ? leaseOptions : []} showSearch placeholder={t.lease.field} />
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

      {/* Pay Modal */}
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
