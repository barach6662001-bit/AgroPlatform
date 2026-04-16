import { Modal } from 'antd';
import type { ModalProps } from 'antd';
import s from './PremiumModal.module.css';

export interface PremiumModalProps extends ModalProps {
  accentColor?: string;
}

export default function PremiumModal({
  className,
  accentColor = '#22C55E',
  ...props
}: PremiumModalProps) {
  return (
    <Modal
      className={`${s.modal} ${className || ''}`}
      style={{ ['--modal-accent' as string]: accentColor, ...props.style }}
      {...props}
    />
  );
}
