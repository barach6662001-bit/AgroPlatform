import { Form, type FormItemProps } from 'antd';
import type { ReactNode } from 'react';

interface Props extends FormItemProps {
  children: ReactNode;
}

export default function FormField({ children, ...rest }: Props) {
  return (
    <Form.Item
      {...rest}
      style={{
        marginBottom: 16,
        ...rest.style,
      }}
    >
      {children}
    </Form.Item>
  );
}
