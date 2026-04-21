import { Input } from 'antd';
import type { TextAreaProps } from 'antd/es/input';
import s from './PremiumForm.module.css';

const { TextArea } = Input;

export interface TextareaProps extends TextAreaProps {
  label?: string;
  error?: string;
}

export default function Textarea({ label, error, className, ...props }: TextareaProps) {
  return (
    <div className={s.field}>
      {label && <label className={s.label}>{label}</label>}
      <TextArea
        className={`${s.textarea} ${className || ''}`}
        {...props}
      />
      {error && <span className={s.errorMsg}>{error}</span>}
    </div>
  );
}
