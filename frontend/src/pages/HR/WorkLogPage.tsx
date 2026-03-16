import { useEffect, useState, useMemo } from 'react';
import {
  Table, Button, Modal, Form, Select, DatePicker, InputNumber,
  Input, message, Typography, Space,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import dayjs, { Dayjs } from 'dayjs';
import { getEmployees, getWorkLogs, createWorkLog } from '../../api/hr';
import type { EmployeeDto, WorkLogDto } from '../../api/hr';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

const { Text } = Typography;

export default function WorkLogPage() {
  const now = dayjs();
  const [month, setMonth] = useState(now.month() + 1);
  const [year, setYear] = useState(now.year());
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [logs, setLogs] = useState<WorkLogDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canCreate = hasRole(['Administrator', 'Manager', 'Agronomist']);

  const daysInMonth = useMemo(() => dayjs(`${year}-${month}-01`).daysInMonth(), [year, month]);

  const load = () => {
    setLoading(true);
    Promise.all([
      getEmployees({ activeOnly: true }),
      getWorkLogs({ month, year }),
    ])
      .then(([emps, wl]) => { setEmployees(emps); setLogs(wl); })
      .catch(() => message.error('Помилка завантаження'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [month, year]);

  const handleCreate = async (values: {
    employeeId: string;
    workDate: Dayjs;
    hoursWorked?: number;
    unitsProduced?: number;
    workDescription?: string;
  }) => {
    setSaving(true);
    try {
      await createWorkLog({
        ...values,
        workDate: values.workDate.toISOString(),
      });
      message.success(t.hr.accrued);
      setModalOpen(false);
      form.resetFields();
      load();
    } catch {
      message.error('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  // Build timesheet: rows = employees, columns = days
  const timesheetData = employees.map((emp) => {
    const row: Record<string, string | number> = {
      key: emp.id,
      name: `${emp.lastName} ${emp.firstName}`,
    };
    let total = 0;
    for (let d = 1; d <= daysInMonth; d++) {
      const dayLogs = logs.filter(
        (l) => l.employeeId === emp.id && dayjs(l.workDate).date() === d,
      );
      const val = dayLogs.reduce(
        (s, l) => s + (l.hoursWorked ?? l.unitsProduced ?? 0),
        0,
      );
      row[`d${d}`] = val > 0 ? val : '';
      total += dayLogs.reduce((s, l) => s + l.accruedAmount, 0);
    }
    row['total'] = total;
    return row;
  });

  const dayColumns = Array.from({ length: daysInMonth }, (_, i) => ({
    title: `${i + 1}`,
    dataIndex: `d${i + 1}`,
    key: `d${i + 1}`,
    width: 36,
    render: (v: string | number) => <Text style={{ fontSize: 11 }}>{v || ''}</Text>,
  }));

  const columns = [
    {
      title: 'Співробітник',
      dataIndex: 'name',
      key: 'name',
      fixed: 'left' as const,
      width: 150,
    },
    ...dayColumns,
    {
      title: t.hr.accrued,
      dataIndex: 'total',
      key: 'total',
      fixed: 'right' as const,
      width: 100,
      render: (v: number) => <Text strong>{(v || 0).toFixed(2)}</Text>,
    },
  ];

  const months = Array.from({ length: 12 }, (_, i) => ({ label: `${i + 1}`, value: i + 1 }));
  const years = [year - 1, year, year + 1];

  return (
    <>
      <PageHeader
        title={t.hr.workLogsTitle}
        extra={
          <Space>
            <Select value={month} onChange={setMonth} options={months} style={{ width: 70 }} />
            <Select value={year} onChange={setYear} style={{ width: 90 }}>
              {years.map((y) => <Select.Option key={y} value={y}>{y}</Select.Option>)}
            </Select>
            {canCreate && (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
                Додати запис
              </Button>
            )}
          </Space>
        }
      />

      <Table
        columns={columns}
        dataSource={timesheetData}
        loading={loading}
        pagination={false}
        scroll={{ x: 'max-content' }}
        size="small"
      />

      <Modal
        title="Додати запис у табель"
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item name="employeeId" label="Співробітник" rules={[{ required: true, message: t.common.required }]}>
            <Select showSearch optionFilterProp="children">
              {employees.map((e) => (
                <Select.Option key={e.id} value={e.id}>
                  {e.lastName} {e.firstName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="workDate" label={t.common.date} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="hoursWorked" label={t.hr.hoursWorked}>
            <InputNumber min={0} precision={2} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unitsProduced" label={t.hr.unitsProduced}>
            <InputNumber min={0} precision={4} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="workDescription" label="Опис роботи">
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
