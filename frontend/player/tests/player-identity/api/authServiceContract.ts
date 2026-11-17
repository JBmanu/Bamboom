import { beforeEach, describe, expect, it } from 'vitest'
import type { AuthService } from '../../../src/player-identity/api/authService.ts'
import { failures } from '../../../src/player-identity/errors/failures.ts'
import { fail, succeed } from '../../../src/player-identity/errors/result.ts'

export type ContractFixtures = {
    /** An account that exists before the test starts. */
    readonly account: { readonly username: string; readonly email: string; readonly password: string }
    /** The code the adapter sends for a password reset. */
    readonly resetCode: string
}

export const contractFixtures: ContractFixtures = {
    account: { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' },
    resetCode: '123456'
}

/** More wrong codes than any sensible limit allows: after this many, the reset must be blocked. */
const MOST_FAILED_LOG_INS_TO_TRY = 25
const MOST_WRONG_CODES_TO_TRY = 25
const WRONG_RESET_CODE = '000000'
const NEW_PASSWORD = 'brand-new-horse-1'
const OTHER_NEW_PASSWORD = 'yet-another-horse-2'
const WRONG_PASSWORD = 'not-the-password'
const UNKNOWN_EMAIL = 'nobody@example.com'
export const GOOGLE_USERNAME = 'ada_g'
export const GOOGLE_EMAIL = 'ada.google@example.com'

/**
 * What every AuthService must do, whoever implements it: the fake adapter now, the HTTP adapter on the day of the backend.
 * The adapter is built with `createService`, which must give it the fixtures as the state it starts from.
 */
export function describeAuthServiceContract(adapterName: string, createService: (fixtures: ContractFixtures) => AuthService) {
    describe(`AuthService contract: ${adapterName}`, () => {
        const { account, resetCode } = contractFixtures
        const ada = { username: account.username, email: account.email }
        const adaCredentials = { email: account.email, password: account.password }
        const wrongPasswordCredentials = { email: account.email, password: 'wrongPassword' }

        let service: AuthService

        beforeEach(() => {
            service = createService(contractFixtures)
        })

        describe('session', () => {
            it('starts with nobody signed in', async () => {
                expect(await service.fetchCurrentPlayer()).toEqual(succeed(undefined))
            })

            it('signs in with the right credentials and remembers who is signed in', async () => {
                expect(await service.logIn(adaCredentials)).toEqual(succeed(ada))
                expect(await service.fetchCurrentPlayer()).toEqual(succeed(ada))
            })

            it('refuses a wrong password and stays signed out', async () => {
                expect(
                    await service.logIn({
                        email: account.email,
                        password: WRONG_PASSWORD
                    })
                ).toEqual(fail(failures.invalidCredentials))
                expect(await service.fetchCurrentPlayer()).toEqual(succeed(undefined))
            })

            it('refuses an unknown email with the very same answer as a wrong password', async () => {
                const wrongPassword = await service.logIn({ email: account.email, password: WRONG_PASSWORD })
                const unknownEmail = await service.logIn({ email: UNKNOWN_EMAIL, password: account.password })

                expect(unknownEmail).toEqual(wrongPassword)
            })

            it('signs out, and signing out again is not a failure', async () => {
                await service.logIn(adaCredentials)

                expect(await service.logOut()).toEqual(succeed(undefined))
                expect(await service.fetchCurrentPlayer()).toEqual(succeed(undefined))
                expect(await service.logOut()).toEqual(succeed(undefined))
            })

            it('blocks the log-in after too many failed attempts, even with the right password', async () => {
                const answers = []
                for (let attempt = 0; attempt < MOST_FAILED_LOG_INS_TO_TRY; attempt++) {
                    answers.push(await service.logIn(wrongPasswordCredentials))
                }

                expect(answers).toContainEqual(fail(failures.tooManyAttempts))
                expect(await service.logIn(adaCredentials)).toEqual(fail(failures.tooManyAttempts))
                expect(await service.fetchCurrentPlayer()).toEqual(succeed(undefined))
            })

            it('blocks an unknown email just like a registered one, so the block never tells which emails exist', async () => {
                const answers = []
                for (let attempt = 0; attempt < MOST_FAILED_LOG_INS_TO_TRY; attempt++) {
                    answers.push(await service.logIn({ email: UNKNOWN_EMAIL, password: WRONG_PASSWORD }))
                }

                expect(answers).toContainEqual(fail(failures.tooManyAttempts))
            })
        })

        describe('registration', () => {
            const newcomer = { username: 'grace', email: 'grace@example.com', password: 'another-horse-7' }

            it('creates the account and signs the person in', async () => {
                expect(await service.register(newcomer)).toEqual(
                    succeed({
                        username: 'grace',
                        email: 'grace@example.com'
                    })
                )
                expect(await service.fetchCurrentPlayer()).toEqual(
                    succeed({
                        username: 'grace',
                        email: 'grace@example.com'
                    })
                )
            })

            it('lets the new account sign in again later', async () => {
                await service.register(newcomer)
                await service.logOut()

                expect(await service.logIn({ email: newcomer.email, password: newcomer.password })).toEqual(
                    succeed({ username: 'grace', email: 'grace@example.com' })
                )
            })

            it('refuses an email that is already registered', async () => {
                expect(
                    await service.register({
                        ...newcomer,
                        email: account.email
                    })
                ).toEqual(fail(failures.emailAlreadyRegistered))
            })

            it('refuses a username that is already taken', async () => {
                expect(
                    await service.register({
                        ...newcomer,
                        username: account.username
                    })
                ).toEqual(fail(failures.usernameAlreadyTaken))
            })
        })

        describe('password reset', () => {
            it('answers the request in the same way for a registered and for an unknown email', async () => {
                const registered = await service.requestResetCode({ email: account.email })
                const unknown = await service.requestResetCode({ email: UNKNOWN_EMAIL })

                expect(unknown).toEqual(registered)
                expect(registered).toEqual(succeed(undefined))
            })

            it('accepts the code that was sent', async () => {
                await service.requestResetCode({ email: account.email })

                expect(await service.confirmResetCode({ code: resetCode })).toEqual(succeed(undefined))
            })

            it('refuses a wrong code', async () => {
                await service.requestResetCode({ email: account.email })

                expect(await service.confirmResetCode({ code: WRONG_RESET_CODE })).toEqual(fail(failures.resetCodeInvalid))
            })

            it('refuses a code when no reset was requested', async () => {
                expect(await service.confirmResetCode({ code: resetCode })).toEqual(fail(failures.resetCodeInvalid))
            })

            it('gives an unknown email the same refusal as a wrong code, never a hint', async () => {
                await service.requestResetCode({ email: UNKNOWN_EMAIL })

                expect(await service.confirmResetCode({ code: resetCode })).toEqual(fail(failures.resetCodeInvalid))
            })

            it('blocks the reset after too many wrong codes, even for the right one', async () => {
                await service.requestResetCode({ email: account.email })
                const answers = []
                for (let attempt = 0; attempt < MOST_WRONG_CODES_TO_TRY; attempt++) {
                    answers.push(await service.confirmResetCode({ code: WRONG_RESET_CODE }))
                }

                expect(answers).toContainEqual(fail(failures.tooManyAttempts))
                expect(await service.confirmResetCode({ code: resetCode })).toEqual(fail(failures.tooManyAttempts))
            })

            it('does not accept a new password before the code is confirmed', async () => {
                await service.requestResetCode({ email: account.email })

                expect(await service.setNewPassword({ password: NEW_PASSWORD })).toEqual(fail(failures.resetNotConfirmed))
            })

            it('changes the password once the code is confirmed: the new one works, the old one does not', async () => {
                await service.requestResetCode({ email: account.email })
                await service.confirmResetCode({ code: resetCode })

                expect(await service.setNewPassword({ password: NEW_PASSWORD })).toEqual(succeed(undefined))
                expect(await service.logIn(adaCredentials)).toEqual(fail(failures.invalidCredentials))
                expect(await service.logIn({ email: account.email, password: NEW_PASSWORD })).toEqual(succeed(ada))
            })

            it('lets a confirmed reset be used only once', async () => {
                await service.requestResetCode({ email: account.email })
                await service.confirmResetCode({ code: resetCode })
                await service.setNewPassword({ password: NEW_PASSWORD })

                expect(await service.setNewPassword({ password: OTHER_NEW_PASSWORD })).toEqual(fail(failures.resetNotConfirmed))
            })
        })

        describe('Google profile', () => {
            it('has nothing to complete when the person did not come from Google', async () => {
                expect(await service.completeGoogleProfile({ username: GOOGLE_USERNAME })).toEqual(fail(failures.sessionExpired))
            })
        })
    })
}
