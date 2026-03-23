import { useEffect, useState } from 'react';
import { Table, Tag, Select, Card, Typography, Space, Tooltip } from 'antd';
import { WarningOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getRotationAdvice } from '../../api/fields';
import type { CropRotationAdviceDto } from '../../types/field';
import PageHeader from '../../components/PageHeader';
import { useTranslation } from '../../i18n';

const { Text } = Typography;

const riskColors: Record<string, string> = {
  None: 'success',
  Medium: 'warning',
  High: 'error',
};

const riskIcons: Record<string, React.ReactNode> = {
  None: <CheckCircleOutlined />,
  Medium: <ExclamationCircleOutlined />,
  High: <WarningOutlined />,
};

export default function CropRotationAdvisor() {
  const { t } = useTranslation();
  const ta = t.cropRotationAdvisor;
  const [data, setData] = useState<CropRotationAdviceDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [years, setYears] = useState(3);

  const load = async (y: number) => {
    setLoading(true);
    try {
      const result = await getRotationAdvice(y);
      setData(result);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(years);
  }, [years]);

  const riskLabel = (level: string) => {
    if (level === 'High') return ta.riskHigh;
    if (level === 'Medium') return ta.riskMedium;
    return ta.riskNone;
  };

  const columns: ColumnsType<CropRotationAdviceDto> = [
    {
      title: ta.fieldName,
      dataIndex: 'fieldName',
      key: 'fieldName',
      sorter: (a, b) => a.fieldName.localeCompare(b.fieldName),
    },
    {
      title: ta.area,
      dataIndex: 'areaHectares',
      key: 'areaHectares',
      width: 110,
      sorter: (a, b) => a.areaHectares - b.areaHectares,
      render: (v: number) => v.toFixed(1),
    },
    {
      title: ta.cropHistory,
      key: 'cropHistory',
      render: (_, row) => {
        if (!row.recentCropHistory.length) return <Text type="secondary">{ta.noHistory}</Text>;
        return (
          <Space size={4} wrap>
            {row.recentCropHistory.map((entry) => (
              <Tag key={entry.year}>{entry.year}: {entry.crop}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: ta.riskLevel,
      key: 'riskLevel',
      width: 140,
      sorter: (a, b) => {
        const order = { None: 0, Medium: 1, High: 2 };
        return (order[a.riskLevel] ?? 0) - (order[b.riskLevel] ?? 0);
      },
      render: (_, row) => (
        <Space>
          <Tag color={riskColors[row.riskLevel] ?? 'default'} icon={riskIcons[row.riskLevel]}>
            {riskLabel(row.riskLevel)}
          </Tag>
          {row.hasMonocultureRisk && (
            <Tooltip title={ta.monocultureWarning}>
              <Tag color="orange">{ta.monocultureWarning}</Tag>
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: ta.suggestedCrop,
      key: 'suggestedCrop',
      width: 160,
      render: (_, row) =>
        row.suggestedCrop ? <Tag color="blue">{row.suggestedCrop}</Tag> : <Text type="secondary">—</Text>,
    },
    {
      title: ta.recommendation,
      dataIndex: 'recommendation',
      key: 'recommendation',
      render: (text: string) => <Text style={{ fontSize: 13 }}>{text}</Text>,
    },
  ];

  return (
    <div>
      <PageHeader title={ta.title} subtitle={ta.subtitle} />
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Text>{ta.yearsLabel}:</Text>
          <Select
            value={years}
            onChange={setYears}
            options={[
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 5, label: '5' },
            ]}
            style={{ width: 80 }}
          />
        </Space>
      </Card>
      <Table
        columns={columns}
        dataSource={data}
        rowKey="fieldId"
        loading={loading}
        locale={{ emptyText: ta.noData }}
        pagination={{ pageSize: 20, showSizeChanger: false }}
        scroll={{ x: 900 }}
      />
    </div>
  );
}
