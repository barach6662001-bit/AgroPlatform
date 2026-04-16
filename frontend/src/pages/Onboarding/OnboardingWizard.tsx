import { useState, useEffect } from 'react';
import { Steps, Button, Form, Input, InputNumber, message, Card, Space, Result, Select } from 'antd';
import { useNavigate } from 'react-router-dom';
import { createWarehouse } from '../../api/warehouses';
import { createWarehouseItem, createReceipt, getWarehouses, getWarehouseItems } from '../../api/warehouses';
import type { WarehouseDto, WarehouseItemDto } from '../../types/warehouse';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';
import { useAuthStore } from '../../stores/authStore';
import { completeOnboarding } from '../../api/auth';
import s from './OnboardingWizard.module.css';

export default function OnboardingWizard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [current, setCurrent] = useState(0);
  const [saving, setSaving] = useState(false);
  const setHasCompletedOnboarding = useAuthStore((s) => s.setHasCompletedOnboarding);

  // Step results
  const [createdWarehouse, setCreatedWarehouse] = useState<WarehouseDto | null>(null);
  const [createdItem, setCreatedItem] = useState<WarehouseItemDto | null>(null);
  const [warehouses, setWarehouses] = useState<WarehouseDto[]>([]);
  const [items, setItems] = useState<WarehouseItemDto[]>([]);

  const [companyForm] = Form.useForm();
  const [warehouseForm] = Form.useForm();
  const [itemForm] = Form.useForm();
  const [receiptForm] = Form.useForm();

  useEffect(() => {
    // Pre-load warehouses and items for receipt step
    getWarehouses({ pageSize: 200 }).then((r) => setWarehouses(r.items));
    getWarehouseItems({ pageSize: 200 }).then((r) => setItems(r.items));
  }, [current]);

  const steps = [
    { title: t.onboarding.step1 },
    { title: t.onboarding.step2 },
    { title: t.onboarding.step3 },
    { title: t.onboarding.step4 },
  ];

  const handleCreateWarehouse = async () => {
    const values = await warehouseForm.validateFields();
    setSaving(true);
    try {
      const result = await createWarehouse({
        name: values.name,
        location: values.location,
        type: 0,
      });
      setCreatedWarehouse({ id: result.id, name: values.name, location: values.location } as WarehouseDto);
      message.success(t.onboarding.warehouseCreated);
      setCurrent(2);
    } catch {
      message.error(t.onboarding.error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateItem = async () => {
    const values = await itemForm.validateFields();
    setSaving(true);
    try {
      const result = await createWarehouseItem({
        name: values.name,
        code: values.code,
        category: values.category ?? 'General',
        baseUnit: values.baseUnit,
      });
      setCreatedItem({ id: result.id ?? (result as { id: string }).id, ...values } as unknown as WarehouseItemDto);
      message.success(t.onboarding.itemCreated);
      setCurrent(3);
    } catch {
      message.error(t.onboarding.error);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateReceipt = async () => {
    const values = await receiptForm.validateFields();
    setSaving(true);
    try {
      await createReceipt({
        warehouseId: values.warehouseId,
        itemId: values.itemId,
        unitCode: 'kg',
        quantity: values.quantity,
      });
      message.success(t.onboarding.receiptCreated);
      await completeOnboarding();
      setHasCompletedOnboarding(true);
      setCurrent(4);
    } catch {
      message.error(t.onboarding.error);
    } finally {
      setSaving(false);
    }
  };

  const renderStep = () => {
    switch (current) {
      case 0:
        return (
          <Card>
            <Result
              status="info"
              title={t.onboarding.welcomeTitle}
              subTitle={t.onboarding.welcomeSubtitle}
            />
            <div className={s.textCenter}>
              <Button type="primary" size="large" onClick={() => setCurrent(1)}>
                {t.onboarding.start}
              </Button>
              <Button
                style={{ marginLeft: 8 }}
                onClick={async () => {
                  await completeOnboarding();
                  setHasCompletedOnboarding(true);
                  navigate("/");
                }}
              >
                {t.onboarding.skip}
              </Button>
            </div>
          </Card>
        );
      case 1:
        return (
          <Card title={t.onboarding.step2}>
            <Form form={warehouseForm} layout="vertical">
              <Form.Item name="name" label={t.onboarding.warehouseName} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="location" label={t.onboarding.warehouseLocation}>
                <Input />
              </Form.Item>
              <Button type="primary" onClick={handleCreateWarehouse} loading={saving}>
                {t.onboarding.createWarehouse}
              </Button>
            </Form>
          </Card>
        );
      case 2:
        return (
          <Card title={t.onboarding.step3}>
            <Form form={itemForm} layout="vertical">
              <Form.Item name="name" label={t.onboarding.itemName} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="code" label={t.onboarding.itemCode} rules={[{ required: true }]}>
                <Input />
              </Form.Item>
              <Form.Item name="baseUnit" label={t.onboarding.itemUnit} rules={[{ required: true }]}>
                <Input placeholder="kg" />
              </Form.Item>
              <Form.Item name="category" label={t.onboarding.itemCategory}>
                <Input placeholder="General" />
              </Form.Item>
              <Button type="primary" onClick={handleCreateItem} loading={saving}>
                {t.onboarding.createItem}
              </Button>
            </Form>
          </Card>
        );
      case 3:
        return (
          <Card title={t.onboarding.step4}>
            <Form form={receiptForm} layout="vertical" initialValues={{
              warehouseId: createdWarehouse?.id,
              itemId: createdItem?.id,
            }}>
              <Form.Item name="warehouseId" label={t.onboarding.selectWarehouse} rules={[{ required: true }]}>
                <Select
                  options={[
                    ...(createdWarehouse ? [{ value: createdWarehouse.id, label: createdWarehouse.name }] : []),
                    ...warehouses.filter((w) => w.id !== createdWarehouse?.id).map((w) => ({ value: w.id, label: w.name })),
                  ]}
                />
              </Form.Item>
              <Form.Item name="itemId" label={t.onboarding.selectItem} rules={[{ required: true }]}>
                <Select
                  options={[
                    ...(createdItem ? [{ value: createdItem.id, label: createdItem.name }] : []),
                    ...items.filter((i) => i.id !== createdItem?.id).map((i) => ({ value: i.id, label: `${i.name} (${i.code})` })),
                  ]}
                />
              </Form.Item>
              <Form.Item name="quantity" label={t.onboarding.quantity} rules={[{ required: true }]}>
                <InputNumber min={0.01} className={s.fullWidth} />
              </Form.Item>
              <Button type="primary" onClick={handleCreateReceipt} loading={saving}>
                {t.onboarding.createReceipt}
              </Button>
            </Form>
          </Card>
        );
      case 4:
        return (
          <Card>
            <Result
              status="success"
              title={t.onboarding.completeTitle}
              subTitle={t.onboarding.completeSubtitle}
              extra={[
                <Button type="primary" key="dashboard" onClick={() => navigate('/dashboard')}>
                  {t.onboarding.goToDashboard}
                </Button>,
                <Button key="warehouses" onClick={() => navigate('/warehouses/items')}>
                  {t.onboarding.goToItems}
                </Button>,
              ]}
            />
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="page-enter">
      <PageHeader title={t.onboarding.title} subtitle={t.onboarding.subtitle} />
      <Steps current={current} items={steps} className={s.spaced} />
      {renderStep()}
    </div>
  );
}
