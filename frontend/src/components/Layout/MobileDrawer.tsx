import { Drawer } from 'antd';
import { Sidebar } from '@/components/shell/sidebar';
import { useTranslation } from '../../i18n';
import s from './MobileDrawer.module.css';

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
        header: { background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', color: 'var(--brand)' },
        body: { background: 'var(--bg-surface)', padding: 0 },
        mask: { background: 'rgba(0,0,0,0.6)' },
      }}
      closeIcon={<span className={s.colored}>✕</span>}
    >
      <Sidebar />
    </Drawer>
  );
}
