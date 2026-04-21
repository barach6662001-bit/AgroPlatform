# Phase 2 — Login premium redesign v2 (sandbox-only)

Base commit: `a820806b7039564ae52a01964a457dfa17310096`

## Changed files
- `frontend/src/pages/Login.tsx` — visual layer rewrite. Form state (`useState` + `validate()`), `onSubmit` (calls `authStore.setAuth` + `navigate`), language picker behaviour, redirect target on `requirePasswordChange`, all `t.auth.*` keys, and the API-error flow are preserved verbatim. Removed the beam / corner-dot / crosshatch / hover-glow stack and the `AnimatePresence` wrapper on the submit; kept a single fade-in `motion.div` on the card.
- `frontend/src/pages/Login.module.css` — full rewrite. Two static blurred radial orbs (green top, blue bottom-right) + faint noise overlay replace the previous animated background. Glass card at 420px / 16px radius / 32×28 padding / soft shadow / `backdrop-filter: blur(12px)`. Uppercase Geist-Mono labels, 38px dark inputs with left Lucide icon and green focus ring, password show/hide toggle on the right. Submit is a full-width gradient button (`#22C55E → #16A34A`) with `ArrowRight`, hover lift, and green glow; loading state shows `Loader2` + "Вхід…". API error alert uses the red token. Mobile (≤480px) collapses the card and shrinks the heading to 26px. `prefers-reduced-motion: reduce` disables decorative motion.

## Files added
None. (No new sub-components were needed under `frontend/src/components/auth/`.)

## Files NOT changed (preserved as on `main`)
- `frontend/src/pages/__tests__/Login.test.tsx`
- `frontend/src/stores/authStore.ts`
- `frontend/src/api/auth.ts`
- `frontend/src/router/*`
- `frontend/src/i18n/uk.ts`, `frontend/src/i18n/en.ts`
- `frontend/src/styles/design-system.css`
- Backend / .NET sources

## Verification
- `npx vitest run src/pages/__tests__/Login.test.tsx` → 3 passed (3).
  - Email placeholder still matches `/email/i` (placeholder = `t.auth.email` = `"Email"`).
  - Password placeholder still matches `/password|пароль/i` (placeholder = `t.auth.password` = `"Пароль"` / `"Password"`).
  - Submit button accessible name still matches `/login|увійти/i` (text = `t.auth.login` = `"Увійти"` / `"Log In"`).
  - `getAllByRole('link')` still returns nothing — the "forgot password" copy is a `<p>`.
- `/login` renders without console errors (only the unrelated React Router v7 future-flag warnings appear).
- Preview screenshots saved under `attached_assets/screenshots/login-v2-*.jpg`.

## Apply on your side
```bash
git apply PHASE_2_DIFF.patch
```

Nothing pushed to GitHub — pull the diff manually as requested.
