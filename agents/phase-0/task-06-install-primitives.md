# Task 06 — Install core primitives

## Context
These are the workhorses: Button, Input, Label, Card, Badge, Separator, Skeleton. Used on every screen.

## Dependencies
- task-05

## Goal
Install via shadcn CLI. Verify each imports from `@/components/ui/*` and renders without crash.

## Steps

1. Install in one batch:
   ```bash
   npx shadcn@latest add button input label card badge separator skeleton avatar
   ```
   (If the MCP `shadcn MCP` is active, you can also trigger this via natural language — same outcome.)

2. Review each generated file in `src/components/ui/`. Confirm:
   - They use `cn` from `@/lib/utils`
   - They reference our shadcn alias tokens (`bg-primary`, `text-primary-foreground`, etc.)

3. Add a Button variant tailored for AgroPlatform primary actions. Edit `src/components/ui/button.tsx` — ensure the `default` variant is:
   ```ts
   default: 'bg-accent-solid text-accent-fg hover:bg-accent-strong shadow-flat'
   ```
   (Keeps our design-system token names instead of raw `bg-primary` for future clarity. `bg-primary` also works since it aliases.)

4. Smoke test — create `src/components/__smoke__/primitives-smoke.tsx`:
   ```tsx
   import { Button } from '@/components/ui/button'
   import { Input } from '@/components/ui/input'
   import { Label } from '@/components/ui/label'
   import { Badge } from '@/components/ui/badge'
   import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
   import { Separator } from '@/components/ui/separator'

   export function PrimitivesSmoke() {
     return (
       <Card className="p-4 max-w-md">
         <CardHeader><CardTitle>Smoke test</CardTitle></CardHeader>
         <CardContent className="space-y-3">
           <div className="space-y-1.5">
             <Label htmlFor="smoke">Label</Label>
             <Input id="smoke" placeholder="type something" />
           </div>
           <Separator />
           <div className="flex gap-2">
             <Button>Primary</Button>
             <Button variant="secondary">Secondary</Button>
             <Button variant="outline">Outline</Button>
             <Button variant="ghost">Ghost</Button>
             <Button variant="destructive">Destructive</Button>
           </div>
           <div className="flex gap-2">
             <Badge>default</Badge>
             <Badge variant="secondary">secondary</Badge>
             <Badge variant="outline">outline</Badge>
           </div>
         </CardContent>
       </Card>
     )
   }
   ```
   This file stays — task-12 imports it into the preview route.

## Files
- Created by CLI: `src/components/ui/{button,input,label,card,badge,separator,skeleton,avatar}.tsx`
- Create: `src/components/__smoke__/primitives-smoke.tsx`
- Modify: `src/components/ui/button.tsx` (align default variant with token names)

## Acceptance Criteria
- [ ] All 8 primitives exist under `src/components/ui/`
- [ ] Each exports correctly named components
- [ ] Smoke component renders without error
- [ ] Button primary uses deep emerald (visual check)
- [ ] Keyboard focus ring visible and matches `--color-accent-solid`

## Verification Commands
```bash
ls src/components/ui/ | sort
npm run build
```

## Git
```bash
git add src/components/ui/ src/components/__smoke__/
git commit -m "feat(design-system): install core primitives (button, input, card, badge, skeleton, separator, label, avatar)

Task: phase-0/task-06"
git push
```
