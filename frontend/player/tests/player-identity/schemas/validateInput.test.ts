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
        const result = validateInput(formSchemas.register, {
            username: 'a!',
            email: 'ada@example.com',
            password: 'correct-horse-9'
        })

        expect(result).toEqual(fail({
            kind: 'validation',
            fieldMessageKeys: { username: 'playerIdentity.validation.usernameTooShort' }
        }))
    })

    it('lists only the invalid fields', () => {
        const result = validateInput(formSchemas.logIn, { email: 'ada@example.com', password: '' })

        expect(result).toEqual(fail({
            kind: 'validation',
            fieldMessageKeys: { password: 'playerIdentity.validation.required' }
        }))
    })

    it('reports every invalid field at once', () => {
        const result = validateInput(formSchemas.register, { username: '', email: 'ada', password: 'short' })

        expect(result).toEqual(
            fail({
                kind: 'validation',
                fieldMessageKeys: {
                    username: 'playerIdentity.validation.required',
                    email: 'playerIdentity.validation.emailInvalid',
                    password: 'playerIdentity.validation.passwordTooShort'
                }
            })
        )
    })

    it('treats a missing field as required', () => {
        const withoutPassword = { email: 'ada@example.com' } as never // the types forbid this shape: a form can still produce it

        expect(validateInput(formSchemas.logIn, withoutPassword)).toEqual(
            fail({ kind: 'validation', fieldMessageKeys: { password: 'playerIdentity.validation.required' } })
        )
    })

    it('only names the fields of the schema it was given', () => {
        const result = validateInput(formSchemas.logIn, { email: '', password: '' })

        if (!result.ok) expectTypeOf(result.failure.fieldMessageKeys).toEqualTypeOf<Readonly<Partial<Record<'email' | 'password', string>>>>()
    })
})
