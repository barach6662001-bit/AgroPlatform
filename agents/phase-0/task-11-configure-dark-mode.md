# Task 11 — Configure dark mode

## Context
`.dark` class on `<html>` toggles the token set. `next-themes` handles persistence (localStorage + respect `prefers-color-scheme`). Theme switcher lives in the topbar later; for Phase 0 we add a temporary switcher to the preview route.

Since we use Vite + React Router (not Next.js), we use `next-themes` as a library — it works in non-Next apps via the same provider API.

## Dependencies
- task-04, task-08

## Goal
Install `next-themes`, wrap the app in `ThemeProvider`, confirm `.dark` class toggles the token layer correctly.

## Steps

1. Install:
   ```bash
   npm install next-themes
   ```

2. Create `src/components/theme-provider.tsx`:
   ```tsx
   import * as React from 'react'
   import { ThemeProvider as NextThemesProvider, type ThemeProviderProps } from 'next-themes'

   export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
     return <NextThemesProvider {...props}>{children}</NextThemesProvider>
   }
   ```

3. Wrap the app root. In `src/main.tsx` (or `App.tsx`, whichever wraps the router):
   ```tsx
   import { ThemeProvider } from '@/components/theme-provider'
   // ...
   <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
     <App />
   </ThemeProvider>
   ```

4. Create a theme toggle component `src/components/theme-toggle.tsx`:
   ```tsx
   import { Moon, Sun, Monitor } from 'lucide-react'
   import { useTheme } from 'next-themes'
   import { Button } from '@/components/ui/button'
   import {
     DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
   } from '@/components/ui/dropdown-menu'

   export function ThemeToggle() {
     const { setTheme } = useTheme()
     return (
       <DropdownMenu>
         <DropdownMenuTrigger asChild>
           <Button variant="ghost" size="icon" aria-label="Toggle theme">
             <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
             <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
           </Button>
         </DropdownMenuTrigger>
         <DropdownMenuContent align="end">
           <DropdownMenuItem onClick={() => setTheme('light')}>
             <Sun className="mr-2 h-4 w-4" /> Світла
           </DropdownMenuItem>
           <DropdownMenuItem onClick={() => setTheme('dark')}>
             <Moon className="mr-2 h-4 w-4" /> Темна
           </DropdownMenuItem>
           <DropdownMenuItem onClick={() => setTheme('system')}>
             <Monitor className="mr-2 h-4 w-4" /> Системна
           </DropdownMenuItem>
         </DropdownMenuContent>
       </DropdownMenu>
     )
   }
   ```

5. Confirm the `Toaster` from task-08 receives theme — edit `src/components/ui/sonner.tsx` to consume `useTheme` if not already (shadcn's generated Sonner does this for Next.js; confirm it also works with next-themes library variant).

## Files
- Create: `src/components/theme-provider.tsx`, `src/components/theme-toggle.tsx`
- Modify: app root to wrap with `ThemeProvider`
- Modify: `src/components/ui/sonner.tsx` (verify theme binding)

## Acceptance Criteria
- [ ] `next-themes` in dependencies
- [ ] `ThemeProvider` wraps entire app
- [ ] Toggling theme flips `<html class="dark">` / removes it
- [ ] Token values visibly change (background, text, accent) on toggle
- [ ] Theme persists across page reload (localStorage)
- [ ] System preference respected on first load
- [ ] No flash of wrong theme (FART) — `disableTransitionOnChange` enabled

## Verification Commands
```bash
grep 'next-themes' package.json
grep 'ThemeProvider' src/main.tsx src/App.tsx 2>/dev/null
npm run build
```

## Git
```bash
git add src/components/theme-provider.tsx src/components/theme-toggle.tsx src/main.tsx src/App.tsx src/components/ui/sonner.tsx package.json package-lock.json
git commit -m "feat(design-system): dark mode with next-themes

- class-based toggle on html element
- persists to localStorage, respects system preference
- toggle component with light/dark/system options

Task: phase-0/task-11"
git push
```
