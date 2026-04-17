import * as React from 'react'
import { Package } from 'lucide-react'
import { EmptyState, LoadingState, ErrorState } from '@/components/state'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { DataTable } from '@/components/data-table/data-table'
import { DatePicker } from '@/components/ui/date-picker'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from 'sonner'
import type { ColumnDef } from '@tanstack/react-table'

type Row = { id: string; name: string; qty: number; status: 'ok' | 'low' | 'out' }
const rows: Row[] = [
  { id: 'WH-001', name: 'Пшениця 3 клас', qty: 1240.5, status: 'ok' },
  { id: 'WH-002', name: 'Кукурудза', qty: 320.0, status: 'low' },
  { id: 'WH-003', name: 'Соя', qty: 0, status: 'out' },
  { id: 'WH-004', name: 'Ячмінь', qty: 890.25, status: 'ok' },
]
const columns: ColumnDef<Row>[] = [
  { accessorKey: 'id', header: 'ID', cell: ({ row }) => <span className="font-mono text-xs">{row.original.id}</span> },
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'qty', header: 'Qty (t)', cell: ({ row }) => <span className="font-mono tabular-nums">{row.original.qty.toLocaleString('uk-UA')}</span> },
  { accessorKey: 'status', header: 'Status', cell: ({ row }) => {
    const s = row.original.status
    return <Badge variant={s === 'ok' ? 'secondary' : s === 'low' ? 'outline' : 'destructive'}>{s}</Badge>
  }},
]

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-medium uppercase tracking-wide text-fg-tertiary">{title}</h2>
      <div className="space-y-2">{children}</div>
      <Separator />
    </section>
  )
}

