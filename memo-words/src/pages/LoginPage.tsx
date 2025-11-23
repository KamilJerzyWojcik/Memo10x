import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppToast } from '@/hooks/useAppToast'
import { loginFormSchema, type LoginFormValues } from '@/validation/forms'
import { supabase } from '@/services/supabase'

export interface LoginPageProps {
  returnUrl?: string
}

export default function LoginPage({ returnUrl = '/' }: LoginPageProps) {
  const navigate = useNavigate()
  const { showToast } = useAppToast()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema) as any,
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })
      if (error) {
        showToast('error', error.message || 'Nie udało się zalogować.')
        return
      }
      showToast('success', 'Zalogowano pomyślnie')
      navigate(returnUrl, { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Wystąpił błąd logowania.'
      showToast('error', message)
    }
  }

  return (
    <PageShell>
      <PageHeader
        title="Zaloguj się"
        description="Wejdź na pokład MemoWords i kontynuuj naukę słówek."
        eyebrow="Start wyprawy"
        emoji="🧳"
        secondaryContent={
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5"
            noValidate
          >
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
              <Input id="password" type="password" autoComplete="current-password" aria-invalid={!!errors.password} {...register('password')} />
              {errors.password ? (
                <div role="alert" className="text-sm text-destructive">{errors.password.message}</div>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 pt-1">
              <Button type="submit" size="lg" disabled={isSubmitting} className="w-full">
                Zaloguj się
              </Button>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <Link to="/register" className="text-primary hover:underline">Nie masz konta? Zarejestruj się</Link>
                <Link to="/forgot-password" className="text-primary hover:underline">Nie pamiętasz hasła?</Link>
              </div>
            </div>
          </form>
        }
      />
    </PageShell>
  )
}


