import { useEffect, useState } from 'react';
import {
  Button, Card, Col, DatePicker, Form, Input, InputNumber,
  message, Modal, Progress, Row, Select, Space, Table, Tag, Typography,
} from 'antd';
import { PlusOutlined, ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  getFuelTanks,
  createFuelTank,
  createFuelSupply,
  createFuelIssue,
  getFuelTransactions,
} from '../../api/fuel';
import { getMachines } from '../../api/machinery';
import { getFields } from '../../api/fields';
import type { FuelTankDto, FuelTransactionDto } from '../../types/fuel';
import type { MachineDto } from '../../types/machinery';
import type { FieldDto } from '../../types/field';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { formatDate } from '../../utils/dateFormat';

const { Option } = Select;

const FUEL_TYPE_LABELS: Record<number, string> = {
  0: 'Diesel',
  1: 'Gasoline',
  2: 'Gas',
};

function getFillColor(pct: number): string {
  if (pct >= 50) return '#3fb950';
  if (pct >= 25) return '#d29922';
  return '#f85149';
}

export default function FuelStation() {
  const { t } = useTranslation();
  const [tanks, setTanks] = useState<FuelTankDto[]>([]);
  const [transactions, setTransactions] = useState<FuelTransactionDto[]>([]);
  const [machines, setMachines] = useState<MachineDto[]>([]);
  const [fields, setFields] = useState<FieldDto[]>([]);
  const [loadingTanks, setLoadingTanks] = useState(true);
  const [loadingTx, setLoadingTx] = useState(true);

  const [tankModalOpen, setTankModalOpen] = useState(false);
  const [supplyModalOpen, setSupplyModalOpen] = useState(false);
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedTankId, setSelectedTankId] = useState<string | undefined>();

  const [tankForm] = Form.useForm();
  const [supplyForm] = Form.useForm();
  const [issueForm] = Form.useForm();

  const loadTanks = () => {
    setLoadingTanks(true);
    getFuelTanks()
      .then(setTanks)
      .catch(() => message.error(t.fuel.loadError))
      .finally(() => setLoadingTanks(false));
  };

  const loadTransactions = (tankId?: string) => {
    setLoadingTx(true);
    getFuelTransactions({ tankId })
      .then(setTransactions)
      .catch(() => message.error(t.fuel.loadError))
      .finally(() => setLoadingTx(false));
  };

  useEffect(() => {
    loadTanks();
    loadTransactions();
    getMachines({ page: 1, pageSize: 200 }).then(data => setMachines(data.items)).catch(() => {});
    getFields({ pageSize: 200 }).then((r) => setFields(r.items)).catch(() => {});
  }, []);

  const handleCreateTank = async () => {
    try {
      const values = await tankForm.validateFields();
      setSaving(true);
      await createFuelTank(values);
      message.success(t.fuel.addTank);
      tankForm.resetFields();
      setTankModalOpen(false);
      loadTanks();
    } catch {
      // validation errors handled by form
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
          ? (values.transactionDate as dayjs.Dayjs).toISOString()
          : new Date().toISOString(),
      });
      message.success(t.fuel.supplySuccess);
      supplyForm.resetFields();
      setSupplyModalOpen(false);
      loadTanks();
      loadTransactions(selectedTankId);
    } catch {
      // validation errors handled by form
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
          ? (values.transactionDate as dayjs.Dayjs).toISOString()
          : new Date().toISOString(),
      });
      message.success(t.fuel.issueSuccess);
      issueForm.resetFields();
      setIssueModalOpen(false);
      loadTanks();
      loadTransactions(selectedTankId);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) message.error(t.fuel.insufficientFuel);
    } finally {
      setSaving(false);
    }
  };

  const openSupply = (tankId?: string) => {
    supplyForm.resetFields();
    if (tankId) supplyForm.setFieldValue('fuelTankId', tankId);
    supplyForm.setFieldValue('transactionDate', dayjs());
    setSupplyModalOpen(true);
  };

  const openIssue = (tankId?: string) => {
    issueForm.resetFields();
    if (tankId) issueForm.setFieldValue('fuelTankId', tankId);
    issueForm.setFieldValue('transactionDate', dayjs());
    setIssueModalOpen(true);
  };

  const txColumns = [
    {
      title: t.fuel.transactionDate,
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      render: (v: string) => formatDate(v),
      width: 110,
    },
    {
      title: t.fuel.tankName,
      dataIndex: 'tankName',
      key: 'tankName',
    },
    {
      title: t.fuel.supply + ' / ' + t.fuel.issue,
      dataIndex: 'transactionType',
      key: 'transactionType',
      render: (v: string) => (
        <Tag color={v === 'Supply' ? 'green' : 'red'}>
          {v === 'Supply' ? t.fuel.supply : t.fuel.issue}
        </Tag>
      ),
      width: 110,
    },
    {
      title: t.fuel.quantityLiters,
      dataIndex: 'quantityLiters',
      key: 'quantityLiters',
      render: (v: number) => `${v.toLocaleString('uk-UA')} л`,
      width: 120,
    },
    {
      title: t.fuel.totalCost,
      dataIndex: 'totalCost',
      key: 'totalCost',
      render: (v?: number) => v != null ? `${v.toLocaleString('uk-UA')} грн` : '—',
      width: 130,
    },
    {
      title: t.fuel.supplier,
      dataIndex: 'supplierName',
      key: 'supplierName',
      render: (v?: string) => v ?? '—',
    },
    {
      title: t.fuel.driver,
      dataIndex: 'driverName',
      key: 'driverName',
      render: (v?: string) => v ?? '—',
    },
    {
      title: t.fuel.invoice,
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      render: (v?: string) => v ?? '—',
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.fuel.title}
        subtitle={t.fuel.subtitle}
        actions={
          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setTankModalOpen(true)}
            >
              {t.fuel.addTank}
            </Button>
            <Button icon={<ArrowDownOutlined />} onClick={() => openSupply()}>
              {t.fuel.supply}
            </Button>
            <Button icon={<ArrowUpOutlined />} danger onClick={() => openIssue()}>
              {t.fuel.issue}
            </Button>
          </Space>
        }
      />

      {/* Tank cards */}
      <Typography.Title level={5} style={{ color: '#e6edf3', marginBottom: 16 }}>
        {t.fuel.tanks}
      </Typography.Title>
      <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
        {loadingTanks ? (
          <Col span={24}><Typography.Text style={{ color: '#aaa' }}>...</Typography.Text></Col>
        ) : tanks.length === 0 ? (
          <Col span={24}>
            <Typography.Text style={{ color: '#aaa' }}>{t.fuel.addTank}</Typography.Text>
          </Col>
        ) : (
          tanks.map((tank) => (
            <Col key={tank.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                style={{ background: '#161b22', border: '1px solid #30363d' }}
                bodyStyle={{ padding: 16 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                  <Typography.Text strong style={{ color: '#e6edf3', fontSize: 15 }}>
                    {tank.name}
                  </Typography.Text>
                  <Tag color="blue">{FUEL_TYPE_LABELS[tank.fuelType] ?? tank.fuelType}</Tag>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <Typography.Text style={{ color: '#aaa', fontSize: 12 }}>
                    {t.fuel.fillLevel}: {tank.fillPercentage.toFixed(1)}%
                  </Typography.Text>
                  <Progress
                    percent={tank.fillPercentage}
                    showInfo={false}
                    strokeColor={getFillColor(tank.fillPercentage)}
                    trailColor="#30363d"
                    style={{ marginBottom: 4 }}
                  />
                  <Typography.Text style={{ color: '#ccc', fontSize: 12 }}>
                    {tank.currentLiters.toLocaleString('uk-UA')} / {tank.capacityLiters.toLocaleString('uk-UA')} л
                  </Typography.Text>
                </div>
                {tank.pricePerLiter != null && (
                  <div style={{ marginBottom: 8 }}>
                    <Typography.Text style={{ color: '#8b949e', fontSize: 12 }}>
                      {t.fuel.pricePerLiter}: {tank.pricePerLiter.toLocaleString('uk-UA')} грн/л
                    </Typography.Text>
                  </div>
                )}
                <Space size="small">
                  <Button size="small" icon={<ArrowDownOutlined />} onClick={() => openSupply(tank.id)}>
                    {t.fuel.supply}
                  </Button>
                  <Button size="small" icon={<ArrowUpOutlined />} danger onClick={() => openIssue(tank.id)}>
                    {t.fuel.issue}
                  </Button>
                </Space>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Transactions table */}
      <Typography.Title level={5} style={{ color: '#e6edf3', marginBottom: 16 }}>
        {t.fuel.transactions}
      </Typography.Title>
      <div style={{ marginBottom: 12 }}>
        <Select
          allowClear
          placeholder={t.fuel.tankName}
          style={{ width: 220 }}
          value={selectedTankId}
          onChange={(v) => {
            setSelectedTankId(v);
            loadTransactions(v);
          }}
        >
          {tanks.map((tank) => (
            <Option key={tank.id} value={tank.id}>{tank.name}</Option>
          ))}
        </Select>
      </div>
      <Table
        dataSource={transactions}
        columns={txColumns}
        rowKey="id"
        loading={loadingTx}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        scroll={{ x: 800 }}
      />

      {/* Add tank modal */}
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
          <Form.Item name="name" label={t.fuel.tankName} rules={[{ required: true, message: t.common.required }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fuelType" label={t.fuel.fuelType} rules={[{ required: true, message: t.common.required }]} initialValue={0}>
            <Select>
              <Option value={0}>Diesel</Option>
              <Option value={1}>Gasoline</Option>
              <Option value={2}>Gas</Option>
            </Select>
          </Form.Item>
          <Form.Item name="capacityLiters" label={t.fuel.capacity} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>

      {/* Supply modal */}
      <Modal
        title={t.fuel.supply}
        open={supplyModalOpen}
        onOk={handleSupply}
        onCancel={() => setSupplyModalOpen(false)}
        confirmLoading={saving}
        okText={t.common.save}
        cancelText={t.common.cancel}
      >
        <Form form={supplyForm} layout="vertical">
          <Form.Item name="fuelTankId" label={t.fuel.tankName} rules={[{ required: true, message: t.common.required }]}>
            <Select>
              {tanks.map((tank) => (
                <Option key={tank.id} value={tank.id}>{tank.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="quantityLiters" label={t.fuel.quantityLiters} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="pricePerLiter" label={t.fuel.pricePerLiter}>
            <InputNumber min={0} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="transactionDate" label={t.fuel.transactionDate} rules={[{ required: true, message: t.common.required }]}>
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

      {/* Issue modal */}
      <Modal
        title={t.fuel.issue}
        open={issueModalOpen}
        onOk={handleIssue}
        onCancel={() => setIssueModalOpen(false)}
        confirmLoading={saving}
        okText={t.common.save}
        cancelText={t.common.cancel}
      >
        <Form form={issueForm} layout="vertical">
          <Form.Item name="fuelTankId" label={t.fuel.tankName} rules={[{ required: true, message: t.common.required }]}>
            <Select>
              {tanks.map((tank) => (
                <Option key={tank.id} value={tank.id}>{tank.name}</Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="machineId" label={t.fuel.machine}>
            <Select
              allowClear
              showSearch
              placeholder={t.fuel.selectMachine}
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              options={machines.map(m => ({
                value: m.id,
                label: m.name,
              }))}
              onChange={(val) => {
                const machine = machines.find(m => m.id === val);
                if (machine?.assignedDriverName) {
                  issueForm.setFieldsValue({ driverName: machine.assignedDriverName });
                  message.info(t.fuel.driverAutoFilled);
                } else if (!val) {
                  issueForm.setFieldsValue({ driverName: undefined });
                }
              }}
            />
          </Form.Item>
          <Form.Item name="fieldId" label={t.fuel.field || 'Поле'}>
            <Select
              allowClear
              showSearch
              placeholder={t.fuel.selectField || 'Оберіть поле'}
              filterOption={(input, option) =>
                (option?.label ?? '').toString().toLowerCase().includes(input.toLowerCase())
              }
              options={fields.map(f => ({
                value: f.id,
                label: `${f.name} (${f.areaHectares} га)`,
              }))}
            />
          </Form.Item>
          <Form.Item name="quantityLiters" label={t.fuel.quantityLiters} rules={[{ required: true, message: t.common.required }]}>
            <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="transactionDate" label={t.fuel.transactionDate} rules={[{ required: true, message: t.common.required }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="driverName" label={t.fuel.driver}>
            <Input placeholder={t.fuel.driverNamePlaceholder} />
          </Form.Item>
          <Form.Item name="notes" label={t.common.notes}>
            <Input.TextArea rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
