import { z } from 'zod'
import { cardTextField, emailField, passwordField, withPasswordConfirmation } from './fields'
import { MAX_CARD_TEXT_LEN } from './constants'

export const loginFormSchema = z.object({
  email: emailField,
  password: passwordField,
})

export const registerFormSchema = withPasswordConfirmation(
  z.object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string(),
  })
)

export const forgotPasswordFormSchema = z.object({
  email: emailField,
})

export const updatePasswordFormSchema = withPasswordConfirmation(
  z.object({
    password: passwordField,
    confirmPassword: z.string(),
  })
)

export const createCardFormSchema = z.object({
  sourceText: cardTextField(MAX_CARD_TEXT_LEN),
  targetText: cardTextField(MAX_CARD_TEXT_LEN),
})

export const updateCardFormSchema = z.object({
  sourceText: cardTextField(MAX_CARD_TEXT_LEN).optional(),
  targetText: cardTextField(MAX_CARD_TEXT_LEN).optional(),
})

export type LoginFormValues = z.infer<typeof loginFormSchema>
export type RegisterFormValues = z.infer<typeof registerFormSchema>
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordFormSchema>
export type UpdatePasswordFormValues = z.infer<typeof updatePasswordFormSchema>
export type CreateCardFormValues = z.infer<typeof createCardFormSchema>
export type UpdateCardFormValues = z.infer<typeof updateCardFormSchema>


