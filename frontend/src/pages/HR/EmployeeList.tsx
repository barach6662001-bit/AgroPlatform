import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Switch, Space, Tag, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getEmployees, createEmployee } from '../../api/hr';
import type { EmployeeDto } from '../../api/hr';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canCreate = hasRole(['Administrator', 'Manager']);

  const load = () => {
    setLoading(true);
    getEmployees()
      .then(setEmployees)
      .catch(() => message.error('Помилка завантаження'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (values: {
    firstName: string;
    lastName: string;
    position?: string;
    salaryType: string;
    hourlyRate?: number;
    pieceworkRate?: number;
    notes?: string;
  }) => {
    setSaving(true);
    try {
      await createEmployee(values);
      message.success(t.hr.addEmployee);
      setModalOpen(false);
      form.resetFields();
      load();
    } catch {
      message.error('Помилка збереження');
    } finally {
      setSaving(false);
    }
  };

  const columns = [
    {
      title: t.hr.lastName,
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: t.hr.firstName,
      dataIndex: 'firstName',
      key: 'firstName',
    },
    {
      title: t.hr.position,
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: t.hr.salaryType,
      dataIndex: 'salaryType',
      key: 'salaryType',
      render: (v: string) => (
        <Tag color={v === 'Hourly' ? 'blue' : 'green'}>
          {v === 'Hourly' ? t.hr.hourly : t.hr.piecework}
        </Tag>
      ),
    },
    {
      title: t.hr.hourlyRate,
      dataIndex: 'hourlyRate',
      key: 'hourlyRate',
      render: (v?: number) => v != null ? v.toFixed(2) : '—',
    },
    {
      title: t.hr.pieceworkRate,
      dataIndex: 'pieceworkRate',
      key: 'pieceworkRate',
      render: (v?: number) => v != null ? v.toFixed(2) : '—',
    },
    {
      title: 'Активний',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'green' : 'red'}>{v ? 'Так' : 'Ні'}</Tag>,
    },
  ];

  return (
    <>
      <PageHeader
        title={t.hr.employeesTitle}
        extra={
          canCreate && (
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>
              {t.hr.addEmployee}
            </Button>
          )
        }
      />

      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
      />

      <Modal
        title={t.hr.addEmployee}
        open={modalOpen}
        onCancel={() => { setModalOpen(false); form.resetFields(); }}
        onOk={() => form.submit()}
        confirmLoading={saving}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Space style={{ width: '100%' }} direction="vertical">
            <Form.Item name="firstName" label={t.hr.firstName} rules={[{ required: true, message: t.common.required }]}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label={t.hr.lastName} rules={[{ required: true, message: t.common.required }]}>
              <Input />
            </Form.Item>
            <Form.Item name="position" label={t.hr.position}>
              <Input />
            </Form.Item>
            <Form.Item name="salaryType" label={t.hr.salaryType} initialValue="Hourly" rules={[{ required: true }]}>
              <Select>
                <Select.Option value="Hourly">{t.hr.hourly}</Select.Option>
                <Select.Option value="Piecework">{t.hr.piecework}</Select.Option>
              </Select>
            </Form.Item>
            <Form.Item name="hourlyRate" label={t.hr.hourlyRate}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="pieceworkRate" label={t.hr.pieceworkRate}>
              <InputNumber min={0} precision={2} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="notes" label={t.common.notes}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
}
