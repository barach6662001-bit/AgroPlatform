import type { ReactNode } from 'react';
import { Button, Popconfirm } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { useTranslation } from '../i18n';

interface DeleteConfirmButtonProps {
  onConfirm: () => void;
  title?: string;
  description?: string;
  buttonText?: string;
  size?: 'small' | 'middle' | 'large';
  danger?: boolean;
  iconOnly?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
}

export default function DeleteConfirmButton({
  onConfirm,
  title,
  description,
  buttonText,
  size = 'small',
  danger = true,
  iconOnly = true,
  disabled = false,
  icon,
}: DeleteConfirmButtonProps) {
  const { t } = useTranslation();

  return (
    <Popconfirm
      title={title ?? t.common.confirm}
      description={description}
      okText={t.common.delete}
      cancelText={t.common.cancel}
      okButtonProps={{ danger: true }}
      onConfirm={onConfirm}
      disabled={disabled}
    >
      <Button
        size={size}
        danger={danger}
        icon={icon ?? <DeleteOutlined />}
        disabled={disabled}
      >
        {iconOnly ? null : (buttonText ?? t.common.delete)}
      </Button>
    </Popconfirm>
  );
}
