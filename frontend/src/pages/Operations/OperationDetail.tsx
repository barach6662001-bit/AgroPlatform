import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Table, Tag, Button, Spin, message, Row, Col,
  Space, Modal, Form, DatePicker, InputNumber, Select, Popconfirm,
} from 'antd';
import {
  ArrowLeftOutlined, CheckCircleOutlined, PlusOutlined,
  DeleteOutlined, EditOutlined,
} from '@ant-design/icons';
import {
  getOperationById, completeOperation,
  addResource, removeResource, updateResourceActual,
  addMachinery, removeMachinery,
} from '../../api/operations';
import { getWarehouses, getWarehouseItems } from '../../api/warehouses';
import { getMachines } from '../../api/machinery';
import type { AgroOperationDetailDto, AgroOperationResourceDto, AgroOperationMachineryDto } from '../../types/operation';
import type { WarehouseDto, WarehouseItemDto } from '../../types/warehouse';
import type { MachineDto } from '../../types/machinery';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import { formatDate } from '../../utils/dateFormat';

export default function OperationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [op, setOp] = useState<AgroOperationDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  // Complete operation modal
  const [completeModalOpen, setCompleteModalOpen] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completeForm] = Form.useForm();

  // Add resource modal
  const [addResourceOpen, setAddResourceOpen] = useState(false);
  const [addingResource, setAddingResource] = useState(false);
  const [resourceForm] = Form.useForm();
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [warehouseItems, setWarehouseItems] = useState<WarehouseItemDto[]>([]);

  // Update actual qty modal
  const [actualModalOpen, setActualModalOpen] = useState(false);
  const [actualResource, setActualResource] = useState<AgroOperationResourceDto | null>(null);
  const [updatingActual, setUpdatingActual] = useState(false);
  const [actualForm] = Form.useForm();

  // Add machinery modal
  const [addMachineryOpen, setAddMachineryOpen] = useState(false);
  const [addingMachinery, setAddingMachinery] = useState(false);
  const [machineryForm] = Form.useForm();
  const [machines, setMachines] = useState<MachineDto[]>([]);

  const { t, lang } = useTranslation();
  const { hasRole } = useRole();
  const canEdit = hasRole(['Administrator', 'Manager', 'Agronomist']);

  const load = () => {
    if (!id) return;
    getOperationById(id)
      .then(setOp)
      .catch(() => message.error(t.operations.operationNotFound))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [id]);

  // Pre-load warehouses, items, machines for modals
  useEffect(() => {
    getWarehouses({ pageSize: 100 }).then((r) => setWarehouses(r.items)).catch(() => {});
    getWarehouseItems({ pageSize: 500 }).then((r) => setWarehouseItems(r.items)).catch(() => {});
    getMachines({ pageSize: 200 }).then((r) => setMachines(r.items)).catch(() => {});
  }, []);

  // ── Complete Operation ──────────────────────────────────────────────────────
  const handleComplete = async () => {
    if (!id) return;
    try {
      const values = await completeForm.validateFields();
      setCompleting(true);
      const completedDate = values.completedDate
        ? (values.completedDate as { toISOString: () => string }).toISOString()
        : new Date().toISOString();
      await completeOperation(id, { completedDate, areaProcessed: values.areaProcessed });
      message.success(t.operations.operationCompleted);
      completeForm.resetFields();
      setCompleteModalOpen(false);
      load();
    } catch {
      message.error(t.operations.completeError);
    } finally {
      setCompleting(false);
    }
  };

  // ── Add Resource ────────────────────────────────────────────────────────────
  const handleAddResource = async () => {
    if (!id) return;
    try {
      const values = await resourceForm.validateFields();
      setAddingResource(true);
      const item = warehouseItems.find((i) => i.id === values.warehouseItemId);
      await addResource(id, {
        warehouseItemId: values.warehouseItemId,
        warehouseId: values.warehouseId,
        plannedQuantity: values.plannedQuantity,
        unitCode: item?.baseUnit ?? 'unit',
      });
      message.success(t.operations.addResourceSuccess);
      resourceForm.resetFields();
      setAddResourceOpen(false);
      load();
    } catch {
      message.error(t.operations.addResourceError);
    } finally {
      setAddingResource(false);
    }
  };

  const handleRemoveResource = async (resourceId: string) => {
    try {
      await removeResource(resourceId);
      message.success(t.operations.removeResourceSuccess);
      load();
    } catch {
      message.error(t.operations.removeResourceError);
    }
  };

  // ── Update Actual Quantity ──────────────────────────────────────────────────
  const openActualModal = (resource: AgroOperationResourceDto) => {
    setActualResource(resource);
    actualForm.setFieldValue('actualQuantity', resource.actualQuantity ?? resource.plannedQuantity);
    setActualModalOpen(true);
  };

  const handleUpdateActual = async () => {
    if (!actualResource) return;
    try {
      const values = await actualForm.validateFields();
      setUpdatingActual(true);
      await updateResourceActual(actualResource.id, { actualQuantity: values.actualQuantity });
      message.success(t.operations.updateActualSuccess);
      actualForm.resetFields();
      setActualModalOpen(false);
      setActualResource(null);
      load();
    } catch {
      message.error(t.operations.updateActualError);
    } finally {
      setUpdatingActual(false);
    }
  };

  // ── Add Machinery ───────────────────────────────────────────────────────────
  const handleAddMachinery = async () => {
    if (!id) return;
    try {
      const values = await machineryForm.validateFields();
      setAddingMachinery(true);
      await addMachinery(id, {
        machineId: values.machineId,
        hoursWorked: values.hoursWorked,
      });
      message.success(t.operations.addMachinerySuccess);
      machineryForm.resetFields();
      setAddMachineryOpen(false);
      load();
    } catch {
      message.error(t.operations.addMachineryError);
    } finally {
      setAddingMachinery(false);
    }
  };

  const handleRemoveMachinery = async (machineryId: string) => {
    try {
      await removeMachinery(machineryId);
      message.success(t.operations.removeMachinerySuccess);
      load();
    } catch {
      message.error(t.operations.removeMachineryError);
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  if (loading) return <Spin size="large" style={{ display: 'block', margin: '80px auto' }} />;
  if (!op) return null;

  const resourceColumns = [
    { title: t.warehouses.item, dataIndex: 'warehouseItemName', key: 'warehouseItemName' },
    {
      title: t.operations.plannedQty,
      key: 'plannedQuantity',
      render: (_: unknown, r: AgroOperationResourceDto) => `${r.plannedQuantity} ${r.unitCode}`,
    },
    {
      title: t.operations.actualQty,
      key: 'actualQuantity',
      render: (_: unknown, r: AgroOperationResourceDto) =>
        r.actualQuantity != null ? `${r.actualQuantity} ${r.unitCode}` : '—',
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, r: AgroOperationResourceDto) =>
        canEdit ? (
          <Space>
            <Button size="small" icon={<EditOutlined />} onClick={() => openActualModal(r)}>
              {t.operations.updateActual}
            </Button>
            <Popconfirm title={`${t.common.delete}?`} onConfirm={() => handleRemoveResource(r.id)}>
              <Button size="small" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        ) : null,
    },
  ];

  const machineryColumns = [
    { title: t.operations.machineName, dataIndex: 'machineName', key: 'machineName' },
    {
      title: t.operations.hoursPlanned,
      dataIndex: 'hoursWorked',
      key: 'hoursWorked',
      render: (v: number) => (v ? `${v} ${lang === 'uk' ? 'год' : 'h'}` : '—'),
    },
    {
      title: t.common.actions,
      key: 'actions',
      render: (_: unknown, r: AgroOperationMachineryDto) =>
        canEdit ? (
          <Popconfirm title={`${t.common.delete}?`} onConfirm={() => handleRemoveMachinery(r.id)}>
            <Button size="small" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        ) : null,
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/operations')}>
          {t.operations.back}
        </Button>
        {!op.isCompleted && canEdit && (
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => setCompleteModalOpen(true)}
          >
            {t.operations.completeOperation}
          </Button>
        )}
      </Space>

      <PageHeader
        title={`${t.operationTypes[op.operationType as keyof typeof t.operationTypes] || op.operationType} — ${op.fieldName}`}
        subtitle={op.isCompleted ? t.operations.completed : t.operations.inProgress}
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={t.operations.operationDetails}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label={t.operations.field}>{op.fieldName}</Descriptions.Item>
              <Descriptions.Item label={t.operations.type}>
                {t.operationTypes[op.operationType as keyof typeof t.operationTypes] || op.operationType}
              </Descriptions.Item>
              <Descriptions.Item label={t.operations.status}>
                {op.isCompleted
                  ? <Tag color="success">{t.operations.completed}</Tag>
                  : <Tag color="processing">{t.operations.inProgress}</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label={t.operations.plannedDate}>
                {formatDate(op.plannedDate)}
              </Descriptions.Item>
              <Descriptions.Item label={t.operations.completedDate}>
                {formatDate(op.completedDate)}
              </Descriptions.Item>
              <Descriptions.Item label={t.operations.area}>
                {op.areaProcessed ? op.areaProcessed.toFixed(2) : '—'}
              </Descriptions.Item>
              <Descriptions.Item label={t.operations.description}>
                {op.description || '—'}
              </Descriptions.Item>
            </Descriptions>
          </Card>
        </Col>
      </Row>

      {/* Resources card */}
      <Card
        title={t.operations.resources}
        style={{ marginTop: 16 }}
        extra={
          !op.isCompleted && canEdit ? (
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setAddResourceOpen(true)}>
              {t.operations.addResource}
            </Button>
          ) : null
        }
      >
        <Table
          dataSource={op.resources}
          columns={resourceColumns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
          locale={{ emptyText: t.operations.resourcesEmpty }}
        />
      </Card>

      {/* Machinery card */}
      <Card
        title={t.operations.machinery}
        style={{ marginTop: 16 }}
        extra={
          !op.isCompleted && canEdit ? (
            <Button type="primary" size="small" icon={<PlusOutlined />} onClick={() => setAddMachineryOpen(true)}>
              {t.operations.addMachinery}
            </Button>
          ) : null
        }
      >
        <Table
          dataSource={op.machineryUsed}
          columns={machineryColumns}
          rowKey="id"
          pagination={false}
          scroll={{ x: 800 }}
          locale={{ emptyText: t.operations.machineryEmpty }}
        />
      </Card>

      {/* Complete Operation Modal */}
      <Modal
        title={t.operations.completeOperation}
        open={completeModalOpen}
        onOk={handleComplete}
        onCancel={() => { setCompleteModalOpen(false); completeForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={completing}
      >
        <Form form={completeForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="completedDate"
            label={t.operations.completedDate}
            rules={[{ required: true, message: t.common.required }]}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="areaProcessed" label={t.operations.area}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Resource Modal */}
      <Modal
        title={t.operations.addResource}
        open={addResourceOpen}
        onOk={handleAddResource}
        onCancel={() => { setAddResourceOpen(false); resourceForm.resetFields(); }}
        okText={t.common.add}
        cancelText={t.common.cancel}
        confirmLoading={addingResource}
      >
        <Form form={resourceForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="warehouseId"
            label={t.operations.resourceWarehouse}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Select
              placeholder={t.warehouses.selectWarehouse}
              showSearch
              filterOption={(input, opt) =>
                (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={warehouses.map((w) => ({ value: w.id, label: w.name }))}
            />
          </Form.Item>
          <Form.Item
            name="warehouseItemId"
            label={t.operations.resourceItem}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Select
              placeholder={t.warehouses.selectItem}
              showSearch
              filterOption={(input, opt) =>
                (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={warehouseItems.map((i) => ({
                value: i.id,
                label: `${i.name} (${i.baseUnit})`,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="plannedQuantity"
            label={t.operations.resourcePlannedQty}
            rules={[{ required: true, message: t.common.required }]}
          >
            <InputNumber min={0.001} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Actual Qty Modal */}
      <Modal
        title={t.operations.updateActual}
        open={actualModalOpen}
        onOk={handleUpdateActual}
        onCancel={() => { setActualModalOpen(false); setActualResource(null); actualForm.resetFields(); }}
        okText={t.common.save}
        cancelText={t.common.cancel}
        confirmLoading={updatingActual}
      >
        <Form form={actualForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="actualQuantity"
            label={`${t.operations.actualQty}${actualResource ? ` (${actualResource.unitCode})` : ''}`}
            rules={[{ required: true, message: t.common.required }]}
          >
            <InputNumber min={0} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Add Machinery Modal */}
      <Modal
        title={t.operations.addMachinery}
        open={addMachineryOpen}
        onOk={handleAddMachinery}
        onCancel={() => { setAddMachineryOpen(false); machineryForm.resetFields(); }}
        okText={t.common.add}
        cancelText={t.common.cancel}
        confirmLoading={addingMachinery}
      >
        <Form form={machineryForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="machineId"
            label={t.operations.machineName}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Select
              placeholder={t.operations.selectMachine}
              showSearch
              filterOption={(input, opt) =>
                (opt?.label as string)?.toLowerCase().includes(input.toLowerCase())
              }
              options={machines.map((m) => ({
                value: m.id,
                label: `${m.name} (${m.inventoryNumber})`,
              }))}
            />
          </Form.Item>
          <Form.Item name="hoursWorked" label={t.operations.hoursWorked}>
            <InputNumber min={0} step={0.5} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
