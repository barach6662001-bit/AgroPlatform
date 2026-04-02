import { List, Tag, Typography, Empty } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { AgroOperationDto } from '../../types/operation';
import { useTranslation } from '../../i18n';
import { formatDate } from '../../utils/dateFormat';
import s from './OperationsTimeline.module.css';

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
          className={s.padded}
          onClick={() => navigate(`/operations/${op.id}`)}
        >
          <div className={s.flex_center}>
            {op.isCompleted ? (
              <CheckCircleOutlined className={s.text16} />
            ) : (
              <ClockCircleOutlined className={s.text161} />
            )}
            <div className={s.block4}>
              <Text className={s.text13} ellipsis>
                {t.operationTypes[op.operationType as keyof typeof t.operationTypes] || op.operationType}
              </Text>
              <div>
                <Text className={s.text11}>{op.fieldName}</Text>
              </div>
            </div>
            <div className={s.textRight}>
              <Text className={s.text111}>
                {formatDate(op.completedDate ?? op.plannedDate)}
              </Text>
              <div>
                <Tag
                  color={op.isCompleted ? 'success' : 'warning'}
                  className={s.text10}
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
