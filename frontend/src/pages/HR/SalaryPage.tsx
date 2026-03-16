import { useEffect, useState } from 'react';
import {
  Card, Col, Row, Button, Modal, Form, Select, DatePicker,
  InputNumber, Input, message, Statistic, Space, Typography,
} from 'antd';
import { DollarOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { getSalarySummary, createSalaryPayment, getEmployees } from '../../api/hr';
import type { SalarySummaryDto, SalarySummaryItemDto, EmployeeDto } from '../../api/hr';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const { Text } = Typography;

interface PayModalState {
  open: boolean;
  employee?: SalarySummaryItemDto;
  paymentType: 'Salary' | 'Advance';
}

export default function SalaryPage() {
  const now = dayjs();
  const [month, setMonth] = useState(now.month() + 1);
  const [year, setYear] = useState(now.year());
  const [summary, setSummary] = useState<SalarySummaryDto | null>(null);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModal, setPayModal] = useState<PayModalState>({ open: false, paymentType: 'Salary' });
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canPay = hasRole(['Administrator', 'Manager', 'Director']);

  const load = () => {
    setLoading(true);
    Promise.all([
      getSalarySummary({ month, year }),
      getEmployees({ activeOnly: true }),
    ])
      .then(([s, emps]) => { setSummary(s); setEmployees(emps); })
      .catch(() => message.error('Помилка завантаження'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [month, year]);

  const openPayModal = (item: SalarySummaryItemDto, paymentType: 'Salary' | 'Advance') => {
    setPayModal({ open: true, employee: item, paymentType });
    form.setFieldsValue({
      amount: paymentType === 'Salary' ? Math.max(0, item.debt) : undefined,
      paymentDate: dayjs(),
    });
  };

  const handlePay = async (values: {
    amount: number;
    paymentDate: Dayjs;
    notes?: string;
  }) => {
    if (!payModal.employee) return;
    setSaving(true);
    try {
      await createSalaryPayment({
        employeeId: payModal.employee.employeeId,
        amount: values.amount,
        paymentDate: values.paymentDate.toISOString(),
        paymentType: payModal.paymentType,
        notes: values.notes,
      });
      message.success(t.hr.paySuccess);
      setPayModal({ open: false, paymentType: 'Salary' });
      form.resetFields();
      load();
    } catch {
      message.error('Помилка виплати');
    } finally {
      setSaving(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));
  const years = [year - 1, year, year + 1];

  return (
    <>
      <PageHeader
        title={t.hr.salaryTitle}
        extra={
          <Space>
            <Select value={month} onChange={setMonth} options={months} style={{ width: 70 }} />
            <Select value={year} onChange={setYear} style={{ width: 90 }}>
              {years.map((y) => <Select.Option key={y} value={y}>{y}</Select.Option>)}
            </Select>
          </Space>
        }
      />

      {summary && (
        <Card style={{ marginBottom: 16 }}>
          <Row gutter={16}>
            <Col span={8}>
              <Statistic title={t.hr.totalAccrued} value={summary.totalAccrued} precision={2} suffix="грн" />
            </Col>
            <Col span={8}>
              <Statistic title={t.hr.totalPaid} value={summary.totalPaid} precision={2} suffix="грн" valueStyle={{ color: '#52c41a' }} />
            </Col>
            <Col span={8}>
              <Statistic title={t.hr.debt} value={summary.totalDebt} precision={2} suffix="грн" valueStyle={{ color: summary.totalDebt > 0 ? '#ff4d4f' : undefined }} />
            </Col>
          </Row>
        </Card>
      )}

      <Row gutter={[16, 16]} style={{ opacity: loading ? 0.5 : 1 }}>
        {(summary?.items ?? []).map((item) => (
          <Col key={item.employeeId} xs={24} sm={12} md={8} lg={6}>
            <Card
              title={item.employeeName}
              size="small"
              actions={
                canPay
                  ? [
                      <Button
                        key="pay"
                        type="primary"
                        size="small"
                        icon={<DollarOutlined />}
                        onClick={() => openPayModal(item, 'Salary')}
                        disabled={item.debt <= 0}
                      >
                        {t.hr.payNow}
                      </Button>,
                      <Button
                        key="advance"
                        size="small"
                        onClick={() => openPayModal(item, 'Advance')}
                      >
                        {t.hr.advance}
                      </Button>,
                    ]
                  : undefined
              }
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Row justify="space-between">
                  <Text type="secondary">{t.hr.totalAccrued}:</Text>
                  <Text>{item.totalAccrued.toFixed(2)} грн</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">{t.hr.totalPaid}:</Text>
                  <Text style={{ color: '#52c41a' }}>{item.totalPaid.toFixed(2)} грн</Text>
                </Row>
                <Row justify="space-between">
                  <Text type="secondary">{t.hr.debt}:</Text>
                  <Text strong style={{ color: item.debt > 0 ? '#ff4d4f' : '#52c41a' }}>
                    {item.debt.toFixed(2)} грн
                  </Text>
                </Row>
              </Space>
            </Card>
          </Col>
        ))}
      </Row>

      <Modal
        title={payModal.paymentType === 'Salary' ? t.hr.payNow : t.hr.advance}
        open={payModal.open}
        onCancel={() => { setPayModal({ open: false, paymentType: 'Salary' }); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={saving}
      >
        {payModal.employee && (
          <Text strong style={{ display: 'block', marginBottom: 12 }}>
            {payModal.employee.employeeName}
          </Text>
        )}
        <Form form={form} layout="vertical" onFinish={handlePay}>
          <Form.Item name="amount" label="Сума (грн)" rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.01} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="paymentDate" label={t.hr.paymentDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
