# DESIGN-P4: Login Page Redesign

> Reference: `docs/design-system.md` section 5 (Login)
> Depends on: DESIGN-P1 completed
> Scope: Complete visual redesign of Login page. Keep auth logic intact.

---

## Steps

### Step 15: Redesign Login Page

Edit `frontend/src/pages/Login.tsx` and its styles.

**Current state:** Two-column layout. Left side has logo, broken illustration, feature list, stats. Right side has login form. Huge empty space. Green pill button. No demo button.

**New layout: Centered card on full-screen background.**

```
┌─────────────────────── full screen ────────────────────────┐
│                                                            │
│                                                            │
│              ┌────────────── 420px ──────────────┐         │
│              │                                   │         │
│              │    🌾 АгроTex                      │         │
│              │    ПЛАТФОРМА УПРАВЛІННЯ            │         │
│              │                                   │         │
│              │    Увійти в акаунт                 │         │
│              │    Введіть ваші облікові дані      │         │
│              │                                   │         │
│              │    Email                           │         │
│              │    ┌───────────────────────┐       │         │
│              │    │ Email                 │       │         │
│              │    └───────────────────────┘       │         │
│              │    Пароль                          │         │
│              │    ┌───────────────────────┐       │         │
│              │    │ ••••••               👁│       │         │
│              │    └───────────────────────┘       │         │
│              │                                   │         │
│              │    [███████ Увійти ████████]       │         │
│              │                                   │         │
│              │    ──────── або ────────           │         │
│              │                                   │         │
│              │    [ Увійти як Demo →        ]     │         │
│              │                                   │         │
│              │    ─────────────────────           │         │
│              │    350.5 га · 5 од. техніки        │         │
│              │    12+ підприємств                 │         │
│              └───────────────────────────────────┘         │
│                                                            │
│    [UA ▾]                          © 2026 АгроТех          │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Background (full screen behind card):**
```css
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0B1220;
  position: relative;
  overflow: hidden;
}

/* Subtle grid dots pattern */
.login-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

/* Gradient glow behind card */
.login-page::after {
  content: '';
  position: absolute;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(34,197,94,0.06) 0%, transparent 70%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}
```

**Card:**
```css
.login-card {
  width: 420px;
  background: var(--color-card-bg);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  padding: 40px 36px;
  position: relative;
  z-index: 1;
}
```

**Card content (top to bottom):**

1. **Logo:** existing logo component, 28px height, margin-bottom 4px
2. **Brand subtitle:** "ПЛАТФОРМА УПРАВЛІННЯ" — 9px, uppercase, letter-spacing 0.1em, color var(--text-tertiary), margin-bottom 32px
3. **Title:** "Увійти в акаунт" — 20px, font-weight 600, color white, margin-bottom 6px
4. **Subtitle:** "Введіть ваші облікові дані" — 13px, color var(--text-secondary), margin-bottom 28px
5. **Email field:** label "Email" 12px semibold muted, input full width, icon prefix User from Lucide
6. **Password field:** label "Пароль" 12px semibold muted, input full width, icon prefix Lock from Lucide, eye toggle suffix
7. **Gap:** 24px
8. **Submit button:** "Увійти" — full width, primary gradient style, height 40px, font-weight 500
9. **Forgot password:** below button, 12px, color var(--text-secondary), center aligned, margin-top 12px
10. **Divider:** horizontal line with "або" text in center — line color var(--border-default), text 12px var(--text-tertiary), margin 24px 0
11. **Demo button:** "Увійти як Demo →" — full width, ghost/outline style: background transparent, border 1px solid var(--border-strong), color var(--text-secondary), height 40px. Hover: border-color var(--color-primary), color var(--color-primary)
12. **Stats bar:** divider line, then horizontal flex: "350.5 га · 5 од. техніки · 12+ підприємств" — 12px, color var(--text-tertiary), text-align center, margin-top 24px, padding-top 20px, border-top 1px solid var(--border-default)

**Demo button functionality:**
- On click: call the same login function with hardcoded demo credentials (email: `demo@agro.local`, password: `DemoPass1`)
- Show loading spinner on the button while logging in
- These credentials are already public in the README so this is not a security issue

**Language switcher:**
- Position: fixed, bottom-left of page, 16px from edges
- Flag icon + "UA" / "EN", 13px, ghost button style

**Footer:**
- Position: fixed, bottom-right, "© 2026 АгроТех", 12px, var(--text-tertiary)

**Remove:**
- Left panel feature list (Облік полів та врожайності, GPS моніторинг, etc.)
- Left panel illustration/placeholder
- Two-column layout entirely

---

## Verification

1. `npx tsc --noEmit` — pass
2. `npm run build` — pass
3. Login page shows centered card on dark background with grid dots
4. Demo button logs in successfully with demo credentials
5. No two-column layout, no feature list on login page
6. Responsive: card stays centered on mobile, reduces to 90vw width below 480px
