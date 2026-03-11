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
        header: { background: '#0D1117', borderBottom: '1px solid #30363D', color: '#2DD4BF' },
        body: { background: '#0D1117', padding: 0 },
        mask: { background: 'rgba(0,0,0,0.6)' },
      }}
      closeIcon={<span style={{ color: '#E6EDF3' }}>✕</span>}
    >
      <div onClick={onClose}>
        <Sidebar />
      </div>
    </Drawer>
  );
}
