import { z } from 'zod'
import { MAX_CARD_TEXT_LEN } from './constants'

export const emailField = z
  .email({ message: 'Podaj poprawny adres e-mail' })

export const passwordField = z
  .string()
  .min(8, { message: 'Hasło musi mieć co najmniej 8 znaków' })
  .regex(/\d/, { message: 'Hasło musi zawierać co najmniej jedną cyfrę' })

export const cardTextField = (max = MAX_CARD_TEXT_LEN) =>
  z
    .string()
    .trim()
    .min(1, { message: 'Wymagane (min 1 znak).' })
    .max(max, { message: `Za długie (max ${max} znaków).` })

export const withPasswordConfirmation = <
  T extends { password: string; confirmPassword: string }
>(
  shape: z.ZodType<T, T>
) =>
  shape.refine((v) => v.password === v.confirmPassword, {
    message: 'Hasła muszą być identyczne',
    path: ['confirmPassword'],
  })


