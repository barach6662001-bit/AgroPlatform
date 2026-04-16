import { useEffect } from 'react';
import { Tabs } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from '../../i18n';
import PageHeader from '../../components/PageHeader';
import EmployeeList from '../HR/EmployeeList';
import WorkLogPage from '../HR/WorkLogPage';
import SalaryPage from '../HR/SalaryPage';

const VALID_TABS = ['employees', 'worklogs', 'salary'] as const;
type TabKey = (typeof VALID_TABS)[number];

function parseTab(search: string): TabKey {
  const params = new URLSearchParams(search);
  const tab = params.get('tab') as TabKey | null;
  return tab && VALID_TABS.includes(tab) ? tab : 'employees';
}

export default function TeamPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = parseTab(location.search);

  useEffect(() => {
    if (!new URLSearchParams(location.search).has('tab')) {
      navigate(`/team?tab=employees`, { replace: true });
    }
  }, [location.search, navigate]);

  const handleTabChange = (key: string) => {
    navigate(`/team?tab=${key}`, { replace: true });
  };

  const items = [
    {
      key: 'employees',
      label: t.nav.employees ?? 'Співробітники',
      children: <EmployeeList />,
    },
    {
      key: 'worklogs',
      label: t.nav.workLogs ?? 'Табель',
      children: <WorkLogPage />,
    },
    {
      key: 'salary',
      label: t.nav.salary ?? 'Зарплата',
      children: <SalaryPage />,
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.nav.hr ?? 'Команда'}
        subtitle={t.hr?.teamSubtitle ?? 'Співробітники, табель і зарплата'}
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
