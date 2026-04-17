# Task 07 — Install data-display components

## Context
Data-heavy surface components. Tables, tabs, pagination, progress. TanStack Table is installed here — it becomes the default for any list > 20 rows.

## Dependencies
- task-06

## Goal
Install shadcn data primitives + TanStack Table + build a thin `DataTable` wrapper in `@/components/data-table/data-table.tsx`.

## Steps

1. Install shadcn data components:
   ```bash
   npx shadcn@latest add table tabs pagination progress scroll-area
   ```

2. Install TanStack Table and virtualizer:
   ```bash
   npm install @tanstack/react-table @tanstack/react-virtual
   ```

3. Create `src/components/data-table/data-table.tsx`. Minimum scope for Phase 0 — full-feature build (column visibility, pinning, export) comes in Wave 2:
   ```tsx
   import * as React from 'react'
   import {
     ColumnDef, flexRender, getCoreRowModel,
     getSortedRowModel, SortingState, useReactTable,
   } from '@tanstack/react-table'
   import {
     Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
   } from '@/components/ui/table'

   interface DataTableProps<TData, TValue> {
     columns: ColumnDef<TData, TValue>[]
     data: TData[]
     emptyMessage?: string
   }

   export function DataTable<TData, TValue>({
     columns, data, emptyMessage = 'No data',
   }: DataTableProps<TData, TValue>) {
     const [sorting, setSorting] = React.useState<SortingState>([])
     const table = useReactTable({
       data, columns,
       getCoreRowModel: getCoreRowModel(),
       getSortedRowModel: getSortedRowModel(),
       onSortingChange: setSorting,
       state: { sorting },
     })

     return (
       <div className="rounded border border-border-subtle">
         <Table>
           <TableHeader>
             {table.getHeaderGroups().map(hg => (
               <TableRow key={hg.id}>
                 {hg.headers.map(h => (
                   <TableHead key={h.id} className="text-xs font-medium uppercase tracking-wide text-fg-tertiary">
                     {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                   </TableHead>
                 ))}
               </TableRow>
             ))}
           </TableHeader>
           <TableBody>
             {table.getRowModel().rows.length ? (
               table.getRowModel().rows.map(r => (
                 <TableRow key={r.id} className="hover:bg-bg-muted/60">
                   {r.getVisibleCells().map(c => (
                     <TableCell key={c.id} className="py-2 px-3 text-sm">
                       {flexRender(c.column.columnDef.cell, c.getContext())}
                     </TableCell>
                   ))}
                 </TableRow>
               ))
             ) : (
               <TableRow>
                 <TableCell colSpan={columns.length} className="h-24 text-center text-fg-tertiary">
                   {emptyMessage}
                 </TableCell>
               </TableRow>
             )}
           </TableBody>
         </Table>
       </div>
     )
   }
   ```

4. Extend the smoke component (`src/components/__smoke__/primitives-smoke.tsx`) with a small DataTable example using 3 columns and 5 rows of dummy data. Verify sorting works by clicking a header (attach `sortingFn` if needed; for this smoke test just make one column sortable).

## Files
- Created by CLI: `src/components/ui/{table,tabs,pagination,progress,scroll-area}.tsx`
- Create: `src/components/data-table/data-table.tsx`
- Modify: `src/components/__smoke__/primitives-smoke.tsx` (add DataTable example)

## Acceptance Criteria
- [ ] 5 shadcn data components present
- [ ] `@tanstack/react-table` and `@tanstack/react-virtual` in dependencies
- [ ] `DataTable` component renders with headers, rows, empty state
- [ ] Header uppercase tracking — Palantir-style
- [ ] Row hover state visible

## Verification Commands
```bash
ls src/components/data-table/
grep '@tanstack' package.json
npm run build
```

## Git
```bash
git add src/components/ui/ src/components/data-table/ src/components/__smoke__/ package.json package-lock.json
git commit -m "feat(design-system): install data components + build DataTable wrapper

- shadcn: table, tabs, pagination, progress, scroll-area
- tanstack-table + virtual
- DataTable wraps shadcn Table with sorting and empty state

Task: phase-0/task-07"
git push
```
