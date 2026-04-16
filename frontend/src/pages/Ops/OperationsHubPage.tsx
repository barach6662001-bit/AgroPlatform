import { useEffect } from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import PageHeader from '../../components/PageHeader';
import OperationsList from '../Operations/OperationsList';
import MachineryList from '../Machinery/MachineryList';
import FleetMap from '../Fleet/FleetMap';
import FuelStation from '../Fuel/FuelStation';

const VALID_TABS = ['operations', 'machinery', 'fleet', 'fuel'] as const;
type TabKey = (typeof VALID_TABS)[number];

function parseTab(search: string): TabKey {
  const params = new URLSearchParams(search);
  const tab = params.get('tab') as TabKey | null;
  return tab && VALID_TABS.includes(tab) ? tab : 'operations';
}

export default function OperationsHubPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = parseTab(location.search);

  useEffect(() => {
    if (!new URLSearchParams(location.search).has('tab')) {
      navigate(`/operations?tab=operations`, { replace: true });
    }
  }, [location.search, navigate]);

  const handleTabChange = (key: string) => {
    navigate(`/operations?tab=${key}`, { replace: true });
  };

  const items = [
    {
      key: 'operations',
      label: t.nav.operations ?? 'Операції',
      children: <OperationsList />,
    },
    {
      key: 'machinery',
      label: t.nav.machinery ?? 'Техніка',
      children: <MachineryList />,
    },
    {
      key: 'fleet',
      label: t.nav.fleet ?? 'Карта',
      children: <FleetMap />,
    },
    {
      key: 'fuel',
      label: t.nav.fuelStation ?? 'Паливо',
      children: <FuelStation />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.nav.operationsGroup ?? 'Операції'}
        subtitle="Операції, техніка, карта парку та паливо"
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
