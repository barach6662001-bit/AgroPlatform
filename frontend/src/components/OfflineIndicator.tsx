import { Badge, Button, Tooltip } from 'antd';
import { CloudSyncOutlined, DisconnectOutlined, LoadingOutlined } from '@ant-design/icons';
import { useOfflineSync } from '../hooks/useOfflineSync';
import { useTranslation } from '../i18n';
import s from './OfflineIndicator.module.css';

export default function OfflineIndicator() {
  const { isOnline, pendingCount, isSyncing, triggerSync } = useOfflineSync();
  const { t } = useTranslation();

  if (isOnline && pendingCount === 0 && !isSyncing) {
    return null;
  }

  if (!isOnline) {
    return (
      <Tooltip title={pendingCount > 0 ? t.offline.pendingCount.replace('{n}', String(pendingCount)) : t.offline.offline}>
        <div className={s.flex_center}>
          <Badge count={pendingCount} size="small" color="var(--warning)">
            <div className={s.flex_center1}>
              <DisconnectOutlined className={s.text13} />
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
        icon={isSyncing ? <LoadingOutlined spin className={s.text13} /> : <CloudSyncOutlined className={s.text13} />}
        onClick={triggerSync}
        disabled={isSyncing}
        className={s.flex_center2}
      >
        {pendingCount > 0 && !isSyncing && (
          <Badge count={pendingCount} size="small" className={s.spaced} />
        )}
        {isSyncing ? t.offline.syncing : t.offline.pendingCount.replace('{n}', String(pendingCount))}
      </Button>
    </Tooltip>
  );
}
