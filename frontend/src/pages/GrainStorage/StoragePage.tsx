import { Tabs } from 'antd';
import { useTranslation } from '../../i18n';
import GrainStorageList from './GrainStorageList';
import GrainBatchList from './GrainBatchList';
import GrainStorageOverview from './GrainStorageOverview';

export default function StoragePage() {
  const { t } = useTranslation();

  const items = [
    {
      key: 'storages',
      label: t.nav.grainStorages,
      children: <GrainStorageList />,
    },
    {
      key: 'batches',
      label: t.nav.grainBatches,
      children: <GrainBatchList />,
    },
    {
      key: 'overview',
      label: t.nav.grainOverview,
      children: <GrainStorageOverview />,
    },
  ];

  return (
    <Tabs
      defaultActiveKey="storages"
      items={items}
      destroyInactiveTabPane={false}
    />
  );
}
