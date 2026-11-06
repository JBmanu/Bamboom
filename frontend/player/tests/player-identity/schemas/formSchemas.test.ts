import { describe, expect, it } from 'vitest'
import { fail, succeed } from '../../../src/player-identity/errors/result'
import { formSchemas } from '../../../src/player-identity/schemas/formSchemas'
import { validateInput } from '../../../src/player-identity/schemas/validateInput'

const validEmail = 'ada@example.com'
const validPassword = 'correct-horse-9'

/** The failure of one invalid field, as the screen receives it. */
const invalidField = (field: string, messageKey: string, values: Record<string, number> = {}) =>
    fail({
        kind: 'validation',
        fieldMessages: { [field]: { key: `playerIdentity.validation.${messageKey}`, values } }
    })

describe('email (checked in the log-in form)', () => {
    it.each([
        ['', 'required'],
        ['   ', 'required'],
        ['ada', 'emailInvalid'],
        ['ada@', 'emailInvalid'],
        ['@example.com', 'emailInvalid'],
        ['ada lovelace@example.com', 'emailInvalid']
    ])('rejects "%s" with %s', (email, messageKey) => {
        expect(
            validateInput(formSchemas.logIn, {
                email,
                password: validPassword
            })
        ).toEqual(invalidField('email', messageKey))
    })

    it('accepts a valid address', () => {
        expect(validateInput(formSchemas.logIn, { email: validEmail, password: validPassword }).ok).toBe(true)
    })
})

describe('log-in password', () => {
    it('only has to be present: a short or old password must still be able to log in', () => {
        expect(validateInput(formSchemas.logIn, { email: validEmail, password: 'x' })).toEqual(succeed({ email: validEmail, password: 'x' }))
    })

    it('is required', () => {
        expect(
            validateInput(formSchemas.logIn, {
                email: validEmail,
                password: ''
            })
        ).toEqual(invalidField('password', 'required'))
    })
})

describe('username (checked in the registration form)', () => {
    it.each(['ada', 'ada_lovelace', 'A1_b2', 'a'.repeat(20)])('accepts "%s"', (username) => {
        expect(
            validateInput(formSchemas.register, {
                username,
                email: validEmail,
                password: validPassword
            }).ok
        ).toBe(true)
    })

    it.each([
        ['', 'required', {}],
        ['   ', 'required', {}],
        ['ab', 'usernameTooShort', { minimum: 3 }],
        ['a'.repeat(21), 'usernameTooLong', { maximum: 20 }],
        ['ada lovelace', 'usernameCharacters', {}],
        ['ada-lovelace', 'usernameCharacters', {}],
        ['àda', 'usernameCharacters', {}]
    ])('rejects "%s" with %s', (username, messageKey, values) => {
        expect(validateInput(formSchemas.register, { username, email: validEmail, password: validPassword })).toEqual(
            invalidField('username', messageKey, values)
        )
    })

    it('trims the spaces around it', () => {
        const result = validateInput(formSchemas.register, {
            username: ' ada ',
            email: validEmail,
            password: validPassword
        })

        expect(result).toEqual(succeed({ username: 'ada', email: validEmail, password: validPassword }))
    })
})

describe('new password (checked in the registration form)', () => {
    it.each(['abcdefgh', 'a'.repeat(128), '  spaces are fine  '])('accepts "%s" and keeps it as typed', (password) => {
        expect(validateInput(formSchemas.register, { username: 'ada', email: validEmail, password })).toEqual(
            succeed({ username: 'ada', email: validEmail, password })
        )
    })

    it.each([
        ['', 'required', {}],
        ['abcdefg', 'passwordTooShort', { minimum: 8 }],
        ['a'.repeat(129), 'passwordTooLong', { maximum: 128 }]
    ])('rejects "%s" with %s', (password, messageKey, values) => {
        expect(validateInput(formSchemas.register, { username: 'ada', email: validEmail, password })).toEqual(
            invalidField('password', messageKey, values)
        )
    })
})

describe('code request form', () => {
    it('asks for the email only', () => {
        expect(validateInput(formSchemas.codeRequest, { email: validEmail })).toEqual(succeed({ email: validEmail }))
    })

    it('rejects an invalid email', () => {
        expect(validateInput(formSchemas.codeRequest, { email: 'ada' })).toEqual(invalidField('email', 'emailInvalid'))
    })
})

describe('reset code', () => {
    it.each(['123456', '000000', ' 123456 '])('accepts "%s"', (code) => {
        expect(validateInput(formSchemas.codeConfirmation, { code })).toEqual(succeed({ code: code.trim() }))
    })

    it.each(['', '12345', '1234567'])('rejects "%s" for its length', (code) => {
        expect(validateInput(formSchemas.codeConfirmation, { code })).toEqual(invalidField('code', 'codeLength', { length: 6 }))
    })

    it.each(['12345a', '12 456', '١٢٣٤٥٦'])('rejects "%s" for its characters', (code) => {
        expect(validateInput(formSchemas.codeConfirmation, { code })).toEqual(invalidField('code', 'codeDigitsOnly'))
    })
})

describe('password reset form', () => {
    it('accepts a password repeated correctly', () => {
        const values = { password: validPassword, passwordConfirmation: validPassword }

        expect(validateInput(formSchemas.passwordReset, values)).toEqual(succeed(values))
    })

    it('puts the mismatch under the confirmation field', () => {
        const result = validateInput(formSchemas.passwordReset, {
            password: validPassword,
            passwordConfirmation: 'something-else-1'
        })

        expect(result).toEqual(invalidField('passwordConfirmation', 'passwordConfirmationMismatch'))
    })

    it('asks for the confirmation before comparing it', () => {
        const result = validateInput(formSchemas.passwordReset, { password: validPassword, passwordConfirmation: '' })

        expect(result).toEqual(invalidField('passwordConfirmation', 'required'))
    })

    it('applies the password rules to the new password', () => {
        const result = validateInput(formSchemas.passwordReset, { password: 'short', passwordConfirmation: 'short' })

        expect(result).toEqual(invalidField('password', 'passwordTooShort', { minimum: 8 }))
    })
})

describe('Google profile form', () => {
    it('applies the username rules of the registration', () => {
        expect(validateInput(formSchemas.googleProfile, { username: 'ada_lovelace' }).ok).toBe(true)
        expect(validateInput(formSchemas.googleProfile, { username: 'ab' })).toEqual(invalidField('username', 'usernameTooShort', { minimum: 3 }))
    })
})
