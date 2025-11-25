import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppToast } from '@/hooks/useAppToast'
import { forgotPasswordFormSchema, type ForgotPasswordFormValues } from '@/validation/forms'
import { supabase } from '@/services/supabase'

export default function ForgotPasswordPage() {
  const { showToast } = useAppToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting, isSubmitSuccessful },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordFormSchema),
    defaultValues: { email: '' },
  })

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      const redirectTo = `${window.location.origin}/update-password`
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo })
      if (error) {
        showToast('error', error.message || 'Nie udało się wysłać linku resetującego.')
        return
      }
      showToast('success', 'Jeśli podany e-mail istnieje, wysłaliśmy instrukcje resetu.')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd podczas resetu hasła.'
      showToast('error', message)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Reset hasła"
        description="Wyślemy Ci wiadomość z instrukcjami do ustawienia nowego hasła."
        eyebrow="Bezpieczny powrót"
        emoji="🛟"
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

            <div className="flex flex-col gap-3 pt-1">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                Wyślij link resetujący
              </Button>
              {isSubmitSuccessful ? (
                <p className="text-xs text-muted-foreground text-center">
                  Sprawdź skrzynkę pocztową. Link kieruje do strony ustawienia nowego hasła.
                </p>
              ) : null}
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link to="/login" className="text-primary hover:underline">Powrót do logowania</Link>
                <Link to="/register" className="text-primary hover:underline">Nie masz konta? Zarejestruj się</Link>
              </div>
            </div>
          </form>
        }
      />
    </PageShell>
  )
}

