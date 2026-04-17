# Task 05 — Wire Tailwind to tokens

## Context
Replace the shadcn-generated `tailwind.config.ts` with our production config that consumes every CSS variable. This is what lets us write `bg-bg-muted`, `text-fg-secondary`, `border-border-subtle`, `text-accent-solid`, etc.

## Dependencies
- task-04

## Goal
Drop in the production `tailwind.config.ts`, keep `content` paths correct for this repo, verify utility classes compile.

## Steps

1. Copy `/design-system/tailwind.config.ts` into `$FRONTEND/tailwind.config.ts`, replacing the existing file:
   ```bash
   cp ../../design-system/tailwind.config.ts tailwind.config.ts
   ```
   (Adjust relative path.)

2. Review `content` array in the new config:
   ```ts
   content: ['./src/**/*.{ts,tsx,js,jsx}', './index.html']
   ```
   If Next.js, change to `['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}']`. If custom paths, adapt accordingly.

3. Restart dev server:
   ```bash
   npm run dev
   ```

4. Smoke test — add to any page:
   ```tsx
   <div className="bg-bg-muted text-fg-primary border border-border-subtle rounded p-4">
     <span className="text-accent-solid font-semibold">Accent</span>
     <code className="font-mono text-sm tabular-nums">1,234.56 ₴</code>
   </div>
   ```
   Expected: muted grey background, subtle border, deep emerald "Accent" text, monospaced number. Remove the test block before commit.

5. Compile check — confirm no Tailwind warnings about unknown classes:
   ```bash
   npm run build 2>&1 | grep -i 'warn\|error' | grep -v 'tailwindcss-animate'
   ```
   Empty output = clean.

## Files
- Modify: `tailwind.config.ts` (full replacement)

## Acceptance Criteria
- [ ] `tailwind.config.ts` matches the reference file structure
- [ ] `content` paths correct for this frontend
- [ ] Utility classes `bg-bg-muted`, `text-fg-primary`, `text-accent-solid`, `border-border-subtle`, `rounded`, `font-mono` all compile and render
- [ ] `npm run build` passes with no new warnings
- [ ] `tailwindcss-animate` plugin loaded (required for shadcn animations)

## Verification Commands
```bash
grep "'accent'" tailwind.config.ts
grep 'tailwindcss-animate' tailwind.config.ts
npm run build
```

## Git
```bash
git add tailwind.config.ts
git commit -m "feat(design-system): wire tailwind config to token system

Task: phase-0/task-05"
git push
```
