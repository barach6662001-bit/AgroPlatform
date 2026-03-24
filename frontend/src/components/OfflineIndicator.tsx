import { Badge, Button, Tooltip } from 'antd';
import { CloudSyncOutlined, DisconnectOutlined, LoadingOutlined } from '@ant-design/icons';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useTranslation } from '../i18n';

export default function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useOfflineSync();
  const { t } = useTranslation();

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  if (!isOnline) {
    return (
      <Tooltip title={pendingCount > 0 ? t.offline.pendingCount.replace('{n}', String(pendingCount)) : t.offline.offline}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Badge count={pendingCount} size="small" color="#faad14">
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(250,173,20,0.15)',
              border: '1px solid rgba(250,173,20,0.4)',
              borderRadius: 6,
              padding: '3px 8px',
              fontSize: 12,
              color: '#faad14',
            }}>
              <DisconnectOutlined style={{ fontSize: 13 }} />
              <span>{t.offline.offline}</span>
            </div>
          </Badge>
        </div>
      </Tooltip>
    );
  }

  // Online but has pending items or currently syncing
  return (
    <Tooltip title={t.offline.syncNow}>
      <Button
        type="text"
        size="small"
        icon={isSyncing ? <LoadingOutlined spin style={{ fontSize: 13 }} /> : <CloudSyncOutlined style={{ fontSize: 13 }} />}
        onClick={triggerSync}
        disabled={isSyncing}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          color: '#52c41a',
          fontSize: 12,
          height: 28,
        }}
      >
        {pendingCount > 0 && !isSyncing && (
          <Badge count={pendingCount} size="small" style={{ marginLeft: 2 }} />
        )}
        {isSyncing ? t.offline.syncing : t.offline.pendingCount.replace('{n}', String(pendingCount))}
      </Button>
    </Tooltip>
  );
}
