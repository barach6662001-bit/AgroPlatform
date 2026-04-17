import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/stores/authStore'

export function UserMenu() {
  const email = useAuthStore((s) => s.email)
  const initial = (email ?? '?').charAt(0).toUpperCase()
  return (
    <Button variant="ghost" size="sm" className="h-8 gap-1.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent-subtle text-xs font-medium text-accent-solid">
        {initial}
      </span>
      <span className="hidden md:inline text-xs">{initial}</span>
    </Button>
  )
}
