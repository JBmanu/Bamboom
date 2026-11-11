import { describe, expectTypeOf, it } from 'vitest'
import type { AuthService, NewPasswordInput, Player } from '../../../src/player-identity/api/authService'
import type { Result } from '../../../src/player-identity/errors/result'
import type { ValidationFailure } from '../../../src/player-identity/errors/validationFailure'
import { FormValues } from '../../../src/player-identity/schemas/formSchemas.ts'

// These tests are checked by `npm run type-check`: nothing in them runs, the types are the contract.

type Method = (...parameters: never[]) => Promise<Result<unknown, unknown>>
type FailureOf<Called extends Method> = Extract<Awaited<ReturnType<Called>>, { ok: false }>['failure']
type ValueOf<Called extends Method> = Extract<Awaited<ReturnType<Called>>, { ok: true }>['value']
/** The codes of the failures of the catalog that a method can end with. */
type CodesOf<Called extends Method> = Extract<FailureOf<Called>, { code: string }>['code']
type ValidationOf<Called extends Method> = Extract<FailureOf<Called>, { kind: 'validation' }>

// Written out on purpose: if the port loses one of them, this must say so.
type ConnectionCodes = 'network-unreachable' | 'request-timeout' | 'server-failure' | 'unexpected-response'

describe('AuthService: what each method answers', () => {
    it('fetchCurrentPlayer answers a player or nobody, and fails only on the connection', () => {
        expectTypeOf<ValueOf<AuthService['fetchCurrentPlayer']>>().toEqualTypeOf<Player | undefined>()
        expectTypeOf<CodesOf<AuthService['fetchCurrentPlayer']>>().toEqualTypeOf<ConnectionCodes>()
    })

    it('logIn does not tell a wrong email from a wrong password', () => {
        expectTypeOf<ValueOf<AuthService['logIn']>>().toEqualTypeOf<Player>()
        expectTypeOf<CodesOf<AuthService['logIn']>>().toEqualTypeOf<'invalid-credentials' | 'too-many-attempts' | ConnectionCodes>()
        expectTypeOf<ValidationOf<AuthService['logIn']>>().toBeNever()
    })

    it('register can be refused for a taken email or username, or by the server validation', () => {
        expectTypeOf<ValueOf<AuthService['register']>>().toEqualTypeOf<Player>()
        expectTypeOf<CodesOf<AuthService['register']>>().toEqualTypeOf<
            'email-already-registered' | 'username-already-taken' | 'too-many-attempts' | ConnectionCodes
        >()
        expectTypeOf<ValidationOf<AuthService['register']>>().toEqualTypeOf<ValidationFailure<'username' | 'email' | 'password'>>()
    })

    it('logOut answers nothing and fails only on the connection', () => {
        expectTypeOf<ValueOf<AuthService['logOut']>>().toBeVoid()
        expectTypeOf<CodesOf<AuthService['logOut']>>().toEqualTypeOf<ConnectionCodes>()
    })

    it('requestResetCode can only be limited: it never tells whether the email exists', () => {
        expectTypeOf<CodesOf<AuthService['requestResetCode']>>().toEqualTypeOf<'too-many-attempts' | ConnectionCodes>()
    })

    it('confirmResetCode can refuse a wrong or an expired code', () => {
        expectTypeOf<CodesOf<AuthService['confirmResetCode']>>().toEqualTypeOf<
            'reset-code-invalid' | 'reset-code-expired' | 'too-many-attempts' | ConnectionCodes
        >()
    })

    it('setNewPassword needs the code to have been confirmed', () => {
        expectTypeOf<CodesOf<AuthService['setNewPassword']>>().toEqualTypeOf<'reset-not-confirmed' | ConnectionCodes>()
        expectTypeOf<ValidationOf<AuthService['setNewPassword']>>().toEqualTypeOf<ValidationFailure<'password'>>()
    })

    it('completeGoogleProfile can find the username taken or the Google step expired', () => {
        expectTypeOf<ValueOf<AuthService['completeGoogleProfile']>>().toEqualTypeOf<Player>()
        expectTypeOf<CodesOf<AuthService['completeGoogleProfile']>>().toEqualTypeOf<'username-already-taken' | 'session-expired' | ConnectionCodes>()
        expectTypeOf<ValidationOf<AuthService['completeGoogleProfile']>>().toEqualTypeOf<ValidationFailure<'username'>>()
    })
})

describe('AuthService: what each method receives', () => {
    it('has the trimmed values that each form hands over', () => {
        expectTypeOf<FormValues['logIn']>().toEqualTypeOf<{ email: string; password: string }>()
        expectTypeOf<FormValues['register']>().toEqualTypeOf<{ username: string; email: string; password: string }>()
        expectTypeOf<FormValues['codeRequest']>().toEqualTypeOf<{ email: string }>()
        expectTypeOf<FormValues['codeConfirmation']>().toEqualTypeOf<{ code: string }>()
        expectTypeOf<FormValues['passwordReset']>().toEqualTypeOf<{ password: string; passwordConfirmation: string }>()
        expectTypeOf<FormValues['googleProfile']>().toEqualTypeOf<{ username: string }>()
    })

    it('never receives the repeated password', () => {
        expectTypeOf<NewPasswordInput>().toEqualTypeOf<{ password: string }>()
    })

    it('describes a player by username and email', () => {
        expectTypeOf<Player>().toEqualTypeOf<{ readonly username: string; readonly email: string }>()
    })
})
