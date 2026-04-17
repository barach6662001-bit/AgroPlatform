# Task 05 — Auth Screens Migration

**Goal:** Rewrite `Login.tsx` matching `WIREFRAMES.md §5` (enterprise-ready with magic link + SSO placeholder). Add tenant selection screen. Rewrite `ChangePassword.tsx` if it exists.

**Depends on:** task-00

---

## Files to change

- **Replace:** `frontend/src/pages/Login.tsx` (AntD Form → RHF + zod + shadcn)
- **New:** `frontend/src/pages/SelectTenant.tsx` — for users with multiple tenants
- **Replace:** `frontend/src/pages/ChangePassword.tsx` (if exists)
- **New:** `frontend/src/domain/validation/auth.schema.ts` — zod schemas
- **New:** `frontend/src/components/auth/auth-card.tsx` — shared layout
- **Update:** router — add `/select-tenant` route

---

## Step 1 — Zod schemas

Create `frontend/src/domain/validation/auth.schema.ts`:

```ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().default(false),
})
export type LoginInput = z.infer<typeof loginSchema>

export const magicLinkSchema = z.object({
  email: z.string().email('Enter a valid email address'),
})
export type MagicLinkInput = z.infer<typeof magicLinkSchema>

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'At least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
```

---

## Step 2 — Shared auth card layout

Create `frontend/src/components/auth/auth-card.tsx`:

```tsx
import { Link } from 'react-router-dom'
import { LanguageSwitcher } from '@/components/shell/language-switcher'

export function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-bg-base">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-3xl" aria-hidden>🌾</span>
          <span className="text-xl font-semibold tracking-tight">AgroPlatform</span>
        </div>
        <div className="w-full max-w-sm">{children}</div>
      </main>
      <footer className="flex items-center justify-between border-t border-border-subtle px-4 py-3 text-2xs text-fg-tertiary">
        <LanguageSwitcher variant="compact" />
        <div className="flex items-center gap-3">
          <span>v1.0</span>
          <Link to="/privacy" className="hover:text-fg-secondary">Privacy</Link>
          <Link to="/terms" className="hover:text-fg-secondary">Terms</Link>
          <a href="https://status.agroplatform.com" target="_blank" rel="noreferrer" className="hover:text-fg-secondary">
            Status
          </a>
        </div>
      </footer>
    </div>
  )
}
```

---

## Step 3 — Login page

Replace `frontend/src/pages/Login.tsx`:

