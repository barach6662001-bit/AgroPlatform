import { Drawer } from 'antd';
import type { DrawerProps } from 'antd';
import s from './PremiumDrawer.module.css';

export default function PremiumDrawer({ className, ...props }: DrawerProps) {
  return (
    <Drawer
      className={`${s.drawer} ${className || ''}`}
      placement="right"
      {...props}
    />
  );
}
