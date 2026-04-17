# Task 10 — Install DatePicker with Ukrainian locale

## Context
AntD's DatePicker has given us locale bugs (American date format). We replace it with `react-day-picker` + `date-fns`, bound to `uk` locale + `dd.MM.yyyy` format. One shared wrapper component used everywhere.

## Dependencies
- task-08 (Popover)

## Goal
Install Calendar + date-fns, build a `DatePicker` and `DateRangePicker` wrapper in `@/components/ui/date-picker.tsx`.

## Steps

1. Install:
   ```bash
   npx shadcn@latest add calendar popover
   npm install date-fns react-day-picker
   ```

2. Create `src/components/ui/date-picker.tsx`:
   ```tsx
   import * as React from 'react'
   import { format } from 'date-fns'
   import { uk } from 'date-fns/locale'
   import { CalendarIcon } from 'lucide-react'
   import { cn } from '@/lib/utils'
   import { Button } from '@/components/ui/button'
   import { Calendar } from '@/components/ui/calendar'
   import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

   interface DatePickerProps {
     value?: Date
     onChange?: (date: Date | undefined) => void
     placeholder?: string
     disabled?: boolean
     className?: string
   }

   export function DatePicker({
     value, onChange, placeholder = 'Виберіть дату', disabled, className,
   }: DatePickerProps) {
     return (
       <Popover>
         <PopoverTrigger asChild>
           <Button
             variant="outline"
             disabled={disabled}
             className={cn(
               'w-full justify-start text-left font-normal',
               !value && 'text-fg-tertiary',
               className,
             )}
           >
             <CalendarIcon className="mr-2 h-4 w-4" />
             {value ? format(value, 'dd.MM.yyyy', { locale: uk }) : placeholder}
           </Button>
         </PopoverTrigger>
         <PopoverContent className="w-auto p-0" align="start">
           <Calendar
             mode="single"
             selected={value}
             onSelect={onChange}
             locale={uk}
             weekStartsOn={1}   // Monday, per Ukrainian convention
             initialFocus
           />
         </PopoverContent>
       </Popover>
     )
   }
   ```

3. Create `src/components/ui/date-range-picker.tsx`:
   ```tsx
   import * as React from 'react'
   import { format } from 'date-fns'
   import { uk } from 'date-fns/locale'
   import { CalendarIcon } from 'lucide-react'
   import type { DateRange } from 'react-day-picker'
   import { cn } from '@/lib/utils'
   import { Button } from '@/components/ui/button'
   import { Calendar } from '@/components/ui/calendar'
   import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

   export function DateRangePicker({
     value, onChange, className,
   }: {
     value?: DateRange
     onChange?: (r: DateRange | undefined) => void
     className?: string
   }) {
     return (
       <Popover>
         <PopoverTrigger asChild>
           <Button
             variant="outline"
             className={cn('w-full justify-start text-left font-normal', !value?.from && 'text-fg-tertiary', className)}
           >
             <CalendarIcon className="mr-2 h-4 w-4" />
             {value?.from ? (
               value.to ? (
                 <>{format(value.from, 'dd.MM.yy', { locale: uk })} – {format(value.to, 'dd.MM.yy', { locale: uk })}</>
               ) : (
                 format(value.from, 'dd.MM.yyyy', { locale: uk })
               )
             ) : 'Виберіть діапазон'}
           </Button>
         </PopoverTrigger>
         <PopoverContent className="w-auto p-0" align="start">
           <Calendar
             mode="range"
             selected={value}
             onSelect={onChange}
             numberOfMonths={2}
             locale={uk}
             weekStartsOn={1}
             initialFocus
           />
         </PopoverContent>
       </Popover>
     )
   }
   ```

4. Add to smoke:
   ```tsx
   import { DatePicker } from '@/components/ui/date-picker'
   // ...
   const [d, setD] = React.useState<Date>()
   <DatePicker value={d} onChange={setD} />
   ```

5. Verify:
   - Calendar opens with Monday as first day
   - Month/weekday names in Ukrainian
   - Selected date renders as `17.04.2026` (not `04/17/2026`)

## Files
- Created by CLI: `src/components/ui/calendar.tsx`
- Create: `src/components/ui/date-picker.tsx`, `src/components/ui/date-range-picker.tsx`
- Modify: `src/components/__smoke__/primitives-smoke.tsx`

## Acceptance Criteria
- [ ] Calendar renders with Ukrainian locale (Січень, Лютий, ...)
- [ ] Weeks start on Monday
- [ ] Format is `dd.MM.yyyy`
- [ ] Range picker selects and displays a range correctly
- [ ] `date-fns` and `react-day-picker` present in dependencies

## Verification Commands
```bash
grep -E 'date-fns|react-day-picker' package.json
grep "locale: uk" src/components/ui/date-picker.tsx
npm run build
```

## Git
```bash
git add src/components/ui/calendar.tsx src/components/ui/date-picker.tsx src/components/ui/date-range-picker.tsx src/components/__smoke__/ package.json package-lock.json
git commit -m "feat(design-system): date picker with Ukrainian locale

- shadcn calendar + react-day-picker + date-fns
- wrapper uses uk locale, Monday start, dd.MM.yyyy format
- single + range variants

Task: phase-0/task-10"
git push
```
