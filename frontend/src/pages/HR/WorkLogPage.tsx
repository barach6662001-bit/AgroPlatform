import { exportToCsv } from '../../utils/exportCsv';
import { useEffect, useState, useMemo } from 'react';
import {
  Table, Select, Button, Modal, Form, DatePicker, InputNumber, Input, message, Space,
} from 'antd';
import { PlusOutlined, EditOutlined, DownloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { getWorkLogs, createWorkLog, updateWorkLog, deleteWorkLog, getEmployees } from '../../api/hr';
import type { WorkLogDto, EmployeeDto } from '../../types/hr';
import PageHeader from '../../components/PageHeader';
import TableSkeleton from '../../components/TableSkeleton';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';

export default function WorkLogPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [employeeId, setEmployeeId] = useState<string | undefined>();
  const [workLogs, setWorkLogs] = useState<WorkLogDto[]>([]);
  const [employees, setEmployees] = useState<EmployeeDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingLog, setEditingLog] = useState<WorkLogDto | null>(null);
  const [form] = Form.useForm();
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
    Promise.all([
      getWorkLogs({ employeeId, month, year }),
      getEmployees(),
    ])
      .then(([logs, emps]) => { setWorkLogs(logs); setEmployees(emps); })
      .catch(() => message.error(t.hr.loadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [employeeId, month, year]);

  const employeeOptions = employees.map((e) => ({
    value: e.id,
    label: `${e.lastName} ${e.firstName}`,
  }));

  const totalAccrued = useMemo(
    () => workLogs.reduce((sum, w) => sum + w.accruedAmount, 0),
    [workLogs],
  );

  const handleAdd = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const workDate = values.workDate
        ? (values.workDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      if (editingLog) {
        await updateWorkLog(editingLog.id, { ...values, workDate });
        message.success(t.hr.updateWorkLogSuccess);
      } else {
        await createWorkLog({ ...values, workDate });
        message.success(t.hr.addSuccess);
      }
      setModalOpen(false);
      setEditingLog(null);
      form.resetFields();
      load();
    } catch {
      message.error(t.hr.addError);
    } finally {
      setSaving(false);
    }
  };

  const handleEditWorkLog = (log: WorkLogDto) => {
    setEditingLog(log);
    form.setFieldsValue({
      workDate: dayjs(log.workDate),
      hoursWorked: log.hoursWorked,
      unitsProduced: log.unitsProduced,
      workDescription: log.workDescription,
      fieldId: log.fieldId,
      operationId: log.operationId,
    });
    setModalOpen(true);
  };

  const handleDeleteWorkLog = async (id: string) => {
    try {
      await deleteWorkLog(id);
      message.success(t.hr.deleteWorkLogSuccess);
      load();
    } catch {
      message.error(t.hr.deleteError);
    }
  };

  const columns: ColumnsType<WorkLogDto> = [
    {
      title: t.common.date,
      dataIndex: 'workDate',
      key: 'workDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
      sorter: (a, b) => dayjs(a.workDate).unix() - dayjs(b.workDate).unix(),
    },
    {
      title: `${t.hr.firstName} / ${t.hr.lastName}`,
      dataIndex: 'employeeFullName',
      key: 'employeeFullName',
    },
    {
      title: t.hr.hoursWorked,
      dataIndex: 'hoursWorked',
      key: 'hoursWorked',
      render: (v?: number) => (v != null ? v : '—'),
    },
    {
      title: t.hr.unitsProduced,
      dataIndex: 'unitsProduced',
      key: 'unitsProduced',
      render: (v?: number) => (v != null ? v : '—'),
    },
    {
      title: t.hr.accrued,
      dataIndex: 'accruedAmount',
      key: 'accruedAmount',
      render: (v: number) => `${v.toFixed(2)} ₴`,
    },
    {
      title: t.hr.workDescription,
      dataIndex: 'workDescription',
      key: 'workDescription',
      render: (v?: string) => v ?? '—',
    },
    ...(canWrite ? [{
      title: t.common.actions,
      key: 'actions',
      width: 100,
      render: (_: unknown, record: WorkLogDto) => (
        <Space>
          <Button size="small" icon={<EditOutlined />}
            onClick={() => handleEditWorkLog(record)} />
          <DeleteConfirmButton
            title={t.common.confirm}
            onConfirm={() => handleDeleteWorkLog(record.id)}
          />
        </Space>
      ),
    }] : []),
  ];

  return (
    <div>
      <PageHeader
        title={t.hr.workLogsTitle}
        actions={
          <Space>
            {canWrite && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
              >
                {/* button styles handled by CSS */}
                {t.hr.addWorkLog}
              </Button>
            )}
            <Button
              icon={<DownloadOutlined />}
              onClick={() => exportToCsv('worklogs', workLogs, [
                { key: 'workDate', title: t.common.date },
                { key: 'employeeFullName', title: `${t.hr.firstName} / ${t.hr.lastName}` },
                { key: 'hoursWorked', title: t.hr.hoursWorked },
                { key: 'unitsProduced', title: t.hr.unitsProduced },
                { key: 'accruedAmount', title: t.hr.accrued },
                { key: 'workDescription', title: t.hr.workDescription },
              ])}
            >
              {t.common.export}
            </Button>
          </Space>
        }
      />

      <Space style={{ marginBottom: 16 }} wrap>
        <Select
          options={monthOptions}
          value={month}
          onChange={setMonth}
          style={{ width: 130 }}
        />
        <Select
          options={yearOptions}
          value={year}
          onChange={setYear}
          style={{ width: 90 }}
        />
        <Select
          options={[{ value: undefined, label: t.hr.allEmployees }, ...employeeOptions]}
          value={employeeId}
          onChange={setEmployeeId}
          style={{ width: 220 }}
          allowClear
          placeholder={t.hr.selectEmployee}
        />
      </Space>

      {loading && workLogs.length === 0 ? (
        <TableSkeleton rows={8} />
      ) : (
        <Table
          columns={columns}
          dataSource={workLogs}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 50 }}
          locale={{
            emptyText: <EmptyState
              message={t.hr.noWorkLogs || 'Ще немає записів у табелі'}
              actionLabel={canWrite ? t.hr.addWorkLog : undefined}
              onAction={canWrite ? () => setModalOpen(true) : undefined}
            />,
          }}
          summary={() => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}>
                <strong>{t.hr.totalAccruedLabel}:</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <strong style={{ color: '#3fb950' }}>{totalAccrued.toFixed(2)} ₴</strong>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={5} />
              <Table.Summary.Cell index={6} />
            </Table.Summary.Row>
          )}
        />
      )}

      <Modal
        title={editingLog ? t.hr.editWorkLog : t.hr.addWorkLogTitle}
        open={modalOpen}
        onOk={handleAdd}
        onCancel={() => { setModalOpen(false); setEditingLog(null); form.resetFields(); }}
        confirmLoading={saving}
        okText={t.common.save}
        cancelText={t.common.cancel}
      >
        <Form form={form} layout="vertical">
          {!editingLog && (
            <Form.Item name="employeeId" label={`${t.hr.lastName} / ${t.hr.firstName}`} rules={[{ required: true, message: t.common.required }]}>
              <Select options={employeeOptions} showSearch optionFilterProp="label" />
            </Form.Item>
          )}
          <Form.Item name="workDate" label={t.common.date} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} format="DD.MM.YYYY" />
          </Form.Item>
          <Form.Item name="hoursWorked" label={t.hr.hoursWorked}>
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="unitsProduced" label={t.hr.unitsProduced}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="workDescription" label={t.hr.workDescription}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
