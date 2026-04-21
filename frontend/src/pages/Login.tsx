import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';
import { useTranslation, languages } from '../i18n';
import Logo from '../components/Logo';
import s from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((st) => st.setAuth);
  const { t, lang, setLang } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [langOpen, setLangOpen] = useState(false);
  const [focused, setFocused] = useState<'email' | 'password' | null>(null);

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
      setAuth(
        data.token,
        data.email,
        data.role,
        data.tenantId,
        data.requirePasswordChange,
        data.hasCompletedOnboarding,
        data.firstName,
        data.lastName,
        data.refreshToken,
      );
      navigate(data.requirePasswordChange ? '/change-password' : '/');
    } catch {
      setApiError(t.auth.loginError);
    } finally {
      setLoading(false);
    }
  };

  const currentLang = languages.find((l) => l.code === lang);
  const L = t.landing;

  return (
    <div className={s.loginPage}>
      <div className={s.canvasGlow} aria-hidden />
      <div className={s.canvasGrid} aria-hidden />

      <div className={s.topBar}>
        <Logo size={32} variant="full" />
      </div>

      <main className={s.main}>
        {/* Marketing column */}
        <section className={s.marketing}>
          <span className={s.chip}>
            <span className={s.chipDot} />
            {L.eyebrow}
          </span>
          <h1 className={s.heading}>
            {t.auth.loginTitle}
            <span className={s.headingAccent}> {t.auth.loginSubtitle}</span>
          </h1>
          <p className={s.subheading}>{L.heroSubtitle}</p>

          <ul className={s.bullets}>
            <li className={s.bullet}>
              <span className={s.bulletIcon}><Check size={12} strokeWidth={2.5} /></span>
              {L.heroMeta1}
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon}><Check size={12} strokeWidth={2.5} /></span>
              {L.heroMeta2}
            </li>
            <li className={s.bullet}>
              <span className={s.bulletIcon}><Check size={12} strokeWidth={2.5} /></span>
              {L.heroMeta3}
            </li>
          </ul>
        </section>

        {/* Form card column */}
        <div className={s.cardWrap}>
          <div className={s.card}>
            <div className={s.cardHeader}>
              <span className={s.cardLabel}>{t.auth.login}</span>
              <h2 className={s.cardTitle}>{t.auth.loginTitle}</h2>
              <p className={s.cardSubtitle}>{t.auth.loginSubtitle}</p>
            </div>

            <form className={s.form} onSubmit={onSubmit} noValidate>
              {/* Email */}
              <div className={s.fieldGroup}>
                <label htmlFor="login-email" className={s.fieldLabel}>{t.auth.email}</label>
                <div
                  className={`${s.inputRow}${focused === 'email' ? ` ${s.inputRowFocused}` : ''}${errors.email ? ` ${s.inputRowError}` : ''}`}
                >
                  <Mail
                    size={16}
                    strokeWidth={1.6}
                    className={`${s.fieldIcon}${focused === 'email' ? ` ${s.fieldIconActive}` : ''}`}
                  />
                  <input
                    id="login-email"
                    type="email"
                    className={s.input}
                    placeholder={t.auth.email}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
                    }}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    autoComplete="email"
                  />
                </div>
                {errors.email && (
                  <p className={s.fieldError}>
                    <AlertCircle size={12} strokeWidth={2} /> {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className={s.fieldGroup}>
                <label htmlFor="login-password" className={s.fieldLabel}>{t.auth.password}</label>
                <div
                  className={`${s.inputRow}${focused === 'password' ? ` ${s.inputRowFocused}` : ''}${errors.password ? ` ${s.inputRowError}` : ''}`}
                >
                  <Lock
                    size={16}
                    strokeWidth={1.6}
                    className={`${s.fieldIcon}${focused === 'password' ? ` ${s.fieldIconActive}` : ''}`}
                  />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    className={s.input}
                    placeholder={t.auth.password}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                    }}
                    onFocus={() => setFocused('password')}
                    onBlur={() => setFocused(null)}
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
                {errors.password && (
                  <p className={s.fieldError}>
                    <AlertCircle size={12} strokeWidth={2} /> {errors.password}
                  </p>
                )}
              </div>

              {apiError && (
                <div className={s.apiError} role="alert">
                  <AlertCircle size={14} strokeWidth={1.8} className={s.apiErrorIcon} />
                  <p className={s.apiErrorText}>{apiError}</p>
                </div>
              )}

              <button type="submit" className={s.submitButton} disabled={loading}>
                {loading ? (
                  <Loader2 size={16} strokeWidth={1.8} className={s.spinner} />
                ) : (
                  <>
                    {t.auth.login}
                    <ArrowRight size={14} strokeWidth={2} className={s.submitArrow} />
                  </>
                )}
              </button>
            </form>

            <p className={s.helpText}>{t.auth.forgotPassword}</p>
          </div>
        </div>
      </main>

      <div className={s.footer}>
        <span className={s.copyrightText}>{t.auth.copyright}</span>
        <div className={s.langWrap}>
          <button
            type="button"
            className={s.langButton}
            onClick={() => setLangOpen((v) => !v)}
            onBlur={(e) => {
              if (!e.currentTarget.parentElement?.contains(e.relatedTarget as Node)) {
                setLangOpen(false);
              }
            }}
            aria-haspopup="menu"
            aria-expanded={langOpen}
          >
            {currentLang?.flag && (
              <img src={currentLang.flag} alt="" className={s.flagIcon} />
            )}
            <span>{currentLang?.shortLabel}</span>
          </button>
          {langOpen && (
            <div className={s.langDropdown} role="menu">
              {languages.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={l.code === lang}
                  className={`${s.langOption}${l.code === lang ? ` ${s.langOptionActive}` : ''}`}
                  onClick={() => {
                    setLang(l.code as 'uk' | 'en');
                    setLangOpen(false);
                  }}
                >
                  <img src={l.flag} alt="" className={s.flagIcon} />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
