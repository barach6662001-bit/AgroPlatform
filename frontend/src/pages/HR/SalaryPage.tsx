import { useEffect, useState } from 'react';
import {
  Card, Row, Col, Select, Statistic, Button, Modal, Form, InputNumber,
  DatePicker, Input, message, Space, Typography,
} from 'antd';
import { DollarOutlined, PrinterOutlined } from '@ant-design/icons';
import { printReport } from '../../utils/printReport';
import dayjs from 'dayjs';
import { getSalarySummary, createSalaryPayment, getEmployees } from '../../api/hr';
import type { SalarySummaryDto, EmployeeDto } from '../../types/hr';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const { Text } = Typography;

export default function SalaryPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [summary, setSummary] = useState<SalarySummaryDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [payIsAdvance, setPayIsAdvance] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [payForm] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager']);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: dayjs().month(i).format('MMMM'),
  }));

  const yearOptions = Array.from({ length: 5 }, (_, i) => {
    const y = now.getFullYear() - 2 + i;
    return { value: y, label: String(y) };
  });

  const load = () => {
    setLoading(true);
    Promise.all([getSalarySummary(month, year), getEmployees()])
      .then(([s, e]) => { setSummary(s); setEmployees(e); })
      .catch(() => message.error(t.hr.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [month, year]);

  const openPayModal = (employeeId: string, isAdvance: boolean) => {
    setSelectedEmployeeId(employeeId);
    setPayIsAdvance(isAdvance);
    payForm.resetFields();
    setPayModalOpen(true);
  };

  const handlePay = async () => {
    if (!selectedEmployeeId) return;
    try {
      const values = await payForm.validateFields();
      setSaving(true);
      const paymentDate = values.paymentDate
        ? (values.paymentDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      await createSalaryPayment({
        employeeId: selectedEmployeeId,
        amount: values.amount,
        paymentDate,
        paymentType: payIsAdvance ? 'Advance' : 'Salary',
        notes: values.notes,
      });
      message.success(t.hr.paySuccess);
      setPayModalOpen(false);
      payForm.resetFields();
      setSelectedEmployeeId(null);
      load();
    } catch {
      message.error(t.hr.payError);
    } finally {
      setSaving(false);
    }
  };

  const employeeMap = Object.fromEntries(employees.map((e) => [e.id, e]));

  const cardStyle: React.CSSProperties = {
    background: '#0d1117',
    border: '1px solid #30363d',
    borderRadius: 8,
  };

  return (
    <div>
      <PageHeader
        title={t.hr.salaryTitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.hr, path: '/hr/employees' }, { label: t.nav.salary }]} />}
      />

      <Space style={{ marginBottom: 20 }}>
        <Select options={monthOptions} value={month} onChange={setMonth} style={{ width: 130 }} />
        <Select options={yearOptions} value={year} onChange={setYear} style={{ width: 90 }} />
        <Button icon={<PrinterOutlined />} onClick={() => printReport(t.hr.salaryTitle || 'Зарплата', `<table><thead><tr><th>Прізвище</th><th>Нарахована</th><th>Виплачена</th><th>Залишок</th></tr></thead><tbody>${summary.map(s => `<tr><td>${s.employeeFullName}</td><td>${s.totalAccrued}</td><td>${s.totalPaid}</td><td>${s.totalAccrued - s.totalPaid}</td></tr>`).join('')}</tbody></table>`)}>Друк</Button>
      </Space>

      {loading ? (
        <Text style={{ color: '#8b949e' }}>{t.common.loading}</Text>
      ) : (
        <Row gutter={[16, 16]}>
          {summary.map((s) => {
            const emp = employeeMap[s.employeeId];
            return (
              <Col key={s.employeeId} xs={24} sm={12} md={8} lg={6}>
                <Card style={cardStyle} bodyStyle={{ padding: 16 }}>
                  <div style={{ marginBottom: 8 }}>
                    <Text strong style={{ color: '#e6edf3', fontSize: 15 }}>
                      {s.employeeFullName}
                    </Text>
                    {s.position && (
                      <Text style={{ color: '#8b949e', display: 'block', fontSize: 12 }}>
                        {s.position}
                      </Text>
                    )}
                    {emp && (
                      <Text style={{ color: '#6b7280', display: 'block', fontSize: 12 }}>
                        {emp.salaryType === 'Hourly' ? t.hr.hourly : t.hr.piecework}
                      </Text>
                    )}
                  </div>
                  <Row gutter={8} style={{ marginBottom: 12 }}>
                    <Col span={8}>
                      <Statistic
                        title={<span style={{ color: '#8b949e', fontSize: 11 }}>{t.hr.totalAccrued}</span>}
                        value={s.totalAccrued}
                        precision={2}
                        suffix="₴"
                        valueStyle={{ color: '#3fb950', fontSize: 14 }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title={<span style={{ color: '#8b949e', fontSize: 11 }}>{t.hr.totalPaid}</span>}
                        value={s.totalPaid}
                        precision={2}
                        suffix="₴"
                        valueStyle={{ color: '#60a5fa', fontSize: 14 }}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title={<span style={{ color: '#8b949e', fontSize: 11 }}>{t.hr.debt}</span>}
                        value={s.debt}
                        precision={2}
                        suffix="₴"
                        valueStyle={{ color: s.debt > 0 ? '#f85149' : '#3fb950', fontSize: 14 }}
                      />
                    </Col>
                  </Row>
                  {canWrite && (
                    <Space>
                      {/* button styles handled by CSS */}
                      <Button
                        type="primary"
                        size="small"
                        icon={<DollarOutlined />}
                        onClick={() => openPayModal(s.employeeId, false)}
                      >
                        {t.hr.payNow}
                      </Button>
                      <Button
                        size="small"
                        onClick={() => openPayModal(s.employeeId, true)}
                      >
                        {t.hr.advance}
                      </Button>
                    </Space>
                  )}
                </Card>
              </Col>
            );
          })}
          {summary.length === 0 && (
            <Col span={24}>
              <Text style={{ color: '#6b7280' }}>{t.common.noData}</Text>
            </Col>
          )}
        </Row>
      )}

      <Modal
        title={payIsAdvance ? t.hr.advance : t.hr.payNow}
        open={payModalOpen}
        onOk={handlePay}
        onCancel={() => { setPayModalOpen(false); payForm.resetFields(); }}
        confirmLoading={saving}
        okText={t.common.confirm}
        cancelText={t.common.cancel}
      >
        <Form form={payForm} layout="vertical" initialValues={{ paymentDate: dayjs() }}>
          <Form.Item
            name="amount"
            label={t.lease.paymentAmount}
            rules={[{ required: true, message: t.common.required }]}
          >
            <InputNumber min={0.01} style={{ width: '100%' }} suffix="₴" />
          </Form.Item>
          <Form.Item
            name="paymentDate"
            label={t.hr.paymentDate}
            rules={[{ required: true, message: t.common.required }]}
          >
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
