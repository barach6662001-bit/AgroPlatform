import { Typography, Space } from 'antd';
import { WarningOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '../../i18n';
import s from './AlertsPanel.module.css';

const { Text } = Typography;

interface Props {
  underRepairMachines: number;
  pendingOperations: number;
}

export default function AlertsPanel({ underRepairMachines, pendingOperations }: Props) {
  const { t } = useTranslation();

  const alerts: { icon: React.ReactNode; text: string; color: string }[] = [];

  if (underRepairMachines > 0) {
    alerts.push({
      icon: <WarningOutlined />,
      text: `${underRepairMachines} ${t.dashboard.machinesUnderRepair}`,
      color: 'var(--error)',
    });
  }

  if (pendingOperations > 0) {
    alerts.push({
      icon: <ClockCircleOutlined />,
      text: `${pendingOperations} ${t.dashboard.pendingOpsAlert}`,
      color: 'var(--warning)',
    });
  }

  if (alerts.length === 0) return null;

  return (
    <div className={s.flex_col}>
      {alerts.map((alert, i) => (
        <div
          key={i}
          className={s.flex_center}
        >
          <Space>
            <span style={{ color: alert.color, fontSize: 16 }}>{alert.icon}</span>
            <Text style={{ color: alert.color, fontWeight: 600, fontSize: 13 }}>
              {alert.text}
            </Text>
          </Space>
        </div>
      ))}
    </div>
  );
}
