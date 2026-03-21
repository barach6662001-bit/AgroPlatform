import { useEffect, useState } from 'react';
import { Button, Table, Tag, Alert, Spin, Space, Typography } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import { getPrescriptionMap, getPrescriptionCsvUrl } from '../../api/satellite';
import type { PrescriptionZoneDto, PrescriptionMapDto } from '../../types/prescription';
import { useTranslation } from '../../i18n';

const { Text } = Typography;

interface Props {
  fieldId: string;
}

const zoneColor = (zone: string) => {
  if (zone === 'High') return 'red';
  if (zone === 'Medium') return 'orange';
  return 'green';
};

export default function FieldPrescriptionTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const [data, setData] = useState<PrescriptionMapDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getPrescriptionMap(fieldId)
      .then(setData)
      .catch((err: unknown) => setError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId]);

  const columns = [
    { title: t.fields.prescriptionZoneId, dataIndex: 'zoneId', key: 'zoneId' },
    { title: t.fields.soilSampleDate, dataIndex: 'sampleDate', key: 'sampleDate', render: (v?: string) => v ? new Date(v).toLocaleDateString('uk-UA') : '—' },
    { title: t.fields.soilPh, dataIndex: 'ph', key: 'ph', render: (v?: number) => v ?? '—' },
    { title: t.fields.soilN, dataIndex: 'n', key: 'n', render: (v?: number) => v ?? '—' },
    { title: t.fields.soilP, dataIndex: 'p', key: 'p', render: (v?: number) => v ?? '—' },
    { title: t.fields.soilK, dataIndex: 'k', key: 'k', render: (v?: number) => v ?? '—' },
    { title: t.fields.prescriptionNRate, dataIndex: 'recommendedNKgPerHa', key: 'n_rate', render: (v: number) => `${v} кг/га` },
    { title: t.fields.prescriptionPRate, dataIndex: 'recommendedPKgPerHa', key: 'p_rate', render: (v: number) => `${v} кг/га` },
    { title: t.fields.prescriptionKRate, dataIndex: 'recommendedKKgPerHa', key: 'k_rate', render: (v: number) => `${v} кг/га` },
    {
      title: t.fields.prescriptionAppZone,
      dataIndex: 'applicationZone',
      key: 'zone',
      render: (v: string) => (
        <Tag color={zoneColor(v)}>
          {v === 'High' ? t.fields.prescriptionZoneHigh : v === 'Medium' ? t.fields.prescriptionZoneMedium : t.fields.prescriptionZoneLow}
        </Tag>
      ),
    },
  ];

  if (loading) return <Spin style={{ display: 'block', margin: '40px auto' }} />;
  if (error) return <Alert type="error" message={error} />;
  if (!data) return null;

  return (
    <div>
      <Space style={{ marginBottom: 12 }} wrap>
        <Button icon={<ReloadOutlined />} onClick={load}>
          {'Оновити'}
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          href={getPrescriptionCsvUrl(fieldId)}
          download
        >
          {t.fields.prescriptionExportCsv}
        </Button>
      </Space>

      <Alert
        type={data.ndviConfigured ? 'success' : 'info'}
        showIcon
        message={data.ndviConfigured ? t.fields.prescriptionNdviNote : t.fields.prescriptionNdviNotConfigured}
        style={{ marginBottom: 12 }}
      />

      {data.zones.length === 0 ? (
        <Alert type="warning" message={t.fields.prescriptionNoData} />
      ) : (
        <>
          <div style={{ marginBottom: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {t.fields.prescriptionTitle} — {data.fieldName} ({data.areaHectares.toFixed(2)} га)
            </Text>
          </div>
          <Table<PrescriptionZoneDto>
            dataSource={data.zones}
            columns={columns}
            rowKey="zoneId"
            pagination={false}
            size="small"
          />
        </>
      )}
    </div>
  );
}
