import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthShell } from '@/components/auth/auth-card'
import { useAuthStore } from '@/stores/authStore'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'

// Placeholder shape — wire to real API when multi-tenant backend is ready
interface TenantOption {
  id: string
  name: string
  emoji?: string
  size?: string
  region?: string
  role?: string
}

export default function SelectTenant() {
  const navigate = useNavigate()
  const tenantId = useAuthStore((s) => s.tenantId)

  // No multi-tenant support yet — redirect immediately based on existing tenantId
  useEffect(() => {
    if (tenantId) {
      navigate('/dashboard', { replace: true })
    } else {
      navigate('/login', { replace: true })
    }
  }, [tenantId, navigate])

  const handleSelect = async (t: TenantOption) => {
    try {
      localStorage.setItem('last-tenant', t.id)
      navigate('/dashboard')
    } catch {
      toast.error('Could not select company')
    }
  }

  // Stub list for UI preview (never shown in prod until availableTenants is exposed)
  const tenants: TenantOption[] = []

  if (tenants.length === 0) {
    return (
      <AuthShell>
        <div className="text-center text-sm text-fg-tertiary">Redirecting…</div>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Choose a company</CardTitle>
          <CardDescription>You have access to multiple companies.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-1 p-2">
          {tenants.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t)}
              className="group flex w-full items-center gap-3 rounded border border-transparent p-3 text-left transition-colors hover:border-border-subtle hover:bg-bg-muted"
            >
              <span className="text-2xl" aria-hidden>{t.emoji ?? '🏢'}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{t.name}</div>
                <div className="truncate text-[10px] text-fg-tertiary">
                  {[t.size, t.region, t.role].filter(Boolean).join(' · ')}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-fg-tertiary group-hover:text-fg-secondary" />
            </button>
          ))}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
