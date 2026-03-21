import { useEffect, useState } from 'react';
import { Button, Select, Table, Tag, Space, DatePicker, Alert, Spin, message } from 'antd';
import { DownloadOutlined, ReloadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import { getPrescriptionMap, exportPrescriptionMap } from '../../api/fields';
import type { PrescriptionMapDto, PrescriptionZoneDto } from '../../types/field';
import { useTranslation } from '../../i18n';
import EmptyState from '../../components/EmptyState';

interface Props {
  fieldId: string;
}

const NUTRIENTS = ['Nitrogen', 'Phosphorus', 'Potassium'] as const;

const rateClassColor: Record<string, string> = {
  A: 'red',
  B: 'orange',
  C: 'green',
};

const renderNumeric = (v?: number, decimals = 1) =>
  v != null ? v.toFixed(decimals) : '—';

export default function FieldPrescriptionTab({ fieldId }: Props) {
  const { t } = useTranslation();
  const [nutrient, setNutrient] = useState<string>('Nitrogen');
  const [ndviDate, setNdviDate] = useState<string | undefined>(undefined);
  const [data, setData] = useState<PrescriptionMapDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  const load = (n = nutrient, d = ndviDate) => {
    setLoading(true);
    getPrescriptionMap(fieldId, n, d)
      .then(setData)
      .catch(() => message.error(t.fields.prescriptionLoadError))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [fieldId]);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportPrescriptionMap(fieldId, nutrient, ndviDate);
    } catch {
      message.error(t.fields.prescriptionExportError);
    } finally {
      setExporting(false);
    }
  };

  const nutrientLabel = (n: string) => {
    if (n === 'Nitrogen') return t.fields.prescriptionNutrientN;
    if (n === 'Phosphorus') return t.fields.prescriptionNutrientP;
    return t.fields.prescriptionNutrientK;
  };

  const rateClassLabel = (rc: string) => {
    if (rc === 'A') return t.fields.prescriptionRateClassA;
    if (rc === 'C') return t.fields.prescriptionRateClassC;
    return t.fields.prescriptionRateClassB;
  };

  const columns = [
    {
      title: t.fields.prescriptionZone,
      dataIndex: 'zoneName',
      key: 'zoneName',
    },
    {
      title: t.fields.prescriptionRateClass,
      dataIndex: 'rateClass',
      key: 'rateClass',
      render: (rc: string) => (
        <Tag color={rateClassColor[rc] ?? 'default'}>{rateClassLabel(rc)}</Tag>
      ),
    },
    {
      title: t.fields.prescriptionRate,
      dataIndex: 'recommendedRateKgPerHa',
      key: 'rate',
      render: (v: number) => renderNumeric(v),
    },
    {
      title: t.fields.soilNitrogen,
      dataIndex: 'soilNitrogen',
      key: 'n',
      render: (v?: number) => renderNumeric(v),
    },
    {
      title: t.fields.soilPhosphorus,
      dataIndex: 'soilPhosphorus',
      key: 'p',
      render: (v?: number) => renderNumeric(v),
    },
    {
      title: t.fields.soilPotassium,
      dataIndex: 'soilPotassium',
      key: 'k',
      render: (v?: number) => renderNumeric(v),
    },
    {
      title: t.fields.soilPH,
      dataIndex: 'soilPH',
      key: 'ph',
      render: (v?: number) => renderNumeric(v, 2),
    },
    {
      title: t.fields.prescriptionSampleDate,
      dataIndex: 'sampleDate',
      key: 'sampleDate',
      render: (d?: string) => d ? dayjs(d).format('YYYY-MM-DD') : '—',
    },
  ];

  const hasData = data && data.zones.length > 0 && data.zones.some(z => z.sampleDate);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Space wrap>
        <Select
          style={{ minWidth: 160 }}
          value={nutrient}
          onChange={(v) => setNutrient(v)}
          options={NUTRIENTS.map((n) => ({ value: n, label: nutrientLabel(n) }))}
        />
        <DatePicker
          placeholder={t.fields.prescriptionNdviDate}
          onChange={(d) => setNdviDate(d ? d.format('YYYY-MM-DD') : undefined)}
          allowClear
        />
        <Button
          icon={<ReloadOutlined />}
          onClick={() => load(nutrient, ndviDate)}
        >
          {t.fields.prescriptionGenerate}
        </Button>
        <Button
          type="primary"
          icon={<DownloadOutlined />}
          loading={exporting}
          onClick={handleExport}
        >
          {t.fields.prescriptionExportCsv}
        </Button>
      </Space>

      {data?.ndviDate && (
        <Alert
          type="info"
          message={`${t.fields.prescriptionNdviDate}: ${data.ndviDate}`}
          banner
        />
      )}

      {loading ? (
        <Spin />
      ) : !hasData ? (
        <EmptyState message={t.fields.prescriptionNoData} />
      ) : (
        <Table<PrescriptionZoneDto>
          dataSource={data?.zones ?? []}
          columns={columns}
          rowKey={(r) => r.zoneId ?? r.zoneName}
          pagination={false}
          size="small"
        />
      )}
    </div>
  );
}

