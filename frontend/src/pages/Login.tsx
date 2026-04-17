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
import { useAuthStore } from '@/stores/authStore'
import { login } from '@/api/auth'
import { toast } from 'sonner'

export default function Login() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [magicLoading, setMagicLoading] = useState(false)
  const [magicSent, setMagicSent] = useState(false)

  const setAuth = useAuthStore((s) => s.setAuth)

  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: false },
  })

  const { register, handleSubmit, formState: { errors }, getValues, watch } = form

  const onSubmit = async (data: LoginInput) => {
    setLoading(true)
    try {
      const result = await login({ email: data.email, password: data.password })
      setAuth(
        result.token,
        result.email,
        result.role,
        result.tenantId,
        result.requirePasswordChange,
        result.hasCompletedOnboarding,
        result.firstName,
        result.lastName,
        result.refreshToken,
      )
      if (result.requirePasswordChange) {
        navigate('/change-password')
        return
      }
      const lastRoute = localStorage.getItem('last-route') || '/dashboard'
      navigate(lastRoute)
    } catch (err) {
      const e = err as { response?: { data?: { message?: string } }; message?: string }
      toast.error(e?.response?.data?.message ?? e?.message ?? 'Could not sign in. Check your credentials.')
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
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent-subtle">
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
            <span className="text-[10px] uppercase tracking-wide text-fg-tertiary">or</span>
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
