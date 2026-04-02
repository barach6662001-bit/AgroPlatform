import { useEffect, useState } from 'react';
import { Table, Tag, Select, message, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { getRotationAdvice } from '../../api/fields';
import type { RotationAdviceDto } from '../../types/field';
import PageHeader from '../../components/PageHeader';
import Breadcrumbs from '../../components/ui/Breadcrumbs';
import { useTranslation } from '../../i18n';
import s from './CropRotationAdvisor.module.css';

const { Text } = Typography;

const riskColor: Record<string, string> = {
  low: 'success',
  medium: 'warning',
  high: 'error',
};

export default function CropRotationAdvisor() {
  const { t } = useTranslation();
  const [data, setData] = useState<RotationAdviceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState(3);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await getRotationAdvice(years);
        if (!cancelled) setData(result);
      } catch {
        if (!cancelled) message.error(t.fields.rotationLoadError);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, [years, t.fields.rotationLoadError]);

  const columns: ColumnsType<RotationAdviceDto> = [
    {
      title: t.fields.name,
      dataIndex: 'fieldName',
      key: 'fieldName',
      sorter: (a, b) => a.fieldName.localeCompare(b.fieldName),
    },
    {
      title: t.fields.rotationCropHistory,
      dataIndex: 'cropHistory',
      key: 'cropHistory',
      render: (crops: string[]) =>
        crops.length === 0 ? (
          <Text type="secondary">{t.fields.rotationNoCrops}</Text>
        ) : (
          crops.map((crop, idx) => (
            <Tag key={idx}>{crop}</Tag>
          ))
        ),
    },
    {
      title: t.fields.rotationRisk,
      dataIndex: 'riskLevel',
      key: 'riskLevel',
      filters: [
        { text: t.fields.rotationRiskLow, value: 'low' },
        { text: t.fields.rotationRiskMedium, value: 'medium' },
        { text: t.fields.rotationRiskHigh, value: 'high' },
      ],
      onFilter: (value, record) => record.riskLevel === value,
      render: (risk: string) => {
        const label =
          risk === 'high'
            ? t.fields.rotationRiskHigh
            : risk === 'medium'
            ? t.fields.rotationRiskMedium
            : t.fields.rotationRiskLow;
        return <Tag color={riskColor[risk] ?? 'default'}>{label}</Tag>;
      },
    },
    {
      title: t.fields.rotationRecommendation,
      dataIndex: 'recommendation',
      key: 'recommendation',
    },
  ];

  return (
    <div>
      <PageHeader
        title={t.fields.rotationAdviceTitle}
        subtitle={t.fields.rotationAdviceSubtitle}
        breadcrumbs={<Breadcrumbs items={[{ label: t.nav.fields, path: '/fields' }, { label: t.nav.cropRotationAdvisor }]} />}
      />
      <div className={s.spaced}>
        <Text className={s.spaced1}>{t.fields.rotationYears}:</Text>
        <Select
          value={years}
          onChange={setYears}
          className={s.block2}
          options={[
            { value: 1, label: '1' },
            { value: 2, label: '2' },
            { value: 3, label: '3' },
            { value: 5, label: '5' },
          ]}
        />
      </div>
      <Table<RotationAdviceDto>
        rowKey="fieldId"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{ pageSize: 20 }}
      />
    </div>
  );
}
