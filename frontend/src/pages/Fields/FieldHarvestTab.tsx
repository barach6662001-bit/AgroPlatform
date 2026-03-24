import { useEffect, useState } from 'react';
import { Alert, Button, Table, Tag, Tooltip, Select, Space, message } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import DeleteConfirmButton from '../../components/DeleteConfirmButton';
import dayjs from 'dayjs';
import { getFieldHarvests, deleteFieldHarvest } from '../../api/fields';
import type { FieldHarvestDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import { useRole } from '../../hooks/useRole';
import EmptyState from '../../components/EmptyState';

interface Props {
  fieldId: string;
}

export default function FieldHarvestTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const { hasRole } = useRole();
  const canWrite = hasRole(['Administrator', 'Manager', 'Agronomist']);
  const [data, setData] = useState<FieldHarvestDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [year, setYear] = useState<number | undefined>(undefined);

  const load = () => {
    setLoading(true);
    getFieldHarvests(fieldId, year)
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId, year]);

  const handleDelete = async (id: string) => {
    try {
      await deleteFieldHarvest(fieldId, id);
      message.success(t.fields.deleteSuccess);
      load();
    } catch {
      message.error(t.fields.deleteError);
    }
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = [
    { value: undefined, label: t.fields.allYears },
    ...Array.from({ length: 10 }, (_, i) => currentYear - i).map((y) => ({ value: y, label: String(y) })),
  ];

  const columns = [
    { title: t.fields.cropName, dataIndex: 'cropName', key: 'cropName' },
    {
      title: t.fields.totalTons, dataIndex: 'totalTons', key: 'totalTons',
      render: (v: number, record: FieldHarvestDto) => (
        <span>
          {v?.toFixed(1)} т
          {record.syncedFromGrainStorage && (
            <Tooltip title={t.fields.syncedFromGrain}>
              <SyncOutlined style={{ color: '#238636', marginLeft: 6 }} />
            </Tooltip>
          )}
        </span>
      ),
    },
    { title: t.fields.yieldPerHaLabel, dataIndex: 'yieldTonsPerHa', key: 'yieldTonsPerHa', render: (v: number) => v ? v.toFixed(2) : '—' },
    { title: t.fields.moisture, dataIndex: 'moisturePercent', key: 'moisturePercent', render: (v: number) => v != null ? `${v}%` : '—' },
    { title: t.fields.pricePerTon, dataIndex: 'pricePerTon', key: 'pricePerTon', render: (v: number) => v ?? '—' },
    { title: t.fields.totalRevenue, dataIndex: 'totalRevenue', key: 'totalRevenue', render: (v: number) => v ? v.toLocaleString('uk-UA', { maximumFractionDigits: 2 }) : '—' },
    { title: t.fields.harvestDate, dataIndex: 'harvestDate', key: 'harvestDate', render: (v: string) => dayjs(v).format('DD.MM.YYYY') },
    ...(canWrite ? [{
      title: t.common.actions, key: 'actions',
      render: (_: unknown, record: FieldHarvestDto) =>
        record.syncedFromGrainStorage ? (
          <Tooltip title={t.fields.managedInGrainStorage}>
            <Tag color="green">{t.fields.fromGrainStorage}</Tag>
          </Tooltip>
        ) : (
          <DeleteConfirmButton
            title={t.fields.deleteField}
            description={t.fields.deleteCannotBeUndone}
            onConfirm={() => handleDelete(record.id)}
          />
        ),
    }] : []),
  ];

  return (
    <div>
      <Alert
        type="info"
        showIcon
        message={t.fields.harvestSyncInfo}
        style={{ marginBottom: 16 }}
      />
      <Space style={{ marginBottom: 12 }}>
        <span style={{ color: 'var(--agro-text-secondary)', fontSize: 13 }}>{t.fields.year}:</span>
        <Select
          style={{ width: 90 }}
          value={year}
          onChange={setYear}
          options={yearOptions}
          allowClear
          placeholder={t.fields.allYears}
        />
      </Space>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
        locale={{
          emptyText: <EmptyState
            message={t.fields.noHarvests || 'Дані врожаю з\'являться після прийому зерна в зерносховищі'}
          />,
        }}
      />
    </div>
  );
}
