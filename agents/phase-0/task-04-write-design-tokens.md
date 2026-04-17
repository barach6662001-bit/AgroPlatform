# Task 04 — Write design tokens to CSS

## Context
These tokens are the **law**. They define every color, radius, shadow, and font size in the product. Do not invent new tokens. Do not adjust values without updating `DESIGN_SYSTEM.md`.

## Dependencies
- task-02 (shadcn init created the target CSS file)
- task-03 (fonts are imported before tokens)

## Goal
Replace the shadcn-generated tokens in the main CSS with the complete token set from `/design-system/tokens.css`.

## Steps

1. Copy the entire contents of `/design-system/tokens.css` (from this repo, relative to root) into `src/styles/tokens.css` inside the frontend.
   ```bash
   cp ../../design-system/tokens.css src/styles/tokens.css
   ```
   (Adjust the relative path to point from `$FRONTEND` to the root-level `design-system/` folder.)

2. Update `src/styles/index.css` to import tokens BEFORE Tailwind but AFTER fonts:
   ```css
   @import './fonts.css';
   @import './tokens.css';

   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

3. The shadcn init may have written `@layer base { :root { ... } }` blocks directly into `index.css`. Remove those — our `tokens.css` is the single source of truth. Keep only the `@import` chain and the three `@tailwind` directives.

4. Verify shadcn aliases are present in `tokens.css` (they are — under `/* SHADCN COMPAT ALIASES */`). These map `--background`, `--foreground`, `--primary`, etc. to our tokens. Do not remove them; shadcn components will break.

5. Run `npm run dev`, open any page, and in devtools inspect `:root` computed styles — confirm custom properties like `--color-bg-base`, `--color-accent-solid`, etc. are defined.

## Files
- Create: `src/styles/tokens.css` (copied from root `/design-system/tokens.css`)
- Modify: `src/styles/index.css`

## Acceptance Criteria
- [ ] `tokens.css` contains all tokens from the reference (spot check: `--color-accent-solid`, `--chart-1`, `--density-row-compact`)
- [ ] `index.css` imports fonts → tokens → Tailwind in that order
- [ ] No duplicate `:root` blocks in the main CSS
- [ ] Shadcn aliases (`--background`, `--primary`, etc.) still resolve
- [ ] Devtools shows all custom properties on `:root`

## Verification Commands
```bash
grep -c '^  --color-' src/styles/tokens.css     # should be ~30+
grep '@import.*tokens' src/styles/index.css
npm run build
```

## Git
```bash
git add src/styles/tokens.css src/styles/index.css
git commit -m "feat(design-system): write core design tokens (colors, typography, radii, elevation)

Task: phase-0/task-04"
git push
```