```tsx
import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff, ArrowRight, Mail, Key, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthShell } from '@/components/auth/auth-card'
import { loginSchema, type LoginInput } from '@/domain/validation/auth.schema'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  const login = useAuthStore((s) => s.login)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema) as any,
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const { register, handleSubmit, formState: { errors }, getValues, watch } = form

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      const result = await login(data.email, data.password, data.rememberMe)
      // Adjust based on actual login return shape
      const tenants = result?.availableTenants ?? []
      const lastTenant = localStorage.getItem('last-tenant')
      if (tenants.length > 1 && !lastTenant) {
        navigate('/select-tenant')
      } else {
        const lastRoute = localStorage.getItem('last-route') || '/dashboard'
        navigate(lastRoute)
      }
    } catch (err: any) {
      toast.error(err?.message ?? 'Could not sign in. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const onMagicLink = async () => {
    const email = getValues('email')
    const parsed = loginSchema.shape.email.safeParse(email)
    if (!parsed.success) {
      form.setError('email', { message: 'Enter an email first' })
      return
    }
    setMagicLoading(true)
    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.status === 404 || res.status === 501) {
        toast.message('Magic link sign-in coming soon — please use password')
        return
      }
      if (!res.ok) throw new Error('Request failed')
      setMagicSent(true)
    } catch {
      toast.error('Could not send magic link')
    } finally {
      setMagicLoading(false)
    }
  }

  const onSSO = () => {
    toast.message('SSO configuration pending — contact your administrator')
  }

  if (magicSent) {
    return (
      <AuthShell>
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-pill bg-accent-subtle">
              <Mail className="h-5 w-5 text-accent-solid" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a magic link to {watch('email')}. It expires in 15 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={() => setMagicSent(false)}>
              Back to sign in
            </Button>
          </CardContent>
        </Card>
      </AuthShell>
    )
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>to continue to your workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                autoFocus
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-danger">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link to="/forgot-password" className="text-xs text-fg-secondary hover:text-fg-primary">
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className="pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-secondary"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger">{errors.password.message}</p>
              )}
            </div>

            <div className="flex items-start gap-2">
              <Checkbox
                id="rememberMe"
                checked={watch('rememberMe')}
                onCheckedChange={(v) => form.setValue('rememberMe', !!v)}
              />
              <Label htmlFor="rememberMe" className="text-xs text-fg-secondary leading-4">
                Remember me on this device for 30 days
              </Label>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                <>Sign in<ArrowRight className="ml-1 h-4 w-4" /></>
              )}
            </Button>
          </form>

          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border-subtle" />
            <span className="text-2xs uppercase tracking-wide text-fg-tertiary">or</span>
            <div className="h-px flex-1 bg-border-subtle" />
          </div>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onMagicLink}
              disabled={magicLoading}
              type="button"
            >
              {magicLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Email a magic link
            </Button>
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={onSSO}
              data-sso-placeholder="true"
              type="button"
            >
              <Key className="h-4 w-4" />
              Sign in with SSO
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-xs text-fg-tertiary">
        No account? <span className="text-fg-secondary">Contact your admin</span>
      </p>
    </AuthShell>
  )
}
```

**IMPORTANT:** the existing `authStore.login` may have a different signature. Read it and adapt the call signature above. If it only accepts `(email, password)` without `rememberMe`, still pass `rememberMe` if possible — otherwise log a follow-up to add 30-day session support to the backend.

---

## Step 4 — Select tenant page

Create `frontend/src/pages/SelectTenant.tsx`:

```tsx
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthShell } from '@/components/auth/auth-card'
import { useAuthStore } from '@/store/authStore'
import { toast } from 'sonner'
import { ChevronRight } from 'lucide-react'

export default function SelectTenant() {
  const navigate = useNavigate()
  const availableTenants = useAuthStore((s) => s.availableTenants ?? [])
  const switchTenant = useAuthStore((s) => s.switchTenant)

  // Auto-redirect if only one tenant
  useEffect(() => {
    if (availableTenants.length === 1) {
      handleSelect(availableTenants[0].id)
    }
    if (availableTenants.length === 0) {
      navigate('/login')
    }
  }, [availableTenants])

  const handleSelect = async (tenantId: string) => {
    try {
      await switchTenant?.(tenantId)
      localStorage.setItem('last-tenant', tenantId)
      navigate('/dashboard')
    } catch {
      toast.error('Could not select company')
    }
  }

  if (availableTenants.length <= 1) {
    return (
      <AuthShell>
        <div className="text-center text-sm text-fg-tertiary">Loading…</div>
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
          {availableTenants.map((t: any) => (
            <button
              key={t.id}
              onClick={() => handleSelect(t.id)}
              className="group flex w-full items-center gap-3 rounded border border-transparent p-3 text-left transition-colors hover:border-border-subtle hover:bg-bg-muted"
            >
              <span className="text-2xl" aria-hidden>{t.emoji ?? '🏢'}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{t.name}</div>
                <div className="truncate text-2xs text-fg-tertiary">
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
```

Register route in router config:
```tsx
{ path: '/select-tenant', lazy: async () => ({ Component: (await import('@/pages/SelectTenant')).default }) }
```

---

## Step 5 — ChangePassword (if exists)

If `frontend/src/pages/ChangePassword.tsx` exists:

```tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthShell } from '@/components/auth/auth-card'
import { changePasswordSchema, type ChangePasswordInput } from '@/domain/validation/auth.schema'
import { toast } from 'sonner'

export default function ChangePassword() {
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState({ current: false, new: false })

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema) as any,
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = async (data: ChangePasswordInput) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      })
      if (!res.ok) throw new Error('Failed')
      toast.success('Password changed')
    } catch {
      toast.error('Could not change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>Use at least 8 characters</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {[
              { name: 'currentPassword' as const, label: 'Current password', showKey: 'current' as const },
              { name: 'newPassword' as const, label: 'New password', showKey: 'new' as const },
              { name: 'confirmPassword' as const, label: 'Confirm new password', showKey: 'new' as const },
            ].map((field) => (
              <div key={field.name} className="space-y-1.5">
                <Label htmlFor={field.name}>{field.label}</Label>
                <div className="relative">
                  <Input
                    id={field.name}
                    type={show[field.showKey] ? 'text' : 'password'}
                    {...register(field.name)}
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShow((s) => ({ ...s, [field.showKey]: !s[field.showKey] }))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-fg-tertiary hover:text-fg-secondary"
                    aria-label="Toggle password visibility"
                  >
                    {show[field.showKey] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors[field.name] && <p className="text-xs text-danger">{errors[field.name]?.message}</p>}
              </div>
            ))}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Change password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
```

---

## Step 6 — Remove from AntD allowlist

Confirm no AntD imports remain:
```bash
grep -n "from 'antd'" frontend/src/pages/Login.tsx frontend/src/pages/ChangePassword.tsx 2>/dev/null
```

Remove these files from `.eslint-antd-allowlist.txt`.

---

## Acceptance criteria

- [ ] Login renders matching WIREFRAMES §5
- [ ] Email/password validation shows inline zod errors
- [ ] Show/hide password toggle works
- [ ] "Remember me" checkbox persists its state
- [ ] Sign in button disabled + spinner during submit
- [ ] Wrong credentials → toast error
- [ ] Magic link: if backend 404/501 → toast placeholder; if OK → success card
- [ ] SSO button → toast placeholder
- [ ] Language switcher in footer works
- [ ] `/select-tenant` route renders list of tenants with role info
- [ ] Auto-redirect to /dashboard if only one tenant
- [ ] ChangePassword (if existed) migrated with confirm-match validation
- [ ] No AntD imports in any auth file
- [ ] `npm run build` passes, `npm run lint` passes

---

## Playwright screenshots

- `docs/screenshots/wave-1/task-05-login-light.png`
- `docs/screenshots/wave-1/task-05-login-dark.png`
- `docs/screenshots/wave-1/task-05-login-errors.png` (submit empty form)
- `docs/screenshots/wave-1/task-05-magic-link-sent.png`
- `docs/screenshots/wave-1/task-05-select-tenant.png`

---

## Git

```bash
git add frontend/src/pages/Login.tsx \
        frontend/src/pages/SelectTenant.tsx \
        frontend/src/pages/ChangePassword.tsx 2>/dev/null \
        frontend/src/domain/validation/auth.schema.ts \
        frontend/src/components/auth/ \
        frontend/.eslint-antd-allowlist.txt \
        docs/screenshots/wave-1/

# Also commit the router config update
git add frontend/src/router* frontend/src/App.tsx frontend/src/main.tsx 2>/dev/null

git commit -m "feat(auth): migrate login + add magic link, SSO placeholder, tenant picker

- Login: RHF + zod, 30-day remember-me, inline errors
- Magic link button (graceful 501 fallback toast)
- SSO placeholder with data-attribute for future wiring
- New /select-tenant route for multi-tenant users
- Auth layout shell with language switcher footer
- ChangePassword migrated with zod refine match check

Task: wave-1/task-05"
git push
```

Append to `_progress.md`, including follow-ups for backend (magic link endpoint, 30-day refresh token).
