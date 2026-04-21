import { useState, useRef, type FormEvent } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';
import { useTranslation, languages } from '../i18n';
import Logo from '../components/Logo';
import s from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const { t, lang, setLang } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [langOpen, setLangOpen] = useState(false);

  const passwordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  const validate = () => {
    const next: { email?: string; password?: string } = {};
    if (!email) next.email = t.auth.enterEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) next.email = t.auth.enterEmail;
    if (!password) next.password = t.auth.enterPassword;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await login({ email, password });
      setAuth(data.token, data.email, data.role, data.tenantId, data.requirePasswordChange, data.hasCompletedOnboarding, data.firstName, data.lastName, data.refreshToken);
      navigate(data.requirePasswordChange ? '/change-password' : '/');
    } catch {
      setApiError(t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  const currentLang = languages.find((l) => l.code === lang);
  const loadingLabel = lang === 'uk' ? 'Вхід…' : 'Signing in…';

  return (
    <div className={s.loginPage}>
      <div className={s.orbGreen} aria-hidden="true" />
      <div className={s.orbBlue} aria-hidden="true" />
      <div className={s.noise} aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={s.cardWrap}
      >
        <div className={s.card}>
          <div className={s.header}>
            <div className={s.logo}>
              <Logo size={44} variant="icon" />
            </div>
            <h1 className={s.title}>{t.auth.loginTitle}</h1>
            <p className={s.subtitle}>{t.auth.loginSubtitle}</p>
          </div>

          <form className={s.form} onSubmit={onSubmit} noValidate>
            <div className={s.field}>
              <label className={s.label} htmlFor="login-email">
                {t.auth.email}
              </label>
              <div className={s.inputRow}>
                <span className={s.inputIcon} aria-hidden="true">
                  <Mail size={13} strokeWidth={1.6} />
                </span>
                <input
                  id="login-email"
                  type="email"
                  className={`${s.input}${errors.email ? ` ${s.inputError}` : ''}`}
                  placeholder={t.auth.email}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                  }}
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className={s.fieldError}>{errors.email}</p>}
            </div>

            <div className={s.field}>
              <label className={s.label} htmlFor="login-password">
                {t.auth.password}
              </label>
              <div className={s.inputRow}>
                <span className={s.inputIcon} aria-hidden="true">
                  <Lock size={13} strokeWidth={1.6} />
                </span>
                <input
                  id="login-password"
                  ref={passwordRef}
                  type={showPassword ? 'text' : 'password'}
                  className={`${s.input} ${s.inputWithToggle}${errors.password ? ` ${s.inputError}` : ''}`}
                  placeholder={t.auth.password}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={s.passwordToggle}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff size={16} strokeWidth={1.6} />
                    : <Eye size={16} strokeWidth={1.6} />}
                </button>
              </div>
              {errors.password && <p className={s.fieldError}>{errors.password}</p>}
            </div>

            {apiError && (
              <div className={s.apiError} role="alert">
                <AlertCircle size={14} strokeWidth={1.8} className={s.apiErrorIcon} />
                <p className={s.apiErrorText}>{apiError}</p>
              </div>
            )}

            <button
              ref={submitRef}
              type="submit"
              className={s.submit}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={14} strokeWidth={2} className={s.spinner} />
                  <span>{loadingLabel}</span>
                </>
              ) : (
                <>
                  <span>{t.auth.login}</span>
                  <ArrowRight size={14} strokeWidth={2} className={s.submitArrow} />
                </>
              )}
            </button>
          </form>

          <p className={s.helpText}>{t.auth.forgotPassword}</p>
        </div>
      </motion.div>

      <div className={s.footer}>
        <div className={s.langWrap}>
          <button
            type="button"
            className={s.langButton}
            onClick={() => setLangOpen((v) => !v)}
            onBlur={(e) => {
              if (!e.currentTarget.parentElement?.contains(e.relatedTarget)) {
                setLangOpen(false);
              }
            }}
          >
            <img src={currentLang?.flag} alt={currentLang?.shortLabel} className={s.flagIcon} />
            <span className={s.langLabel}>{currentLang?.shortLabel}</span>
          </button>
          {langOpen && (
            <div className={s.langDropdown}>
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  className={`${s.langOption}${l.code === lang ? ` ${s.langOptionActive}` : ''}`}
                  onClick={() => {
                    setLang(l.code as 'uk' | 'en');
                    setLangOpen(false);
                  }}
                >
                  <img src={l.flag} alt={l.shortLabel} className={s.flagIcon} />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className={s.copyright}>{t.auth.copyright}</span>
      </div>
    </div>
  );
}