export default function DesignSystemPreview() {
  const [date, setDate] = React.useState<Date>()
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-bg-base text-fg-primary">
        <header className="flex items-center justify-between border-b border-border-subtle px-6 py-4">
          <div>
            <h1 className="text-xl font-semibold">AgroPlatform Design System</h1>
            <p className="text-sm text-fg-tertiary">v1.0 · Palantir / Retool density profile</p>
          </div>
          <ThemeToggle />
        </header>

        <main className="mx-auto max-w-5xl space-y-8 p-6">
          <Section title="Typography">
            <h1 className="text-4xl font-semibold">Heading 4xl</h1>
            <h2 className="text-3xl font-semibold">Heading 3xl</h2>
            <h3 className="text-2xl font-semibold">Heading 2xl</h3>
            <h4 className="text-xl font-semibold">Heading xl</h4>
            <p className="text-base">Body 13px — default dense body text. IBM Plex Sans.</p>
            <p className="text-sm text-fg-secondary">Secondary small text.</p>
            <p className="text-xs text-fg-tertiary">Tertiary extra-small 11px.</p>
            <code className="font-mono text-sm tabular-nums">1,234,567.89 ₴</code>
          </Section>

          <Section title="Colors">
            <div className="grid grid-cols-5 gap-2">
              {[
                ['bg-base','bg-bg-base border border-border-subtle'],
                ['bg-subtle','bg-bg-subtle'],
                ['bg-muted','bg-bg-muted'],
                ['accent-solid','bg-accent-solid text-accent-fg'],
                ['accent-subtle','bg-accent-subtle'],
                ['success','bg-success text-success-fg'],
                ['warning','bg-warning text-warning-fg'],
                ['danger','bg-danger text-danger-fg'],
                ['info','bg-info text-info-fg'],
                ['muted','bg-muted'],
              ].map(([label, cls]) => (
                <div key={label} className={`h-16 rounded border border-border-subtle flex items-end p-2 text-xs ${cls}`}>
                  {label}
                </div>
              ))}
            </div>
          </Section>

          <Section title="Buttons">
            <div className="flex flex-wrap gap-2">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="link">Link</Button>
              <Button variant="destructive">Destructive</Button>
              <Button disabled>Disabled</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </Section>

          <Section title="Inputs & labels">
            <div className="grid max-w-md gap-3">
              <div className="space-y-1.5"><Label>Name</Label><Input placeholder="type…" /></div>
              <div className="space-y-1.5"><Label>Disabled</Label><Input disabled value="read-only" /></div>
              <DatePicker value={date} onChange={setDate} />
              <DateRangePicker />
            </div>
          </Section>

          <Section title="Badges">
            <div className="flex flex-wrap gap-2">
              <Badge>default</Badge>
              <Badge variant="secondary">secondary</Badge>
              <Badge variant="outline">outline</Badge>
              <Badge variant="destructive">destructive</Badge>
            </div>
          </Section>

          <Section title="Avatar + Skeleton">
            <div className="flex items-center gap-3">
              <Avatar><AvatarFallback>VL</AvatarFallback></Avatar>
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-8 w-8 rounded-pill" />
            </div>
          </Section>

          <Section title="Tabs + Progress">
            <Tabs defaultValue="overview">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="pt-3 space-y-2">
                <Progress value={42} />
                <p className="text-sm text-fg-secondary">42% complete</p>
              </TabsContent>
              <TabsContent value="history"><p className="text-sm text-fg-secondary">History tab.</p></TabsContent>
              <TabsContent value="settings"><p className="text-sm text-fg-secondary">Settings tab.</p></TabsContent>
            </Tabs>
          </Section>

          <Section title="Overlays">
            <div className="flex gap-2 flex-wrap">
              <Dialog>
                <DialogTrigger asChild><Button variant="outline">Dialog</Button></DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Transfer stock</DialogTitle></DialogHeader>
                  <p className="text-sm text-fg-secondary">Move grain between warehouses.</p>
                </DialogContent>
              </Dialog>
              <Sheet>
                <SheetTrigger asChild><Button variant="outline">Sheet</Button></SheetTrigger>
                <SheetContent>
                  <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                </SheetContent>
              </Sheet>
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline">Menu</Button></DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>Edit</DropdownMenuItem>
                  <DropdownMenuItem>Duplicate</DropdownMenuItem>
                  <DropdownMenuItem className="text-danger">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild><Button variant="outline">Tooltip</Button></TooltipTrigger>
                <TooltipContent>Shortcut: ⌘K</TooltipContent>
              </Tooltip>
              <Button variant="outline" onClick={() => toast.success('Saved', { description: '3 rows updated' })}>
                Toast
              </Button>
            </div>
          </Section>

          <Section title="Card + DataTable">
            <Card>
              <CardHeader><CardTitle>Warehouses</CardTitle></CardHeader>
              <CardContent className="p-0"><DataTable columns={columns} data={rows} /></CardContent>
            </Card>
          </Section>

          <Section title="Density comparison">
            <p className="text-sm text-fg-secondary">Compact (default): row h-7 · Comfortable: row h-9</p>
          </Section>

          <Section title="States">
            <div className="space-y-6">
              <div className="rounded border border-border-subtle">
                <EmptyState
                  icon={Package}
                  title="No warehouses yet"
                  description="Warehouses let you organize and track stored grain, fuel, and inputs."
                  action={{ label: 'Add warehouse', onClick: () => {}, icon: Package }}
                  learnMore={{ label: 'Learn more about warehouses', href: '#' }}
                />
              </div>
              <div className="rounded border border-border-subtle p-4">
                <p className="mb-3 text-sm font-medium text-fg-secondary">Loading — skeleton table</p>
                <LoadingState variant="skeleton-table" rows={4} />
              </div>
              <div className="rounded border border-border-subtle p-4">
                <p className="mb-3 text-sm font-medium text-fg-secondary">Loading — skeleton cards</p>
                <LoadingState variant="skeleton-card" rows={3} />
              </div>
              <div className="rounded border border-border-subtle p-4">
                <p className="mb-3 text-sm font-medium text-fg-secondary">Loading — spinner</p>
                <LoadingState variant="spinner" />
              </div>
              <div className="rounded border border-border-subtle">
                <ErrorState
                  title="Could not load data"
                  description="The server returned an error. Please try again."
                  onRetry={() => {}}
                />
              </div>
            </div>
          </Section>
        </main>
      </div>
    </TooltipProvider>
  )
}
