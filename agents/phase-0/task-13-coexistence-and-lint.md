# Task 13 — Coexistence rules + ESLint enforcement

## Context
AntD and shadcn now coexist. Without enforcement, engineers will silently add new AntD code because muscle memory wins over discipline. Lock it down.

## Dependencies
- task-12

## Goal
1. Document coexistence rules in `CONTRIBUTING.md`.
2. Add ESLint rule blocking new AntD imports with an informative error message.
3. Allow-list existing AntD imports via per-file override so the rule doesn't fail CI.

## Steps

1. Update `CONTRIBUTING.md` (create if missing). Add a new section:
   ```md
   ## UI: AntD → shadcn migration (in progress)

   **Status:** Phase 0 complete. Ant Design and shadcn/ui coexist. Migration to shadcn
   proceeds wave-by-wave (see `/design-system/MIGRATION_PLAN.md`).

   ### Rules

   1. **New code: shadcn only.** Do not add new `antd` imports. If you think you need
      to, open a ticket referencing the gap and assign to design-system owner.
   2. **Never mix AntD and shadcn in the same React component.** Z-index, portals,
      and focus rings fight each other. If a screen uses AntD Form, it must not also
      use shadcn Dialog — migrate the whole screen or stay on AntD until the screen
      is the next migration candidate.
   3. **Migrate by route, not by component.** The unit of migration is an entire
      route subtree. Merging a half-migrated screen is not allowed.
   4. **Tokens are law.** All colors, radii, shadows, font sizes come from
      `src/styles/tokens.css`. Do not inline hex values in components.
   5. **Form stack:** react-hook-form + zod + shadcn Form. Validation schemas live
      under `src/domain/validation/`.
   6. **Date format:** always `dd.MM.yyyy`, Ukrainian locale. Use
      `<DatePicker />` from `@/components/ui/date-picker`.
   7. **Numbers:** always `Intl.NumberFormat('uk-UA')` + `font-mono tabular-nums` in
      tables.
   8. **Toasts:** `toast.success/error/info` from sonner. Do not import AntD
      `message` or `notification` in new code.

   ### Preview route

   `/__design-system` renders every primitive. Treat it as the acceptance test for
   any DS change.

   ### Design system docs

   - `/design-system/DESIGN_SYSTEM.md` — visual decisions, anti-patterns
   - `/design-system/MIGRATION_PLAN.md` — strategy, component mapping, risk register
   - `/design-system/tokens.css` — canonical token values
   ```

2. Configure ESLint. Install if not present:
   ```bash
   # most projects already have eslint. Check first.
   npm ls eslint
   ```

3. Edit `.eslintrc.cjs` or `.eslintrc.json` (whichever exists). Add:
   ```js
   rules: {
     'no-restricted-imports': ['error', {
       paths: [{
         name: 'antd',
         message: 'Ant Design is deprecated — use @/components/ui/* (shadcn). See CONTRIBUTING.md §UI.',
       }, {
         name: '@ant-design/icons',
         message: 'Use lucide-react for icons.',
       }],
       patterns: [{
         group: ['antd/*'],
         message: 'AntD subpath imports are deprecated.',
       }],
     }],
   },
   ```

4. Generate an override list for existing AntD imports so CI doesn't fail on legacy code. Run:
   ```bash
   git grep -l "from 'antd'" -- 'src/**/*.{ts,tsx}' > .eslint-antd-allowlist.txt
   git grep -l 'from "@ant-design/icons"' -- 'src/**/*.{ts,tsx}' >> .eslint-antd-allowlist.txt
   ```

5. Add an override in `.eslintrc.cjs` that disables the rule only for files in the allowlist:
   ```js
   const fs = require('fs')
   const legacyAntd = fs.existsSync('.eslint-antd-allowlist.txt')
     ? fs.readFileSync('.eslint-antd-allowlist.txt', 'utf8').split('\n').filter(Boolean)
     : []

   module.exports = {
     // ...existing config
     overrides: [
       {
         files: legacyAntd,
         rules: { 'no-restricted-imports': 'off' },
       },
     ],
   }
   ```

   As screens migrate, the engineer removes the migrated file from the allowlist — enforcing a monotonically decreasing AntD footprint.

6. Verify the rule fires on new code. Create a throwaway test file:
   ```bash
   echo "import { Button } from 'antd'" > src/__test__/antd-import-test.tsx
   npx eslint src/__test__/antd-import-test.tsx
   ```
   Expected: error with the deprecation message. Then delete the file:
   ```bash
   rm src/__test__/antd-import-test.tsx
   ```

7. Verify existing AntD imports are still allowed:
   ```bash
   npx eslint src/ 2>&1 | grep 'no-restricted-imports' | head
   ```
   Expected: output empty (all legacy files are on the allowlist).

## Files
- Create or modify: `CONTRIBUTING.md`
- Modify: `.eslintrc.cjs` (or equivalent)
- Create: `.eslint-antd-allowlist.txt`

## Acceptance Criteria
- [ ] `CONTRIBUTING.md` contains the UI migration section
- [ ] ESLint rule blocks new `antd` imports
- [ ] Allowlist generated from current legacy footprint
- [ ] CI passes on the current codebase (`npm run lint`)
- [ ] Adding a new `antd` import to a new file fails lint with informative message

## Verification Commands
```bash
npm run lint
cat .eslint-antd-allowlist.txt | wc -l   # number of legacy files, expect > 0
```

## Git
```bash
git add CONTRIBUTING.md .eslintrc.cjs .eslint-antd-allowlist.txt
git commit -m "chore(design-system): enforce no-new-antd rule via eslint + docs

- CONTRIBUTING.md: UI migration rules
- ESLint: no-restricted-imports blocks new antd, allowlist for legacy
- allowlist shrinks monotonically as screens migrate

Task: phase-0/task-13"
git push
```
