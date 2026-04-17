# Task 00 — Theme Bridge

**Goal:** Synchronize the existing Zustand `themeStore` with `next-themes` (installed in Phase 0) so the entire app shares one source of truth. No visible change, pure plumbing.

**Depends on:** Phase 0 complete.

---

## Why this task exists

Phase 0 introduced `next-themes` for theme management. The existing app has a `themeStore` (Zustand) that some legacy components still read from. If we leave them as two disconnected stores, user toggles in the new UI won't propagate to AntD components that read from `themeStore`, and vice versa.

We create a one-way bridge: `next-themes` is the master, `themeStore` becomes a read-only mirror. Legacy AntD components continue to read from `themeStore` and get the right value.

---

## Steps

1. Read `frontend/src/store/themeStore.ts` (or whatever the theme store file is — likely `themeStore.ts` under `store/` or `stores/`). Understand its shape:
   - What fields? (likely `theme: 'light' | 'dark'`)
   - What actions? (likely `setTheme`, `toggleTheme`)

2. Create `frontend/src/components/theme-bridge.tsx`:
   ```tsx
   import { useEffect } from 'react'
   import { useTheme } from 'next-themes'
   import { useThemeStore } from '@/store/themeStore'  // adjust import path to match

   /**
    * Bridges next-themes (source of truth) with the legacy Zustand themeStore.
    * Render once at app root, below ThemeProvider but above the router.
    */
   export function ThemeBridge() {
     const { resolvedTheme } = useTheme()
     const setTheme = useThemeStore((s) => s.setTheme)

     useEffect(() => {
       if (resolvedTheme === 'light' || resolvedTheme === 'dark') {
         setTheme(resolvedTheme)
       }
     }, [resolvedTheme, setTheme])

     return null
   }
   ```

   If `themeStore` uses a different action name, adjust. If the store doesn't support direct setting (only toggle), add a `setTheme` action (one-line change).

3. Mount `<ThemeBridge />` in `frontend/src/App.tsx` (or main.tsx, wherever the router is). Place it **inside** the `ThemeProvider` but outside the router:
   ```tsx
   <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
     <ThemeBridge />
     <RouterProvider router={router} />
   </ThemeProvider>
   ```

4. Add a dev-only sanity log to confirm bidirectional sync isn't needed. In `ThemeBridge`:
   ```tsx
   if (import.meta.env.DEV) {
     console.debug('[ThemeBridge]', { resolvedTheme, storedTheme: useThemeStore.getState().theme })
   }
   ```

5. Search for all components that read `themeStore` and verify they still work:
   ```bash
   grep -rn "useThemeStore\|themeStore" frontend/src --include="*.tsx" --include="*.ts" | head -30
   ```

6. Manual check: `npm run dev`, toggle theme via Phase 0 `ThemeToggle` or via preview route `/__design-system`, confirm:
   - `<html class="dark">` applies/removes
   - `themeStore.theme` updates (check in React DevTools or devtools console: `window.__ZUSTAND_DEVTOOLS__` if configured)
   - Any existing AntD screen that styles itself based on `themeStore` also updates

---

## Acceptance criteria

- [ ] `ThemeBridge` component exists and is mounted at app root
- [ ] Toggling theme via next-themes updates `themeStore` state within one render
- [ ] No infinite loop (bridge is one-way only — NOT two-way)
- [ ] AntD legacy screens still reflect the current theme correctly
- [ ] `npm run dev` starts without console errors
- [ ] `npm run build` passes
- [ ] `tsc --noEmit` passes

---

## Verification

```bash
cd frontend
grep -n "ThemeBridge" src/App.tsx src/main.tsx 2>/dev/null
npm run build 2>&1 | tail -20
npx tsc --noEmit 2>&1 | tail -10
```

---

## Git

```bash
git add frontend/src/components/theme-bridge.tsx frontend/src/App.tsx frontend/src/main.tsx frontend/src/store/themeStore.ts 2>/dev/null
git commit -m "feat(shell): bridge next-themes to legacy themeStore

One-way sync: next-themes is source of truth, themeStore mirrors resolvedTheme.
Prevents theme drift between shadcn components (use next-themes) and legacy
AntD components (read themeStore).

Task: wave-1/task-00"
git push
```

Append to `agents/wave-1/_progress.md`.
