import { useEffect, useState } from 'react';
import {
  Table, Button, Modal, Form, Input, InputNumber, Select, Space, Tag, message, Popconfirm,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from '../../api/hr';
import type { EmployeeDto } from '../../types/hr';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';

export default function EmployeeList() {
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();
  const [salaryType, setSalaryType] = useState<string>('Hourly');
  const [editingEmployee, setEditingEmployee] = useState<EmployeeDto | null>(null);
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager']);

  const load = () => {
    setLoading(true);
    getEmployees()
      .then(setEmployees)
      .catch(() => message.error(t.hr.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleEdit = (employee: EmployeeDto) => {
    setEditingEmployee(employee);
    setSalaryType(employee.salaryType);
    form.setFieldsValue({
      firstName: employee.firstName,
      lastName: employee.lastName,
      position: employee.position,
      salaryType: employee.salaryType,
      hourlyRate: employee.hourlyRate,
      pieceworkRate: employee.pieceworkRate,
      notes: employee.notes,
    });
    setModalOpen(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      if (editingEmployee) {
        await updateEmployee(editingEmployee.id, { ...values, isActive: editingEmployee.isActive });
        message.success(t.hr.updateSuccess);
      } else {
        await createEmployee(values);
        message.success(t.hr.addSuccess);
      }
      form.resetFields();
      setSalaryType('Hourly');
      setEditingEmployee(null);
      setModalOpen(false);
      load();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(editingEmployee ? t.hr.updateError : t.hr.addError);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteEmployee(id);
      message.success(t.hr.deleteSuccess);
      load();
    } catch {
      message.error(t.hr.deleteError);
    }
  };

  const columns: ColumnsType<EmployeeDto> = [
    {
      title: t.hr.lastName,
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => a.lastName.localeCompare(b.lastName),
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
      render: (v?: string) => v ?? '—',
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
      key: 'rate',
      render: (_: unknown, r: EmployeeDto) => {
        if (r.salaryType === 'Hourly') return r.hourlyRate != null ? `${r.hourlyRate} ₴/год` : '—';
        return r.pieceworkRate != null ? `${r.pieceworkRate} ₴/од` : '—';
      },
    },
    {
      title: t.common.status,
      dataIndex: 'isActive',
      key: 'isActive',
      render: (v: boolean) => <Tag color={v ? 'success' : 'default'}>{v ? t.common.active : t.common.inactive}</Tag>,
    },
    ...(canWrite ? [{
      title: t.common.actions,
      key: 'actions',
      width: 120,
      render: (_: unknown, record: EmployeeDto) => (
        <Space>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={(e) => { e.stopPropagation(); handleEdit(record); }}
          />
          <Popconfirm
            title={t.hr.deleteConfirm}
            onConfirm={() => handleDelete(record.id)}
            okText={t.common.yes}
            cancelText={t.common.no}
          >
            <Button
              size="small"
              danger
              icon={<DeleteOutlined />}
              onClick={(e) => e.stopPropagation()}
            />
          </Popconfirm>
        </Space>
      ),
    }] as ColumnsType<EmployeeDto> : []),
  ];

  return (
    <div>
      <PageHeader
        title={t.hr.employeesTitle}
        actions={
          canWrite ? (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setModalOpen(true)}
              style={{ background: '#238636', borderColor: '#238636' }}
            >
              {t.hr.addEmployee}
            </Button>
          ) : undefined
        }
      />
      <Table
        columns={columns}
        dataSource={employees}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 20 }}
        style={{ background: 'transparent' }}
      />

      <Modal
        title={editingEmployee ? t.hr.editEmployee : t.hr.addEmployee}
        open={modalOpen}
        onOk={handleSave}
        onCancel={() => {
          setModalOpen(false);
          setEditingEmployee(null);
          form.resetFields();
          setSalaryType('Hourly');
        }}
        confirmLoading={saving}
        okText={t.common.save}
        cancelText={t.common.cancel}
      >
        <Form form={form} layout="vertical" initialValues={{ salaryType: 'Hourly' }}>
          <Space style={{ width: '100%' }} direction="vertical" size={0}>
            <Form.Item name="firstName" label={t.hr.firstName} rules={[{ required: true, message: t.common.required }]}>
              <Input />
            </Form.Item>
            <Form.Item name="lastName" label={t.hr.lastName} rules={[{ required: true, message: t.common.required }]}>
              <Input />
            </Form.Item>
            <Form.Item name="position" label={t.hr.position}>
              <Input />
            </Form.Item>
            <Form.Item name="salaryType" label={t.hr.salaryType} rules={[{ required: true }]}>
              <Select onChange={(v) => setSalaryType(v)}>
                <Select.Option value="Hourly">{t.hr.hourly}</Select.Option>
                <Select.Option value="Piecework">{t.hr.piecework}</Select.Option>
              </Select>
            </Form.Item>
            {salaryType === 'Hourly' && (
              <Form.Item name="hourlyRate" label={t.hr.hourlyRate}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            )}
            {salaryType === 'Piecework' && (
              <Form.Item name="pieceworkRate" label={t.hr.pieceworkRate}>
                <InputNumber min={0} style={{ width: '100%' }} />
              </Form.Item>
            )}
            <Form.Item name="notes" label={t.common.notes}>
              <Input.TextArea rows={2} />
            </Form.Item>
          </Space>
        </Form>
      </Modal>
    </div>
  );
}
