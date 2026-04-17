import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { AuthShell } from '@/components/auth/auth-card'
import { changePasswordSchema, type ChangePasswordInput } from '@/domain/validation/auth.schema'
import { useAuthStore } from '@/stores/authStore'
import { changePassword } from '@/api/auth'
import { toast } from 'sonner'

export default function ChangePassword() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [show, setShow] = useState({ current: false, new: false })

  const setAuth = useAuthStore((s) => s.setAuth)
  const email = useAuthStore((s) => s.email)

  const form = useForm<ChangePasswordInput>({
    resolver: zodResolver(changePasswordSchema) as any,
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })
  const { register, handleSubmit, formState: { errors } } = form

  const onSubmit = async (data: ChangePasswordInput) => {
    setLoading(true)
    try {
      const result = await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      })
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
      toast.success('Password changed')
      navigate('/dashboard')
    } catch {
      toast.error('Could not change password')
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    { name: 'currentPassword' as const, label: 'Current password', showKey: 'current' as const },
    { name: 'newPassword' as const, label: 'New password', showKey: 'new' as const },
    { name: 'confirmPassword' as const, label: 'Confirm new password', showKey: 'new' as const },
  ]

  return (
    <AuthShell>
      <Card>
        <CardHeader>
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            {email ? `Signed in as ${email}` : 'Use at least 8 characters'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {fields.map((field) => (
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
                {errors[field.name] && (
                  <p className="text-xs text-danger">{errors[field.name]?.message}</p>
                )}
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
