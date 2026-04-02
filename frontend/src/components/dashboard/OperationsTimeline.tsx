import { List, Tag, Typography, Empty } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { AgroOperationDto } from '../../types/operation';
import { useTranslation } from '../../i18n';
import { formatDate } from '../../utils/dateFormat';

const { Text } = Typography;

interface Props {
  operations: AgroOperationDto[];
}

export default function OperationsTimeline({ operations }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  if (operations.length === 0) {
    return <Empty description={t.dashboard.noActivity} image={Empty.PRESENTED_IMAGE_SIMPLE} />;
  }

  return (
    <List
      dataSource={operations}
      split={false}
      renderItem={(op) => (
        <List.Item
          style={{ padding: '8px 0', borderBottom: '1px solid var(--border)', cursor: 'pointer' }}
          onClick={() => navigate(`/operations/${op.id}`)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%' }}>
            {op.isCompleted ? (
              <CheckCircleOutlined style={{ color: 'var(--success)', fontSize: 16 }} />
            ) : (
              <ClockCircleOutlined style={{ color: 'var(--warning)', fontSize: 16 }} />
            )}
            <div style={{ flex: 1, minWidth: 0 }}>
              <Text style={{ fontSize: 13, color: 'var(--text-primary)' }} ellipsis>
                {t.operationTypes[op.operationType as keyof typeof t.operationTypes] || op.operationType}
              </Text>
              <div>
                <Text style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{op.fieldName}</Text>
              </div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <Text style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                {formatDate(op.completedDate ?? op.plannedDate)}
              </Text>
              <div>
                <Tag
                  color={op.isCompleted ? 'success' : 'warning'}
                  style={{ fontSize: 10, margin: 0, borderRadius: 4 }}
                >
                  {op.isCompleted ? t.operations.completed : t.operations.inProgress}
                </Tag>
              </div>
            </div>
          </div>
        </List.Item>
      )}
    />
  );
}
