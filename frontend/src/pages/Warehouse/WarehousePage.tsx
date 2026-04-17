import { useEffect } from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import PageHeader from '../../components/PageHeader';
import WarehouseItems from '../Warehouses/WarehouseItems';
import WarehousesList from '../Warehouses/WarehousesList';
import StockMovements from '../Warehouses/StockMovements';
import StoragePage from '../GrainStorage/StoragePage';
import InventorySessions from '../Warehouses/InventorySessions';

const VALID_TABS = ['stock', 'warehouses', 'movements', 'grain', 'inventory'] as const;
type TabKey = (typeof VALID_TABS)[number];

function parseTab(search: string): TabKey {
  const params = new URLSearchParams(search);
  const tab = params.get('tab') as TabKey | null;
  return tab && VALID_TABS.includes(tab) ? tab : 'stock';
}

export default function WarehousePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = parseTab(location.search);

  useEffect(() => {
    if (!new URLSearchParams(location.search).has('tab')) {
      navigate(`/warehouse?tab=stock`, { replace: true });
    }
  }, [location.search, navigate]);

  const handleTabChange = (key: string) => {
    navigate(`/warehouse?tab=${key}`, { replace: true });
  };

  const items = [
    {
      key: 'stock',
      label: t.nav.materials ?? 'Запаси',
      children: <WarehouseItems />,
    },
    {
      key: 'warehouses',
      label: t.nav.warehouses ?? 'Склади',
      children: <WarehousesList />,
    },
    {
      key: 'movements',
      label: t.nav.movements ?? 'Рухи',
      children: <StockMovements />,
    },
    {
      key: 'grain',
      label: t.nav.grainModule ?? 'Зерносховище',
      children: <StoragePage />,
    },
    {
      key: 'inventory',
      label: t.nav.inventory ?? 'Інвентаризація',
      children: <InventorySessions />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.nav.storageLogistics ?? 'Склад і логістика'}
        subtitle="Управління складами, запасами та рухами"
      />
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        items={items}
        destroyInactiveTabPane={false}
        style={{ marginTop: 8 }}
      />
    </div>
  );
}
