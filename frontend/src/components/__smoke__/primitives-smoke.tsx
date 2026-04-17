import * as React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/data-table/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { exampleSchema, type ExampleInput } from '@/domain/validation/example.schema'
import type { ColumnDef } from '@tanstack/react-table'

type SmokeRow = { name: string; qty: number; status: string }
const smokeData: SmokeRow[] = [
  { name: 'Пшениця', qty: 1240, status: 'ok' },
  { name: 'Кукурудза', qty: 320, status: 'low' },
  { name: 'Соя', qty: 0, status: 'out' },
  { name: 'Ячмінь', qty: 890, status: 'ok' },
  { name: 'Ріпак', qty: 560, status: 'ok' },
]
const smokeColumns: ColumnDef<SmokeRow>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'qty', header: 'Qty (t)', enableSorting: true },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => (
    <Badge variant={row.original.status === 'ok' ? 'secondary' : row.original.status === 'low' ? 'outline' : 'destructive'}>
      {row.original.status}
    </Badge>
  )},
]

function SmokeForm() {
  const form = useForm<ExampleInput>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(exampleSchema) as any,
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

export function PrimitivesSmoke() {
  return (
    <Card className="p-4 max-w-2xl">
      <CardHeader><CardTitle>Smoke test</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="smoke">Label</Label>
          <Input id="smoke" placeholder="type something" />
        </div>
        <Separator />
        <div className="flex gap-2 flex-wrap">
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
        <Separator />
        <div className="flex gap-2 flex-wrap">
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
        <Separator />
        <SmokeForm />
        <Separator />
        <DataTable columns={smokeColumns} data={smokeData} />
      </CardContent>
    </Card>
  )
}
