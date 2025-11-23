import { describe, it, expect, expectTypeOf } from 'vitest'
import {
  loginFormSchema,
  registerFormSchema,
  forgotPasswordFormSchema,
  updatePasswordFormSchema,
  createCardFormSchema,
  updateCardFormSchema,
  type LoginFormValues,
  type RegisterFormValues,
  type ForgotPasswordFormValues,
  type UpdatePasswordFormValues,
  type CreateCardFormValues,
  type UpdateCardFormValues,
} from '../forms'
import { MAX_CARD_TEXT_LEN } from '../constants'

describe('loginFormSchema', () => {
  it('parsuje poprawne dane', () => {
    const result = loginFormSchema.safeParse({
      email: 'user@example.com',
      password: 'abcd1234',
    })
    expect(result.success).toBe(true)
  })

  it('zwraca błąd dla niepoprawnego email', () => {
    const result = loginFormSchema.safeParse({
      email: 'not-an-email',
      password: 'abcd1234',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email'])
      expect(result.error.issues[0].message).toBe('Podaj poprawny adres e-mail')
    }
  })

  it('zwraca błąd dla zbyt krótkiego hasła', () => {
    const result = loginFormSchema.safeParse({
      email: 'user@example.com',
      password: 'abc1234', // 7 znaków, zawiera cyfrę
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'password')
      expect(issue?.message).toBe('Hasło musi mieć co najmniej 8 znaków')
    }
  })

  it('zwraca błąd dla hasła bez cyfry', () => {
    const result = loginFormSchema.safeParse({
      email: 'user@example.com',
      password: 'abcdefgh', // 8 znaków, bez cyfry
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'password')
      expect(issue?.message).toBe('Hasło musi zawierać co najmniej jedną cyfrę')
    }
  })
})

describe('registerFormSchema', () => {
  it('parsuje poprawne dane, zgodne hasła', () => {
    const result = registerFormSchema.safeParse({
      email: 'user@example.com',
      password: 'abcd1234',
      confirmPassword: 'abcd1234',
    })
    expect(result.success).toBe(true)
  })

  it('zwraca błąd dla niezgodnych haseł', () => {
    const result = registerFormSchema.safeParse({
      email: 'user@example.com',
      password: 'abcd1234',
      confirmPassword: 'abcd12345',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword')
      expect(issue?.message).toBe('Hasła muszą być identyczne')
    }
  })
})

describe('forgotPasswordFormSchema', () => {
  it('parsuje poprawny email', () => {
    const result = forgotPasswordFormSchema.safeParse({
      email: 'user@example.com',
    })
    expect(result.success).toBe(true)
  })

  it('zwraca błąd dla niepoprawnego email', () => {
    const result = forgotPasswordFormSchema.safeParse({
      email: 'bad',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(['email'])
      expect(result.error.issues[0].message).toBe('Podaj poprawny adres e-mail')
    }
  })
})

describe('updatePasswordFormSchema', () => {
  it('parsuje poprawne dane, zgodne hasła', () => {
    const result = updatePasswordFormSchema.safeParse({
      password: 'abcd1234',
      confirmPassword: 'abcd1234',
    })
    expect(result.success).toBe(true)
  })

  it('zwraca błąd dla niezgodnych haseł', () => {
    const result = updatePasswordFormSchema.safeParse({
      password: 'abcd1234',
      confirmPassword: 'abcd12345',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'confirmPassword')
      expect(issue?.message).toBe('Hasła muszą być identyczne')
    }
  })

  it('zwraca błąd dla zbyt krótkiego hasła', () => {
    const result = updatePasswordFormSchema.safeParse({
      password: 'abc1234',
      confirmPassword: 'abc1234',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'password')
      expect(issue?.message).toBe('Hasło musi mieć co najmniej 8 znaków')
    }
  })
})

describe('createCardFormSchema', () => {
  it('parsuje poprawne dane i przycina wartości', () => {
    const result = createCardFormSchema.safeParse({
      sourceText: '  Hello ',
      targetText: ' World  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sourceText).toBe('Hello')
      expect(result.data.targetText).toBe('World')
    }
  })

  it('odrzuca puste po przycięciu', () => {
    const result = createCardFormSchema.safeParse({
      sourceText: '   ',
      targetText: '   ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain('Wymagane (min 1 znak).')
    }
  })

  it('odrzuca zbyt długie wartości', () => {
    const long = 'a'.repeat(MAX_CARD_TEXT_LEN + 1)
    const result = createCardFormSchema.safeParse({
      sourceText: long,
      targetText: long,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const expected = `Za długie (max ${MAX_CARD_TEXT_LEN} znaków).`
      const messages = result.error.issues.map((i) => i.message)
      expect(messages).toContain(expected)
    }
  })
})

describe('updateCardFormSchema', () => {
  it('akceptuje pusty obiekt', () => {
    const result = updateCardFormSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('akceptuje tylko jedno pole', () => {
    const r1 = updateCardFormSchema.safeParse({ sourceText: 'Hello' })
    const r2 = updateCardFormSchema.safeParse({ targetText: 'World' })
    expect(r1.success).toBe(true)
    expect(r2.success).toBe(true)
  })

  it('akceptuje oba pola i przycina', () => {
    const result = updateCardFormSchema.safeParse({
      sourceText: '  A ',
      targetText: ' B  ',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data?.sourceText).toBe('A')
      expect(result.data?.targetText).toBe('B')
    }
  })

  it('odrzuca puste po przycięciu, jeśli podane', () => {
    const result = updateCardFormSchema.safeParse({
      targetText: '   ',
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'targetText')
      expect(issue?.message).toBe('Wymagane (min 1 znak).')
    }
  })

  it('odrzuca zbyt długie, jeśli podane', () => {
    const long = 'a'.repeat(MAX_CARD_TEXT_LEN + 1)
    const result = updateCardFormSchema.safeParse({
      sourceText: long,
    })
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find((i) => i.path[0] === 'sourceText')
      expect(issue?.message).toBe(`Za długie (max ${MAX_CARD_TEXT_LEN} znaków).`)
    }
  })
})

describe('asercje typów formularzy', () => {
  it('LoginFormValues', () => {
    expectTypeOf<LoginFormValues>().toEqualTypeOf<{
      email: string
      password: string
    }>()
  })

  it('RegisterFormValues', () => {
    expectTypeOf<RegisterFormValues>().toEqualTypeOf<{
      email: string
      password: string
      confirmPassword: string
    }>()
  })

  it('ForgotPasswordFormValues', () => {
    expectTypeOf<ForgotPasswordFormValues>().toEqualTypeOf<{
      email: string
    }>()
  })

  it('UpdatePasswordFormValues', () => {
    expectTypeOf<UpdatePasswordFormValues>().toEqualTypeOf<{
      password: string
      confirmPassword: string
    }>()
  })

  it('CreateCardFormValues', () => {
    expectTypeOf<CreateCardFormValues>().toEqualTypeOf<{
      sourceText: string
      targetText: string
    }>()
  })

  it('UpdateCardFormValues', () => {
    expectTypeOf<UpdateCardFormValues>().toEqualTypeOf<{
      sourceText?: string
      targetText?: string
    }>()
  })
})


