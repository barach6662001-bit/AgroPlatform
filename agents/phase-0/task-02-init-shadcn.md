# Task 02 — Initialise shadcn/ui

## Context
shadcn is installed via its CLI. We use the `new-york` style (denser, better match for Palantir aesthetic — `default` style has more padding/radius). We bind it to our token file, which we will fill in task-04.

## Dependencies
- task-00, task-01

## Goal
Run `shadcn init`, configure with `new-york` style, zinc base color, CSS variables enabled. Confirm the CLI is wired.

## Steps

1. In `$FRONTEND`, initialise:
   ```bash
   npx shadcn@latest init
   ```
   Answers:
   - Style: **New York**
   - Base color: **Zinc**
   - CSS variables: **Yes**
   - Import alias components: **@/components**
   - Import alias utils: **@/lib/utils**

2. If the project does not have `@/*` path aliases yet, the CLI may fail. If so, first add to `tsconfig.json`:
   ```json
   "compilerOptions": {
     "baseUrl": ".",
     "paths": { "@/*": ["./src/*"] }
   }
   ```
   And to `vite.config.ts`:
   ```ts
   import path from 'path'
   // inside defineConfig:
   resolve: { alias: { '@': path.resolve(__dirname, './src') } }
   ```
   Then rerun `shadcn init`.

3. The CLI creates:
   - `components.json`
   - `src/lib/utils.ts` (cn helper)
   - Updates `tailwind.config.ts` and main CSS with tokens (we will overwrite with our own in task-04/05)

4. Verify:
   ```bash
   cat components.json
   ```
   Should show `"style": "new-york"`, `"cssVariables": true`.

5. Install `lucide-react` explicitly (shadcn new-york uses it):
   ```bash
   npm install lucide-react
   ```

## Files
- Create: `components.json`, `src/lib/utils.ts`
- Modify: `tsconfig.json`, `vite.config.ts` (if aliases missing)

## Acceptance Criteria
- [ ] `components.json` exists with `"style": "new-york"` and `"cssVariables": true`
- [ ] `src/lib/utils.ts` exports `cn`
- [ ] `@/*` alias resolves in both TS and Vite
- [ ] `lucide-react` installed
- [ ] Dev server still builds

## Verification Commands
```bash
grep '"style"' components.json
grep 'cn' src/lib/utils.ts
npm run build
```

## Git
```bash
git add components.json src/lib/ tsconfig.json vite.config.ts tailwind.config.ts package.json package-lock.json
# (plus the main CSS file shadcn touched)
git commit -m "feat(design-system): initialise shadcn/ui (new-york, zinc, css-vars)

Task: phase-0/task-02"
git push
```
