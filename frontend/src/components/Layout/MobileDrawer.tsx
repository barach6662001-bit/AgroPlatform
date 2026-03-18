import { Drawer } from 'antd';
import Sidebar from './Sidebar';
import { useTranslation } from '../../i18n';

interface MobileDrawerProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileDrawer({ open, onClose }: MobileDrawerProps) {
  const { t } = useTranslation();

  return (
    <Drawer
      title={t.app.name}
      placement="left"
      open={open}
      onClose={onClose}
      width={240}
      styles={{
        header: { background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', color: 'var(--accent)' },
        body: { background: 'var(--bg-surface)', padding: 0 },
        mask: { background: 'rgba(0,0,0,0.6)' },
      }}
      closeIcon={<span style={{ color: 'var(--text-primary)' }}>✕</span>}
    >
      <div onClick={onClose}>
        <Sidebar />
      </div>
    </Drawer>
  );
}
