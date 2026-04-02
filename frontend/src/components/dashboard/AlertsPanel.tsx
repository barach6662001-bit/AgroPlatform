import { Typography, Space } from 'antd';
import { WarningOutlined, ClockCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useTranslation } from '../../i18n';

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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {alerts.map((alert, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 8,
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
          }}
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
