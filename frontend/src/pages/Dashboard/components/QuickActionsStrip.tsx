import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import s from './QuickActionsStrip.module.css';

export interface QuickAction {
  label: string;
  icon: ReactNode;
  color: string;
  route: string;
}

interface Props {
  actions: QuickAction[];
}

export default function QuickActionsStrip({ actions }: Props) {
  const navigate = useNavigate();

  return (
    <div className={s.strip}>
      {actions.map((qa, i) => (
        <button
          key={i}
          className={s.action}
          onClick={() => navigate(qa.route)}
          style={{ '--qa-color': qa.color } as React.CSSProperties}
        >
          <span className={s.icon}>{qa.icon}</span>
          <span className={s.label}>{qa.label}</span>
        </button>
      ))}
    </div>
  );
}
