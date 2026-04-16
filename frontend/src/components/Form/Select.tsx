import { Select as AntSelect } from 'antd';
import type { SelectProps as AntSelectProps } from 'antd';
import s from './PremiumForm.module.css';

export interface SelectProps extends AntSelectProps {
  label?: string;
  error?: string;
}

export default function Select({ label, error, className, ...props }: SelectProps) {
  return (
    <div className={s.field}>
      {label && <label className={s.label}>{label}</label>}
      <AntSelect
        className={`${s.select} ${error ? s.inputError : ''} ${className || ''}`}
        {...props}
      />
      {error && <span className={s.errorMsg}>{error}</span>}
    </div>
  );
}
