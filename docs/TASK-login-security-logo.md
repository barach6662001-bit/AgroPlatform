# TASK: Login Page Cleanup + Demo Security + Logo Redesign

> Execute all 3 sections sequentially. Commit after each.
> Do not ask for confirmation.

---

## Section 1: Redesign Login Page — Clean Centered Card

The current login page still uses a two-column layout with a left panel full of fake marketing metrics ("50 000+ га", "GPS real-time", "12+ підприємств", "200K+ гектарів"). This is meaningless filler data that hurts credibility. The page needs to become a clean, centered login card.

### Changes to `frontend/src/pages/Login.tsx`:

1. **Remove the entire left panel** — delete everything inside `{/* Left side — branding */}`: the hero section, decorative gradient, hero illustration SVG, feature list (`featureFieldManagement`, `featureGpsMonitoring`, etc.), social proof metrics ("12+", "200K+"), and the copyright text.

2. **Remove the two-column grid layout** — delete the `<style>` block with `grid-template-columns: 1fr 420px`. Replace the outer container with a full-screen centered layout.

3. **New layout structure:**

```tsx
<div className={s.loginPage}>
  <div className={s.loginCard}>
    {/* Logo */}
    <Logo size={28} variant="full" />
    
    {/* Title */}
    <h3>{t.auth.loginTitle}</h3>
    <p>{t.auth.loginSubtitle}</p>
    
    {/* Form: email + password + submit */}
    <Form ...>
      ...existing form fields...
      <Button type="primary" htmlType="submit" block>
        {t.auth.login}
      </Button>
    </Form>
    
    {/* Forgot password */}
    <div>{t.auth.forgotPassword}</div>
  </div>
  
  {/* Language switcher — bottom left corner */}
  <div className={s.langCorner}>
    <Dropdown ...>...</Dropdown>
  </div>
  
  {/* Copyright — bottom right corner */}
  <div className={s.copyrightCorner}>
    {t.auth.copyright}
  </div>
</div>
```

4. **CSS for new layout** (update `Login.module.css`):

```css
.loginPage {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-page-bg, #0B1220);
  position: relative;
}

/* Subtle grid dot pattern background */
.loginPage::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 24px 24px;
  pointer-events: none;
}

.loginCard {
  width: 420px;
  max-width: 90vw;
  background: var(--color-card-bg, #0F1629);
  border: 1px solid rgba(255,255,255,0.06);
  border-radius: 16px;
  padding: 40px 36px;
  position: relative;
  z-index: 1;
}

.langCorner {
  position: fixed;
  bottom: 16px;
  left: 16px;
}

.copyrightCorner {
  position: fixed;
  bottom: 16px;
  right: 16px;
  font-size: 12px;
  color: rgba(255,255,255,0.35);
}
```

5. **Remove** the `features` array, the `heroSection`, `heroGradient`, `heroIllustration`, `featureList`, `featureItem`, `socialProof`, `proofMetric` — all the marketing fluff from both TSX and CSS module.

6. **Remove** the stats bar "350.5 га · 5 од. техніки · 12+ підприємств" if it exists in the new version.

7. **Do NOT add a demo button.** The demo button is a security risk (see Section 2).

### Verification:
```bash
cd frontend && npx tsc --noEmit && npm run build
git add -A && git commit -m "feat(ui): clean login page — centered card, remove marketing filler"
```

---

## Section 2: Remove Demo Access from Production

The demo button and public demo credentials are a security risk. Anyone can enter the system, see all data structures, API patterns, and reverse-engineer the product.

### Changes:

1. **Remove the demo button** from Login page if it was added. Search for "Demo" in `Login.tsx` and delete any demo login button or function.

2. **Remove demo credentials from README.md** — find and delete the section with:
   - `demo@agro.local`
   - `DemoPass1`
   - `aaaaaaaa-0000-0000-0000-000000000001`
   
   Replace with: "Для отримання демо-доступу зверніться: demo@agrotech-usa.com"

3. **Add environment-based demo toggle** — create a check so demo access only works in development:

   In `frontend/.env.development` add:
   ```
   VITE_DEMO_ENABLED=true
   ```

   In `frontend/.env.production` add (or ensure NOT present):
   ```
   VITE_DEMO_ENABLED=false
   ```

   If anyone in the future wants to re-add a demo button, they should check:
   ```tsx
   const isDemoEnabled = import.meta.env.VITE_DEMO_ENABLED === 'true';
   ```

4. **Do NOT remove the demo seed data from backend** — it's needed for local development. Only hide the entry point on the frontend.

### Verification:
```bash
cd frontend && npx tsc --noEmit && npm run build
git add -A && git commit -m "security: remove public demo access, hide credentials from README"
```

---

## Section 3: Redesign Logo

The current logo is a generic green leaf SVG with data dots — it looks like a free template icon from 2015.

### New logo concept: **Geometric grain/wheat kernel + data grid**

Replace the SVG in `frontend/src/components/Logo.tsx` `LogoIcon` function:

```tsx
function LogoIcon({ size }: { size: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      fill="none"
      width={size}
      height={size}
      style={{ display: 'block' }}
    >
      {/* Background — dark rounded square */}
      <rect width="32" height="32" rx="8" fill="var(--brand, #22C55E)" />
      
      {/* Stylized "A" letterform — represents both Agriculture and Analytics */}
      <path
        d="M16 6L8 26h4l1.5-5h5L20 26h4L16 6zm-1.2 12L16 12.5 17.2 18h-2.4z"
        fill="white"
        opacity="0.95"
      />
      
      {/* Three horizontal data lines — subtle tech reference */}
      <line x1="10" y1="28" x2="14" y2="28" stroke="white" strokeWidth="1" opacity="0.3" strokeLinecap="round" />
      <line x1="16" y1="28" x2="18" y2="28" stroke="white" strokeWidth="1" opacity="0.2" strokeLinecap="round" />
      <line x1="20" y1="28" x2="22" y2="28" stroke="white" strokeWidth="1" opacity="0.15" strokeLinecap="round" />
    </svg>
  );
}
```

**Key design decisions:**
- Green square with white "A" — bold, clean, scales to any size
- The "A" is for Agro / Agriculture / Analytics — triple meaning
- Three subtle data lines at the bottom hint at tech/data platform
- No leaves, no generic nature symbols
- Works on both dark and light backgrounds
- Recognizable at 16px favicon size

### Also update `frontend/public/favicon.svg`:

Replace with the same SVG (adjusted for favicon viewBox):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
  <rect width="32" height="32" rx="8" fill="#22C55E" />
  <path d="M16 6L8 26h4l1.5-5h5L20 26h4L16 6zm-1.2 12L16 12.5 17.2 18h-2.4z" fill="white" opacity="0.95" />
</svg>
```

### Verification:
```bash
cd frontend && npx tsc --noEmit && npm run build
git add -A && git commit -m "feat(ui): new logo — geometric A mark, replace leaf icon"
```

---

## Final

```bash
git log --oneline -3
git push
```
