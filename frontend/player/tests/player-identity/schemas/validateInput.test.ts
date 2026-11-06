import { describe, expect, expectTypeOf, it } from 'vitest'
import { fail, succeed } from '../../../src/player-identity/errors/result'
import { formSchemas } from '../../../src/player-identity/schemas/formSchemas'
import { validateInput } from '../../../src/player-identity/schemas/validateInput'

describe('validateInput', () => {
    it('returns the parsed values as a success, with the text fields trimmed', () => {
        const result = validateInput(formSchemas.logIn, { email: '  ada@example.com ', password: 'secret' })

        expect(result).toEqual(succeed({ email: 'ada@example.com', password: 'secret' }))
    })

    it('keeps only the first message of a field that breaks several rules', () => {
        const result = validateInput(formSchemas.register, { username: 'a!', email: 'ada@example.com', password: 'correct-horse-9' })

        expect(result).toEqual(
            fail({
                kind: 'validation',
                fieldMessages: { username: { key: 'playerIdentity.validation.usernameTooShort', values: { minimum: 3 } } }
            })
        )
    })

    it('lists only the invalid fields', () => {
        const result = validateInput(formSchemas.logIn, { email: 'ada@example.com', password: '' })

        expect(result).toEqual(fail({ kind: 'validation', fieldMessages: { password: { key: 'playerIdentity.validation.required', values: {} } } }))
    })

    it('reports every invalid field at once', () => {
        const result = validateInput(formSchemas.register, { username: '', email: 'ada', password: 'short' })

        expect(result).toEqual(
            fail({
                kind: 'validation',
                fieldMessages: {
                    username: { key: 'playerIdentity.validation.required', values: {} },
                    email: { key: 'playerIdentity.validation.emailInvalid', values: {} },
                    password: { key: 'playerIdentity.validation.passwordTooShort', values: { minimum: 8 } }
                }
            })
        )
    })

    it('carries the number of the rule that was broken: minimum, maximum or exact length', () => {
        const tooShort = validateInput(formSchemas.register, { username: 'ab', email: 'ada@example.com', password: 'correct-horse-9' })
        const tooLong = validateInput(formSchemas.register, { username: 'a'.repeat(21), email: 'ada@example.com', password: 'correct-horse-9' })
        const wrongLength = validateInput(formSchemas.codeConfirmation, { code: '123' })

        expect(!tooShort.ok && tooShort.failure.fieldMessages.username?.values).toEqual({ minimum: 3 })
        expect(!tooLong.ok && tooLong.failure.fieldMessages.username?.values).toEqual({ maximum: 20 })
        expect(!wrongLength.ok && wrongLength.failure.fieldMessages.code?.values).toEqual({ length: 6 })
    })

    it('treats a missing field as required', () => {
        const withoutPassword = { email: 'ada@example.com' } as never // the types forbid this shape: a form can still produce it

        expect(validateInput(formSchemas.logIn, withoutPassword)).toEqual(
            fail({ kind: 'validation', fieldMessages: { password: { key: 'playerIdentity.validation.required', values: {} } } })
        )
    })

    it('only names the fields of the schema it was given', () => {
        const result = validateInput(formSchemas.logIn, { email: '', password: '' })

        if (!result.ok) expectTypeOf<keyof typeof result.failure.fieldMessages>().toEqualTypeOf<'email' | 'password'>()
    })
})
