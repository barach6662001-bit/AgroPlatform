# Task 01 — Install Tailwind CSS

## Context
Tailwind is the utility foundation for the entire design system. Must be installed before shadcn (shadcn generates Tailwind-based components).

## Dependencies
- task-00

## Goal
Install Tailwind 3.4.x + PostCSS + Autoprefixer + `tailwindcss-animate`. Configure a minimal `tailwind.config.ts` (replaced in task-05). Add base directives.

## Steps

1. In `$FRONTEND`:
   ```bash
   npm install -D tailwindcss@^3.4 postcss autoprefixer tailwindcss-animate
   npx tailwindcss init -p --ts
   ```

2. Edit `tailwind.config.ts` — replace `content` with:
   ```ts
   content: ['./src/**/*.{ts,tsx,js,jsx}', './index.html'],
   ```
   (If Next.js: `'./app/**/*.{ts,tsx}'` and `'./components/**/*.{ts,tsx}'`.)

3. Create `src/styles/index.css` (or append to existing main CSS). Contents:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```
   If a main CSS file already exists (e.g., `src/index.css`, `src/main.css`), add the three `@tailwind` directives at the top. Do not duplicate.

4. Ensure the main CSS is imported in the entry file (`main.tsx` / `index.tsx`):
   ```ts
   import './styles/index.css'
   ```
   (or whatever the existing path is — confirm the import is present).

5. Smoke test — add to any page:
   ```tsx
   <div className="p-4 bg-red-500 text-white">tailwind works</div>
   ```
   Run `npm run dev`, confirm the div is red with padding. Remove the test div before commit.

## Files
- Create: `tailwind.config.ts`, `postcss.config.js`
- Create or modify: `src/styles/index.css`
- Modify: `src/main.tsx` (or entry file) — import if missing

## Acceptance Criteria
- [ ] `tailwindcss`, `postcss`, `autoprefixer`, `tailwindcss-animate` present in `devDependencies`
- [ ] `tailwind.config.ts` exists with `content` pointing at source files
- [ ] `postcss.config.js` exists with tailwind + autoprefixer plugins
- [ ] Main CSS has three `@tailwind` directives
- [ ] Dev server builds without error
- [ ] Red smoke-test div rendered correctly, then removed

## Verification Commands
```bash
cat tailwind.config.ts | grep 'content'
cat postcss.config.js | grep tailwindcss
npm run build   # must succeed
```

## Git
```bash
git add tailwind.config.ts postcss.config.js src/styles/index.css src/main.tsx package.json package-lock.json
git commit -m "feat(design-system): install tailwindcss

Task: phase-0/task-01"
git push
```

## Rollback
`npm uninstall tailwindcss postcss autoprefixer tailwindcss-animate && rm tailwind.config.ts postcss.config.js`
