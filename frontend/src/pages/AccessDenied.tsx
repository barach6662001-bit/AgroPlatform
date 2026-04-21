import { useNavigate } from 'react-router-dom';
import { useTranslation } from '../i18n';
import s from './ErrorPage.module.css';

export default function AccessDenied() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className={s.wrapper}>
      <div className={s.card}>
        <p className={s.code}>403</p>
        <h1 className={s.title}>{t.accessDenied.title}</h1>
        <p className={s.subtitle}>{t.accessDenied.subtitle}</p>
        <button className={s.button} onClick={() => navigate('/dashboard')}>
          {t.accessDenied.backHome}
        </button>
      </div>
    </div>
  );
}
