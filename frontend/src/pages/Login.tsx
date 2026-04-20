import { useState, useRef, useCallback, type FormEvent, type MouseEvent } from 'react';
import { Eye, EyeOff, AlertCircle, Loader2, Mail, Lock, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { login } from '../api/auth';
import { useTranslation, languages } from '../i18n';
import logoUrl from '../assets/brand/logo-a-mark.svg?url';
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
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const passwordRef = useRef<HTMLInputElement>(null);
  const submitRef = useRef<HTMLButtonElement>(null);

  /* 3D tilt */
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], [-8, 8]);

  const handleCardMouse = useCallback((e: MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  }, [mouseX, mouseY]);

  const handleCardLeave = useCallback(() => {
    mouseX.set(0);
    mouseY.set(0);
  }, [mouseX, mouseY]);

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

  const currentLang = languages.find(l => l.code === lang);

  return (
    <div className={s.loginPage}>
      {/* Background gradient */}
      <div className={s.bgGradient} />
      {/* Noise texture */}
      <div className={s.noiseOverlay} />
      {/* Top radial glow */}
      <div className={s.topGlow} />
      <div className={s.topGlowPulse} />
      {/* Ambient spots */}
      <div className={s.ambientLeft} />
      <div className={s.ambientRight} />

      {/* 3D tilt card wrapper */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className={s.cardPerspective}
      >
        <motion.div
          className={s.cardTilt}
          style={{ rotateX, rotateY }}
          onMouseMove={handleCardMouse}
          onMouseLeave={handleCardLeave}
        >
          <div className={s.cardGroup}>
            {/* Glow on hover */}
            <div className={s.cardGlow} />

            {/* Traveling light beams */}
            <div className={s.beamContainer}>
              <div className={`${s.beam} ${s.beamTop}`} />
              <div className={`${s.beam} ${s.beamRight}`} />
              <div className={`${s.beam} ${s.beamBottom}`} />
              <div className={`${s.beam} ${s.beamLeft}`} />
              {/* Corner glow dots */}
              <div className={`${s.cornerDot} ${s.cornerTL}`} />
              <div className={`${s.cornerDot} ${s.cornerTR}`} />
              <div className={`${s.cornerDot} ${s.cornerBR}`} />
              <div className={`${s.cornerDot} ${s.cornerBL}`} />
            </div>

            {/* Border glow on hover */}
            <div className={s.borderGlow} />

            {/* Glass card */}
            <div className={s.loginCard}>
              {/* Inner crosshatch pattern */}
              <div className={s.cardPattern} />

              {/* Logo + header */}
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
                  {t.auth.loginTitle}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={s.formSubtitle}
                >
                  {t.auth.loginSubtitle}
                </motion.p>
              </div>

              {/* Form */}
              <form className={s.form} onSubmit={onSubmit} noValidate>
                {/* Email */}
                <div className={s.fieldGroup}>
                  <div className={`${s.inputRow}${focusedInput === 'email' ? ` ${s.inputRowFocused}` : ''}`}>
                    <Mail size={16} strokeWidth={1.5} className={`${s.fieldIcon}${focusedInput === 'email' ? ` ${s.fieldIconActive}` : ''}`} />
                    <input
                      id="login-email"
                      type="email"
                      className={`${s.input}${errors.email ? ` ${s.inputError}` : ''}`}
                      placeholder={t.auth.email}
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors(prev => ({ ...prev, email: undefined })); }}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      autoComplete="email"
                    />
                  </div>
                  {errors.email && <p className={s.fieldError}>{errors.email}</p>}
                </div>

                {/* Password */}
                <div className={s.fieldGroup}>
                  <div className={`${s.inputRow}${focusedInput === 'password' ? ` ${s.inputRowFocused}` : ''}`}>
                    <Lock size={16} strokeWidth={1.5} className={`${s.fieldIcon}${focusedInput === 'password' ? ` ${s.fieldIconActive}` : ''}`} />
                    <input
                      id="login-password"
                      ref={passwordRef}
                      type={showPassword ? 'text' : 'password'}
                      className={`${s.input} ${s.inputWithIcon}${errors.password ? ` ${s.inputError}` : ''}`}
                      placeholder={t.auth.password}
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors(prev => ({ ...prev, password: undefined })); }}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className={s.passwordToggle}
                      onClick={() => setShowPassword(v => !v)}
                      tabIndex={0}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword
                        ? <EyeOff size={16} strokeWidth={1.5} />
                        : <Eye size={16} strokeWidth={1.5} />
                      }
                    </button>
                  </div>
                  {errors.password && <p className={s.fieldError}>{errors.password}</p>}
                </div>

                {/* API error */}
                {apiError && (
                  <div className={s.apiError}>
                    <AlertCircle size={14} strokeWidth={1.5} className={s.apiErrorIcon} />
                    <p className={s.apiErrorText}>{apiError}</p>
                  </div>
                )}

                {/* Submit */}
                <motion.button
                  ref={submitRef}
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
                          {t.auth.login}
                          <ArrowRight size={14} strokeWidth={1.5} className={s.submitArrow} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>
              </form>

              {/* Help text */}
              <p className={s.helpText}>{t.auth.forgotPassword}</p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer: lang switcher + copyright */}
      <div className={s.footer}>
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            className={s.langButton}
            onClick={() => setLangOpen(v => !v)}
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
              {languages.map(l => (
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
