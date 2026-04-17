import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DataTable } from '@/components/data-table/data-table'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
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
        <DataTable columns={smokeColumns} data={smokeData} />
      </CardContent>
    </Card>
  )
}
