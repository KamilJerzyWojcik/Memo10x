import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppToast } from '@/hooks/useAppToast'
import { updatePasswordFormSchema, type UpdatePasswordFormValues } from '@/validation/forms'
import { supabase } from '@/services/supabase'

export interface UpdatePasswordPageProps {
  returnUrl?: string
}

export default function UpdatePasswordPage({ returnUrl = '/cards' }: UpdatePasswordPageProps) {
  const navigate = useNavigate()
  const { showToast } = useAppToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordFormSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const onSubmit = async (values: UpdatePasswordFormValues) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: values.password })
      if (error) {
        showToast('error', error.message || 'Nie udało się zaktualizować hasła.')
        return
      }
      showToast('success', 'Hasło zostało zaktualizowane')
      navigate('/login', { replace: true, state: { from: { pathname: returnUrl } } })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd podczas aktualizacji hasła.'
      showToast('error', message)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Ustaw nowe hasło"
        description="Formularz dostępny po kliknięciu w link z wiadomości e-mail."
        eyebrow="Reset"
        emoji="🔐"
        secondaryContent={
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-semibold text-foreground">
                Nowe hasło
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
                Powtórz nowe hasło
              </label>
              <Input id="confirmPassword" type="password" autoComplete="new-password" aria-invalid={!!errors.confirmPassword} {...register('confirmPassword')} />
              {errors.confirmPassword ? (
                <div role="alert" className="text-sm text-destructive">{errors.confirmPassword.message}</div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                Ustaw hasło
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link to="/login" className="text-primary hover:underline">Powrót do logowania</Link>
                <Link to="/register" className="text-primary hover:underline">Załóż nowe konto</Link>
              </div>
            </div>
          </form>
        }
      />
    </PageShell>
  )
}

