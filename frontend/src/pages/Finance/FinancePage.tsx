import { useEffect } from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import PageHeader from '../../components/PageHeader';
import CostRecords from '../Economics/CostRecords';
import SalesList from '../Sales/SalesList';
import BudgetPage from '../Economics/BudgetPage';
import FinanceOverview from './FinanceOverview';
import FinanceAnalytics from './FinanceAnalytics';

const VALID_TABS = ['overview', 'costs', 'sales', 'budget', 'analytics'] as const;
type TabKey = (typeof VALID_TABS)[number];

function parseTab(search: string): TabKey {
  const params = new URLSearchParams(search);
  const tab = params.get('tab') as TabKey | null;
  return tab && VALID_TABS.includes(tab) ? tab : 'overview';
}

export default function FinancePage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = parseTab(location.search);

  useEffect(() => {
    if (!new URLSearchParams(location.search).has('tab')) {
      navigate(`/finance?tab=overview`, { replace: true });
    }
  }, [location.search, navigate]);

  const handleTabChange = (key: string) => {
    navigate(`/finance?tab=${key}`, { replace: true });
  };

  const items = [
    {
      key: 'overview',
      label: t.nav.overview ?? 'Огляд',
      children: <FinanceOverview />,
    },
    {
      key: 'costs',
      label: t.nav.costs ?? 'Витрати',
      children: <CostRecords />,
    },
    {
      key: 'sales',
      label: t.nav.sales ?? 'Продажі',
      children: <SalesList />,
    },
    {
      key: 'budget',
      label: t.nav.budget ?? 'Бюджет',
      children: <BudgetPage />,
    },
    {
      key: 'analytics',
      label: t.nav.analytics ?? 'Аналітика',
      children: <FinanceAnalytics />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.nav.finance ?? 'Фінанси'}
        subtitle="Витрати, доходи, бюджет та аналітика"
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
