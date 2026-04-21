import { Input as AntInput } from 'antd';
import type { InputProps as AntInputProps } from 'antd';
import s from './PremiumForm.module.css';

export interface InputProps extends AntInputProps {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className, ...props }: InputProps) {
  return (
    <div className={s.field}>
      {label && <label className={s.label}>{label}</label>}
      <AntInput
        className={`${s.input} ${error ? s.inputError : ''} ${className || ''}`}
        {...props}
      />
      {error && <span className={s.errorMsg}>{error}</span>}
    </div>
  );
}
