import { useEffect, useState } from 'react';
import {
  Card, Col, Row, Progress, Typography, Button, Space, Table, Modal, Form,
  InputNumber, Input, Select, DatePicker, message, Badge, Tag,
} from 'antd';
import { PlusOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import {
  getFuelTanks,
  createFuelTank,
  createFuelSupply,
  createFuelIssue,
  getFuelTransactions,
} from '../../api/fuel';
import type { FuelTankDto, FuelTransactionDto } from '../../types/fuel';
import type { PaginatedResult } from '../../types/common';

const { Text } = Typography;
const { Option } = Select;

const FUEL_TYPE_LABELS: Record<number, string> = { 0: 'Diesel', 1: 'Gasoline', 2: 'Gas' };

function tankColor(pct: number): string {
  if (pct >= 50) return '#52c41a';
  if (pct >= 20) return '#faad14';
  return '#ff4d4f';
}

export default function FuelStation() {
  const { t } = useTranslation();
  const { hasRole } = useRole();

  const canManage = hasRole(['Administrator', 'Manager', 'Storekeeper']);
  const canCreate = hasRole(['Administrator', 'Manager']);

  const [tanks, setTanks] = useState<FuelTankDto[]>([]);
  const [tanksLoading, setTanksLoading] = useState(true);
  const [txResult, setTxResult] = useState<PaginatedResult<FuelTransactionDto> | null>(null);
  const [txLoading, setTxLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const [tankModalOpen, setTankModalOpen] = useState(false);
  const [supplyModalOpen, setSupplyModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTankId, setSelectedTankId] = useState<string | undefined>();

  const [tankForm] = Form.useForm();
  const [supplyForm] = Form.useForm();
  const [issueForm] = Form.useForm();

  const loadTanks = () => {
    setTanksLoading(true);
    getFuelTanks()
      .then(setTanks)
      .catch(() => message.error(t.fuel.loadError))
      .finally(() => setTanksLoading(false));
  };

  const loadTransactions = (p = page, ps = pageSize) => {
    setTxLoading(true);
    getFuelTransactions({ page: p, pageSize: ps })
      .then(setTxResult)
      .catch(() => message.error(t.fuel.loadError))
      .finally(() => setTxLoading(false));
  };

  useEffect(() => { loadTanks(); }, []);
  useEffect(() => { loadTransactions(); }, [page, pageSize]);

  const handleCreateTank = async () => {
    try {
      const values = await tankForm.validateFields();
      setSaving(true);
      await createFuelTank(values);
      message.success(t.fuel.addTank);
      tankForm.resetFields();
      setTankModalOpen(false);
      loadTanks();
      loadTransactions();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status) message.error(t.fuel.loadError);
    } finally {
      setSaving(false);
    }
  };

  const handleSupply = async () => {
    try {
      const values = await supplyForm.validateFields();
      setSaving(true);
      await createFuelSupply({
        ...values,
        transactionDate: values.transactionDate
          ? values.transactionDate.toISOString()
          : new Date().toISOString(),
      });
      message.success(t.fuel.supplySuccess);
      supplyForm.resetFields();
      setSupplyModalOpen(false);
      loadTanks();
      loadTransactions();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 422 || status === 400) {
        message.error(t.fuel.insufficientFuel);
      } else if (status) {
        message.error(t.fuel.loadError);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleIssue = async () => {
    try {
      const values = await issueForm.validateFields();
      setSaving(true);
      await createFuelIssue({
        ...values,
        transactionDate: values.transactionDate
          ? values.transactionDate.toISOString()
          : new Date().toISOString(),
      });
      message.success(t.fuel.issueSuccess);
      issueForm.resetFields();
      setIssueModalOpen(false);
      loadTanks();
      loadTransactions();
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 422 || status === 400) {
        message.error(t.fuel.insufficientFuel);
      } else if (status) {
        message.error(t.fuel.loadError);
      }
    } finally {
      setSaving(false);
    }
  };

  const openSupply = (tankId?: string) => {
    supplyForm.resetFields();
    if (tankId) supplyForm.setFieldValue('fuelTankId', tankId);
    setSupplyModalOpen(true);
  };

  const openIssue = (tankId?: string) => {
    issueForm.resetFields();
    if (tankId) issueForm.setFieldValue('fuelTankId', tankId);
    setIssueModalOpen(true);
  };

  const txColumns = [
    {
      title: t.fuel.tanks,
      dataIndex: 'tankName',
      key: 'tankName',
    },
    {
      title: t.common.actions,
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (v: string) =>
        v === 'Supply'
          ? <Tag color="green">{t.fuel.supply}</Tag>
          : <Tag color="volcano">{t.fuel.issue}</Tag>,
    },
    {
      title: t.fuel.quantityLiters,
      dataIndex: 'quantityLiters',
      key: 'quantityLiters',
      render: (v: number) => `${v} л`,
    },
    {
      title: t.fuel.pricePerLiter,
      dataIndex: 'pricePerLiter',
      key: 'pricePerLiter',
      render: (v?: number) => v != null ? `${v} грн` : '—',
    },
    {
      title: t.fuel.totalCost,
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (v?: number) => v != null ? `${v.toFixed(2)} грн` : '—',
    },
    {
      title: t.fuel.transactionDate,
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (v: string) => dayjs(v).format('DD.MM.YYYY'),
    },
    {
      title: t.fuel.driver,
      dataIndex: 'driverName',
      key: 'driverName',
      render: (v?: string) => v || '—',
    },
    {
      title: t.fuel.supplier,
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (v?: string) => v || '—',
    },
  ];

  const fuelTypeOptions = [
    { value: 0, label: t.fuelTypes.Diesel },
    { value: 1, label: t.fuelTypes.Gasoline },
    { value: 2, label: t.fuelTypes.Gas },
  ];

  return (
    <div>
      <PageHeader title={t.fuel.title} subtitle={t.fuel.subtitle} />

      <Space style={{ marginBottom: 16 }}>
        {canCreate && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            style={{ background: '#52c41a', borderColor: '#52c41a' }}
            onClick={() => { tankForm.resetFields(); setTankModalOpen(true); }}
          >
            {t.fuel.addTank}
          </Button>
        )}
        {canManage && (
          <>
            <Button
              icon={<ArrowDownOutlined />}
              onClick={() => openSupply()}
            >
              {t.fuel.supply}
            </Button>
            <Button
              icon={<ArrowUpOutlined />}
              danger
              onClick={() => openIssue()}
            >
              {t.fuel.issue}
            </Button>
          </>
        )}
      </Space>

      {/* Tank cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {tanksLoading
          ? null
          : tanks.map((tank) => {
              const pct = tank.fillPercentage;
              const color = tankColor(pct);
              const fuelLabel = t.fuelTypes[FUEL_TYPE_LABELS[tank.fuelType] as keyof typeof t.fuelTypes] ?? FUEL_TYPE_LABELS[tank.fuelType];
              return (
                <Col key={tank.id} xs={24} sm={12} lg={8} xl={6}>
                  <Card
                    size="small"
                    title={
                      <Space>
                        <Text strong style={{ color: '#E5E7EB' }}>{tank.name}</Text>
                        <Tag>{fuelLabel}</Tag>
                        {!tank.isActive && <Badge status="default" text="Неактивний" />}
                      </Space>
                    }
                    style={{ background: '#1f2937', border: '1px solid #374151' }}
                    headStyle={{ background: '#111827', borderBottom: '1px solid #374151' }}
                    actions={canManage ? [
                      <Button
                        type="link"
                        icon={<ArrowDownOutlined />}
                        key="supply"
                        onClick={() => openSupply(tank.id)}
                      >
                        {t.fuel.supply}
                      </Button>,
                      <Button
                        type="link"
                        danger
                        icon={<ArrowUpOutlined />}
                        key="issue"
                        onClick={() => openIssue(tank.id)}
                      >
                        {t.fuel.issue}
                      </Button>,
                    ] : []}
                  >
                    <Space direction="vertical" style={{ width: '100%' }}>
                      <Progress
                        percent={pct}
                        strokeColor={color}
                        trailColor="#374151"
                        format={(p) => `${p?.toFixed(1)}%`}
                      />
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Text type="secondary">{t.fuel.currentLevel}:</Text>
                        <Text style={{ color: color }}>{tank.currentLiters} л</Text>
                      </Space>
                      <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                        <Text type="secondary">{t.fuel.capacity}:</Text>
                        <Text>{tank.capacityLiters} л</Text>
                      </Space>
                      {tank.pricePerLiter != null && (
                        <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                          <Text type="secondary">{t.fuel.pricePerLiter}:</Text>
                          <Text>{tank.pricePerLiter} грн/л</Text>
                        </Space>
                      )}
                    </Space>
                  </Card>
                </Col>
              );
            })}
      </Row>

      {/* Transactions table */}
      <Typography.Title level={5} style={{ color: '#E5E7EB', marginBottom: 12 }}>
        {t.fuel.transactions}
      </Typography.Title>
      <Table
        dataSource={txResult?.items ?? []}
        columns={txColumns}
        rowKey="id"
        loading={txLoading}
        size="small"
        scroll={{ x: 900 }}
        pagination={{
          current: page,
          pageSize,
          total: txResult?.totalCount ?? 0,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
        }}
      />

      {/* Add Tank Modal */}
      <Modal
        title={t.fuel.addTank}
        open={tankModalOpen}
        onOk={handleCreateTank}
        onCancel={() => setTankModalOpen(false)}
        confirmLoading={saving}
        okText={t.common.create}
        cancelText={t.common.cancel}
      >
        <Form form={tankForm} layout="vertical">
          <Form.Item
            name="name"
            label={t.fuel.tankName}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="fuelType"
            label={t.fuel.fuelType}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Select>
              {fuelTypeOptions.map((o) => (
                <Option key={o.value} value={o.value}>{o.label}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="capacityLiters"
            label={t.fuel.capacity}
            rules={[{ required: true, message: t.common.required }]}
          >
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pricePerLiter" label={t.fuel.pricePerLiter}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Supply Modal */}
      <Modal
        title={t.fuel.supply}
        open={supplyModalOpen}
        onOk={handleSupply}
        onCancel={() => setSupplyModalOpen(false)}
        confirmLoading={saving}
        okText={t.common.confirm}
        cancelText={t.common.cancel}
      >
        <Form form={supplyForm} layout="vertical">
          <Form.Item
            name="fuelTankId"
            label={t.fuel.tankName}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Select>
              {tanks.map((tank) => (
                <Option key={tank.id} value={tank.id}>{tank.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quantityLiters"
            label={t.fuel.quantityLiters}
            rules={[{ required: true, message: t.common.required }]}
          >
            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pricePerLiter" label={t.fuel.pricePerLiter}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="transactionDate"
            label={t.fuel.transactionDate}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="supplierName" label={t.fuel.supplier}>
            <Input />
          </Form.Item>
          <Form.Item name="invoiceNumber" label={t.fuel.invoice}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Issue Modal */}
      <Modal
        title={t.fuel.issue}
        open={issueModalOpen}
        onOk={handleIssue}
        onCancel={() => setIssueModalOpen(false)}
        confirmLoading={saving}
        okText={t.common.confirm}
        cancelText={t.common.cancel}
      >
        <Form form={issueForm} layout="vertical">
          <Form.Item
            name="fuelTankId"
            label={t.fuel.tankName}
            rules={[{ required: true, message: t.common.required }]}
          >
            <Select>
              {tanks.map((tank) => (
                <Option key={tank.id} value={tank.id}>{tank.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="quantityLiters"
            label={t.fuel.quantityLiters}
            rules={[{ required: true, message: t.common.required }]}
          >
            <InputNumber min={0.1} step={0.1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pricePerLiter" label={t.fuel.pricePerLiter}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="transactionDate"
            label={t.fuel.transactionDate}
            initialValue={dayjs()}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="driverName" label={t.fuel.driver}>
            <Input />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
