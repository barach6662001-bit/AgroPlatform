# Task 09 — Install form components + react-hook-form + zod

## Context
The form stack: `react-hook-form` for state, `zod` for validation, `@hookform/resolvers/zod` to bridge them, shadcn's `Form` component for layout. This is the replacement for AntD's `Form` + `Form.Item` + built-in validators.

## Dependencies
- task-06

## Goal
Install form primitives and validation libs. Build one example form in the smoke component to verify the stack works end to end.

## Steps

1. Install shadcn form primitives:
   ```bash
   npx shadcn@latest add form checkbox radio-group switch select textarea
   ```

2. Install validation:
   ```bash
   npm install react-hook-form zod @hookform/resolvers
   ```

3. Create a shared form patterns folder with one example schema — `src/domain/validation/example.schema.ts`:
   ```ts
   import { z } from 'zod'

   export const exampleSchema = z.object({
     name: z.string().min(2, 'At least 2 characters'),
     email: z.string().email('Invalid email'),
     role: z.enum(['admin', 'manager', 'operator']),
     notify: z.boolean().default(false),
   })

   export type ExampleInput = z.infer<typeof exampleSchema>
   ```

4. Extend the smoke component with an example form:
   ```tsx
   import { useForm } from 'react-hook-form'
   import { zodResolver } from '@hookform/resolvers/zod'
   import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
   import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
   import { Checkbox } from '@/components/ui/checkbox'
   import { exampleSchema, type ExampleInput } from '@/domain/validation/example.schema'
   import { toast } from 'sonner'

   function SmokeForm() {
     const form = useForm<ExampleInput>({
       resolver: zodResolver(exampleSchema),
       defaultValues: { name: '', email: '', role: 'operator', notify: false },
     })

     return (
       <Form {...form}>
         <form
           onSubmit={form.handleSubmit(v => toast.success('Submitted', { description: JSON.stringify(v) }))}
           className="space-y-4 max-w-md"
         >
           <FormField control={form.control} name="name" render={({ field }) => (
             <FormItem>
               <FormLabel>Name</FormLabel>
               <FormControl><Input {...field} /></FormControl>
               <FormMessage />
             </FormItem>
           )} />
           <FormField control={form.control} name="email" render={({ field }) => (
             <FormItem>
               <FormLabel>Email</FormLabel>
               <FormControl><Input type="email" {...field} /></FormControl>
               <FormMessage />
             </FormItem>
           )} />
           <FormField control={form.control} name="role" render={({ field }) => (
             <FormItem>
               <FormLabel>Role</FormLabel>
               <Select onValueChange={field.onChange} defaultValue={field.value}>
                 <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                 <SelectContent>
                   <SelectItem value="admin">Admin</SelectItem>
                   <SelectItem value="manager">Manager</SelectItem>
                   <SelectItem value="operator">Operator</SelectItem>
                 </SelectContent>
               </Select>
               <FormMessage />
             </FormItem>
           )} />
           <FormField control={form.control} name="notify" render={({ field }) => (
             <FormItem className="flex items-center gap-2">
               <FormControl>
                 <Checkbox checked={field.value} onCheckedChange={field.onChange} />
               </FormControl>
               <FormLabel className="!mt-0">Notify by email</FormLabel>
             </FormItem>
           )} />
           <Button type="submit">Submit</Button>
         </form>
       </Form>
     )
   }
   ```

   Test:
   - Submit with empty name → inline error shows
   - Invalid email → inline error
   - Valid submission → toast fires with payload

## Files
- Created by CLI: `src/components/ui/{form,checkbox,radio-group,switch,select,textarea}.tsx`
- Create: `src/domain/validation/example.schema.ts`
- Modify: `src/components/__smoke__/primitives-smoke.tsx`

## Acceptance Criteria
- [ ] 6 form components present
- [ ] `react-hook-form`, `zod`, `@hookform/resolvers` in dependencies
- [ ] Example form validates on submit with zod
- [ ] Error messages appear under invalid fields
- [ ] Select dropdown opens and selects
- [ ] Checkbox toggles

## Verification Commands
```bash
grep -E 'react-hook-form|"zod"|@hookform/resolvers' package.json
ls src/components/ui/ | grep -E 'form|checkbox|radio|switch|select|textarea'
npm run build
```

## Git
```bash
git add src/components/ui/ src/domain/ src/components/__smoke__/ package.json package-lock.json
git commit -m "feat(design-system): install form stack (rhf + zod + shadcn form primitives)

- react-hook-form, zod, @hookform/resolvers
- shadcn: form, checkbox, radio-group, switch, select, textarea
- domain/validation/example.schema as zod pattern reference

Task: phase-0/task-09"
git push
```
