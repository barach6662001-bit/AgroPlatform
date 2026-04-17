import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from '@/components/ui/command'
import { toast } from 'sonner'
import { useAuthStore } from '@/stores/authStore'

export function TenantSwitcher() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()

  const tenantId = useAuthStore((s) => s.tenantId)
  const setTenantId = useAuthStore((s) => s.setTenantId)

  // Fallback: single tenant from auth store
  const tenantName = tenantId ?? 'Farm'

  const handleSwitch = (id: string) => {
    if (id === tenantId) {
      setOpen(false)
      return
    }
    try {
      setTenantId(id)
      pushRecentTenant(id)
      toast.success(`Switched to ${id}`)
      setOpen(false)
      navigate('/dashboard')
    } catch {
      toast.error('Could not switch tenant')
    }
  }

  if (!tenantId) return null

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-2 text-sm font-medium">
          <span className="max-w-[140px] truncate">{tenantName}</span>
          <ChevronDown className="h-3.5 w-3.5 text-fg-tertiary" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search companies..." />
          <CommandList>
            <CommandEmpty>No companies found.</CommandEmpty>
            <CommandGroup heading="All companies">
              <CommandItem onSelect={() => handleSwitch(tenantId)} className="flex-col items-start gap-0 py-2">
                <div className="flex w-full items-center">
                  <Check className="mr-2 h-4 w-4 text-accent-solid" />
                  <span className="flex-1 truncate font-medium">{tenantName}</span>
                </div>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function pushRecentTenant(id: string) {
  try {
    const current: string[] = JSON.parse(localStorage.getItem('tenant-history') || '[]')
    const updated = [id, ...current.filter((x) => x !== id)].slice(0, 10)
    localStorage.setItem('tenant-history', JSON.stringify(updated))
  } catch (_e) {
    // ignore
  }
}
