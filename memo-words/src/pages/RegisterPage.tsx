import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppToast } from '@/hooks/useAppToast'
import { registerFormSchema, type RegisterFormValues } from '@/validation/forms'

export interface RegisterPageProps {
  returnUrl?: string
}

export default function RegisterPage({ returnUrl = '/cards' }: RegisterPageProps) {
  const navigate = useNavigate()
  const { showToast } = useAppToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerFormSchema as any) as any,
    defaultValues: { email: '', password: '', confirmPassword: '' },
  })

  const onSubmit = async (_values: RegisterFormValues) => {
    // Placeholder: UI-only, bez realnego wywołania Supabase
    showToast('success', 'Konto utworzone (UI demo)')
    navigate(`/login?returnUrl=${encodeURIComponent(returnUrl)}`)
  }

  return (
    <PageShell>
      <PageHeader
        title="Załóż konto"
        description="Rozpocznij swoją podróż z fiszkami. Rejestracja w minutę."
        eyebrow="Nowa wyprawa"
        emoji="✨"
        secondaryContent={
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-foreground">
                E-mail
              </label>
              <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register('email')} />
              {errors.email ? (
                <div role="alert" className="text-sm text-destructive">{errors.email.message}</div>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Hasło
              </label>
              <Input id="password" type="password" autoComplete="new-password" aria-invalid={!!errors.password} {...register('password')} />
              {errors.password ? (
                <div role="alert" className="text-sm text-destructive">{errors.password.message}</div>
              ) : (
                <p className="text-xs text-muted-foreground">Min. 8 znaków, w tym co najmniej jedna cyfra.</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-semibold text-foreground">
                Powtórz hasło
              </label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
              {errors.confirmPassword ? (
                <div role="alert" className="text-sm text-destructive">{errors.confirmPassword.message}</div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                Zarejestruj się
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link to="/login" className="text-primary hover:underline">Masz już konto? Zaloguj się</Link>
                <Link to="/forgot-password" className="text-primary hover:underline">Nie pamiętasz hasła?</Link>
              </div>
            </div>
          </form>
        }
      />
    </PageShell>
  )
}

