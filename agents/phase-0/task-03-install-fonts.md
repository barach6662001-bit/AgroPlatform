# Task 03 — Install IBM Plex fonts (self-hosted)

## Context
Self-hosted via `@fontsource`, not Google CDN (GDPR + deterministic bundle). IBM Plex is the Palantir-grade font — it gives characterful data-density that Inter does not.

## Dependencies
- task-01

## Goal
Install IBM Plex Sans (400/500/600/700) and IBM Plex Mono (400/500). Import CSS into the entry file. Verify the font is applied via devtools.

## Steps

1. Install:
   ```bash
   npm install @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono
   ```

2. Create `src/styles/fonts.css`:
   ```css
   /* Sans */
   @import '@fontsource/ibm-plex-sans/400.css';
   @import '@fontsource/ibm-plex-sans/500.css';
   @import '@fontsource/ibm-plex-sans/600.css';
   @import '@fontsource/ibm-plex-sans/700.css';
   /* Mono */
   @import '@fontsource/ibm-plex-mono/400.css';
   @import '@fontsource/ibm-plex-mono/500.css';
   ```

3. In `src/styles/index.css`, import fonts BEFORE the `@tailwind` directives:
   ```css
   @import './fonts.css';

   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. Smoke test — inspect any element in devtools after `npm run dev`, confirm `font-family` includes `"IBM Plex Sans"`. If not, font has not loaded — check the import chain.

## Files
- Create: `src/styles/fonts.css`
- Modify: `src/styles/index.css`

## Acceptance Criteria
- [ ] Both `@fontsource/ibm-plex-sans` and `@fontsource/ibm-plex-mono` in dependencies
- [ ] `fonts.css` imports 6 weight/style files
- [ ] `index.css` imports `fonts.css` before Tailwind
- [ ] Rendered page uses IBM Plex (verify in devtools or via screenshot)
- [ ] No font-flash-of-unstyled-text visible on reload (fonts preload)

## Verification Commands
```bash
grep '@fontsource/ibm-plex' package.json
cat src/styles/fonts.css
npm run build
```

## Git
```bash
git add src/styles/fonts.css src/styles/index.css package.json package-lock.json
git commit -m "feat(design-system): self-host ibm plex sans and mono

Task: phase-0/task-03"
git push
```
