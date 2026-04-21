import { useState, type FormEvent } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2, Loader2, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { changePassword } from '../api/auth';
import { useTranslation, languages } from '../i18n';
import logoUrl from '../assets/brand/logo-a-mark.svg?url';
import s from './Login.module.css';
import cs from './ChangePassword.module.css';

type FieldKey = 'currentPassword' | 'newPassword' | 'confirmPassword';

export default function ChangePassword() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);
  const email = useAuthStore((s) => s.email);
  const { t, lang, setLang } = useTranslation();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [show, setShow] = useState<Record<FieldKey, boolean>>({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false,
  });
  const [focusedInput, setFocusedInput] = useState<FieldKey | null>(null);
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [langOpen, setLangOpen] = useState(false);

  const validate = () => {
    const next: Partial<Record<FieldKey, string>> = {};
    if (!currentPassword) next.currentPassword = t.auth.enterCurrentPassword;
    if (!newPassword) next.newPassword = t.auth.enterNewPassword;
    else if (newPassword.length < 8) next.newPassword = t.auth.minPassword;
    else if (!/[0-9]/.test(newPassword)) next.newPassword = t.auth.passwordNeedsDigit;
    else if (!/[a-z]/.test(newPassword)) next.newPassword = t.auth.passwordNeedsLower;
    if (!confirmPassword) next.confirmPassword = t.auth.enterConfirmPassword;
    else if (confirmPassword !== newPassword) next.confirmPassword = t.auth.passwordsDoNotMatch;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccess('');
    if (!validate()) return;
    setLoading(true);
    try {
      const data = await changePassword({ currentPassword, newPassword });
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
      setSuccess(t.auth.passwordChanged);
      setTimeout(() => navigate('/dashboard'), 600);
    } catch {
      setApiError(t.auth.passwordChangeError);
    } finally {
      setLoading(false);
    }
  };

  const currentLang = languages.find((l) => l.code === lang);

  const renderPasswordField = (
    key: FieldKey,
    placeholder: string,
    autoComplete: string,
    value: string,
    setValue: (v: string) => void,
  ) => (
    <div className={s.fieldGroup}>
      <div className={`${s.inputRow}${focusedInput === key ? ` ${s.inputRowFocused}` : ''}`}>
        <Lock
          size={16}
          strokeWidth={1.5}
          className={`${s.fieldIcon}${focusedInput === key ? ` ${s.fieldIconActive}` : ''}`}
        />
        <input
          id={`cp-${key}`}
          type={show[key] ? 'text' : 'password'}
          className={`${s.input} ${s.inputWithIcon}${errors[key] ? ` ${s.inputError}` : ''}`}
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
          }}
          onFocus={() => setFocusedInput(key)}
          onBlur={() => setFocusedInput(null)}
          autoComplete={autoComplete}
        />
        <button
          type="button"
          className={s.passwordToggle}
          onClick={() => setShow((v) => ({ ...v, [key]: !v[key] }))}
          tabIndex={0}
          aria-label={show[key] ? 'Hide password' : 'Show password'}
        >
          {show[key]
            ? <EyeOff size={16} strokeWidth={1.5} />
            : <Eye size={16} strokeWidth={1.5} />}
        </button>
      </div>
      {errors[key] && <p className={s.fieldError}>{errors[key]}</p>}
    </div>
  );

  return (
    <div className={s.loginPage}>
      <div className={s.bgGradient} />
      <div className={s.noiseOverlay} />
      <div className={s.topGlow} />
      <div className={s.topGlowPulse} />
      <div className={s.ambientLeft} />
      <div className={s.ambientRight} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={s.cardPerspective}
      >
        <div className={s.cardGroup}>
          <div className={s.cardGlow} />

          <div className={s.beamContainer}>
            <div className={`${s.beam} ${s.beamTop}`} />
            <div className={`${s.beam} ${s.beamRight}`} />
            <div className={`${s.beam} ${s.beamBottom}`} />
            <div className={`${s.beam} ${s.beamLeft}`} />
            <div className={`${s.cornerDot} ${s.cornerTL}`} />
            <div className={`${s.cornerDot} ${s.cornerTR}`} />
            <div className={`${s.cornerDot} ${s.cornerBR}`} />
            <div className={`${s.cornerDot} ${s.cornerBL}`} />
          </div>

          <div className={s.borderGlow} />

          <div className={s.loginCard}>
            <div className={s.cardPattern} />

            <div className={s.header}>
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', duration: 0.8 }}
                className={s.logoCircle}
              >
                <img src={logoUrl} alt="" className={s.logo} width={28} height={28} />
                <div className={s.logoShine} />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className={s.formTitle}
              >
                {t.auth.changePasswordTitle}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className={s.formSubtitle}
              >
                {t.auth.changePasswordSubtitle}
              </motion.p>
              {email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.35 }}
                  className={`${s.helpText} ${cs.emailRow}`}
                >
                  {email}
                </motion.p>
              )}
            </div>

            <form className={s.form} onSubmit={onSubmit} noValidate>
              {renderPasswordField(
                'currentPassword',
                t.auth.currentPassword,
                'current-password',
                currentPassword,
                setCurrentPassword,
              )}
              {renderPasswordField(
                'newPassword',
                t.auth.newPassword,
                'new-password',
                newPassword,
                setNewPassword,
              )}
              {renderPasswordField(
                'confirmPassword',
                t.auth.confirmPassword,
                'new-password',
                confirmPassword,
                setConfirmPassword,
              )}

              <p className={cs.passwordHint}>{t.auth.passwordHint}</p>

              {apiError && (
                <div className={s.apiError}>
                  <AlertCircle size={14} strokeWidth={1.5} className={s.apiErrorIcon} />
                  <p className={s.apiErrorText}>{apiError}</p>
                </div>
              )}

              {success && (
                <div className={cs.successAlert}>
                  <CheckCircle2 size={14} strokeWidth={1.5} className={cs.successIcon} />
                  <p className={cs.successText}>{success}</p>
                </div>
              )}

              <motion.button
                type="submit"
                className={s.submitButton}
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className={s.submitInner}>
                  {loading && <div className={s.submitShimmer} />}
                  <AnimatePresence mode="wait">
                    {loading ? (
                      <motion.span
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={s.submitContent}
                      >
                        <Loader2 size={16} strokeWidth={1.5} className={s.spinner} />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className={s.submitContent}
                      >
                        {t.auth.changePasswordButton}
                        <ArrowRight size={14} strokeWidth={1.5} className={s.submitArrow} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </motion.button>
            </form>
          </div>
        </div>
      </motion.div>

      <div className={s.footer}>
        <div className={cs.langWrap}>
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
                  onClick={() => { setLang(l.code as 'uk' | 'en'); setLangOpen(false); }}
                >
                  <img src={l.flag} alt={l.shortLabel} className={s.flagIcon} />
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <span className={s.copyrightText}>{t.auth.copyright}</span>
      </div>
    </div>
  );
}
