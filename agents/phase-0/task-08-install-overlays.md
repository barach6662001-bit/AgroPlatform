# Task 08 — Install overlay components

## Context
All overlay surfaces: Dialog, AlertDialog, Sheet, DropdownMenu, Popover, Tooltip, HoverCard, Sonner (toast). Sonner replaces AntD's `notification` and `message` APIs entirely.

## Dependencies
- task-06

## Goal
Install all overlays via CLI, mount the Sonner toaster globally, verify z-index stacking works.

## Steps

1. Install:
   ```bash
   npx shadcn@latest add dialog alert-dialog sheet dropdown-menu popover tooltip hover-card sonner
   ```

2. Mount `<Toaster />` at the app root. Find the root component (e.g., `src/App.tsx` or `src/main.tsx`). Add near the top level, outside any Router but inside the shadcn theme provider (added later in task-11):
   ```tsx
   import { Toaster } from '@/components/ui/sonner'
   // ...
   <>
     {/* existing app */}
     <Toaster position="top-right" richColors={false} closeButton />
   </>
   ```
   `richColors={false}` — we use our semantic tokens, not Sonner's defaults.

3. Configure Sonner styling — create `src/components/ui/sonner.tsx` if not perfect, otherwise override in the component. The default shadcn Sonner uses theme from `next-themes`; if we don't have next-themes yet (task-11 installs it), the Sonner component may need a temporary fallback. Accept the shadcn-generated file as-is; we'll revisit in task-11.

4. Extend smoke component with overlay examples:
   ```tsx
   import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
   import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
   import { toast } from 'sonner'

   // ... inside component:
   <div className="flex gap-2">
     <Dialog>
       <DialogTrigger asChild><Button variant="outline">Open dialog</Button></DialogTrigger>
       <DialogContent>
         <DialogHeader><DialogTitle>Dialog</DialogTitle></DialogHeader>
         <p className="text-fg-secondary text-sm">Body content.</p>
       </DialogContent>
     </Dialog>

     <DropdownMenu>
       <DropdownMenuTrigger asChild><Button variant="outline">Menu</Button></DropdownMenuTrigger>
       <DropdownMenuContent>
         <DropdownMenuItem>Edit</DropdownMenuItem>
         <DropdownMenuItem>Duplicate</DropdownMenuItem>
         <DropdownMenuItem className="text-danger">Delete</DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>

     <Button variant="outline" onClick={() => toast.success('Saved', { description: '3 rows updated' })}>
       Toast
     </Button>
   </div>
   ```

## Files
- Created by CLI: `src/components/ui/{dialog,alert-dialog,sheet,dropdown-menu,popover,tooltip,hover-card,sonner}.tsx`
- Modify: app root (mount `<Toaster />`)
- Modify: `src/components/__smoke__/primitives-smoke.tsx`

## Acceptance Criteria
- [ ] All 8 overlay components present
- [ ] `<Toaster />` mounted once at app root
- [ ] Dialog opens, closes on escape and outside click
- [ ] Dropdown menu opens, keyboard arrows navigate
- [ ] Toast fires and auto-dismisses
- [ ] No z-index issues vs existing AntD modals (spot-check if existing screens use AntD Modal)

## Verification Commands
```bash
ls src/components/ui/ | grep -E 'dialog|sheet|dropdown|popover|tooltip|sonner|hover-card'
grep 'Toaster' src/App.tsx src/main.tsx 2>/dev/null
npm run build
```

## Git
```bash
git add src/components/ui/ src/App.tsx src/main.tsx src/components/__smoke__/
git commit -m "feat(design-system): install overlay components + mount sonner toaster

- dialog, alert-dialog, sheet, dropdown-menu, popover, tooltip, hover-card, sonner
- Toaster mounted at app root (top-right)

Task: phase-0/task-08"
git push
```
