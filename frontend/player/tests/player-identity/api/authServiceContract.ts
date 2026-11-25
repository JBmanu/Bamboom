import { beforeEach, describe, expect, it } from 'vitest'
import { type AuthService, googleSignInStatuses } from '../../../src/player-identity/api/authService.ts'
import { failures } from '../../../src/player-identity/errors/failures.ts'
import { fail, succeed } from '../../../src/player-identity/errors/result.ts'

export type ContractFixtures = {
    /** An account that exists before the test starts. */
    readonly account: { readonly username: string; readonly email: string; readonly password: string }
    /** The code the adapter sends for a password reset. */
    readonly resetCode: string
    /** The email Google hands back when the adapter takes the person to Google. */
    readonly googleEmail: string
}

/**
 * Every method of the port. `satisfies` makes a new method break the build
 * until it is listed here, so adapter and decorator tests never miss it.
 */
export const portMethodNames = Object.keys({
    fetchCurrentPlayer: true,
    logIn: true,
    register: true,
    logOut: true,
    requestResetCode: true,
    confirmResetCode: true,
    setNewPassword: true,
    completeGoogleProfile: true,
    continueWithGoogle: true,
    fetchPendingGoogleProfile: true,
    cancelGoogleProfile: true
} satisfies Record<keyof AuthService, true>) as (keyof AuthService)[]

export const contractFixtures: ContractFixtures = {
    account: { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' },
    resetCode: '123456',
    googleEmail: 'ada.google@example.com'
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

/**
 * What every AuthService must do, whoever implements it: the fake adapter now, the HTTP adapter on the day of the backend.
 * The adapter is built with `createService`, which must give it the fixtures as the state it starts from.
 */
export function describeAuthServiceContract(adapterName: string, createService: (fixtures: ContractFixtures) => AuthService) {
    describe(`AuthService contract: ${adapterName}`, () => {
        const { account, resetCode, googleEmail } = contractFixtures
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
            it('signs in with the email written in other letter case, and answers with the registered one', async () => {
                const upperCaseCredentials = { email: account.email.toUpperCase(), password: account.password }
                expect(await service.logIn(upperCaseCredentials)).toEqual(succeed(ada))
            })

            it('counts the failed attempts of an email whatever its letter case', async () => {
                const answers = []
                for (let attempt = 0; attempt < MOST_FAILED_LOG_INS_TO_TRY; attempt++) {
                    const credentials = {
                        email: attempt % 2 === 0 ? wrongPasswordCredentials.email : wrongPasswordCredentials.email.toUpperCase(),
                        password: wrongPasswordCredentials.password
                    }
                    answers.push(await service.logIn(credentials))
                }

                expect(answers).toContainEqual(fail(failures.tooManyAttempts))
                expect(await service.logIn(adaCredentials)).toEqual(fail(failures.tooManyAttempts))
                expect(await service.fetchCurrentPlayer()).toEqual(succeed(undefined))
            })
        })

        describe('registration', () => {
            const newcomer = { username: 'grace', email: 'grace@example.com', password: 'another-horse-7' }
            const newcomerWithCapitals = {
                username: newcomer.username.toUpperCase(),
                email: newcomer.email.toUpperCase(),
                password: newcomer.password
            }

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

            it('refuses an email that differs from a registered one only by letter case', async () => {
                expect(
                    await service.register({
                        ...newcomer,
                        email: account.email.toUpperCase()
                    })
                ).toEqual(fail(failures.emailAlreadyRegistered))
            })

            it('refuses a username that differs from a registered one only by letter case', async () => {
                expect(
                    await service.register({
                        ...newcomer,
                        username: account.username.toUpperCase()
                    })
                ).toEqual(fail(failures.usernameAlreadyTaken))
            })

            it('signs in with the email in lower case after registering it with capital letters', async () => {
                await service.register(newcomerWithCapitals)
                await service.logOut()
                expect(await service.logIn({ email: newcomer.email, password: newcomer.password })).toEqual(
                    succeed({ username: 'GRACE', email: 'grace@example.com' })
                )
            })

            it('refuses a username that differs from one registered with capital letters only by letter case', async () => {
                await service.register(newcomerWithCapitals) // GRACE, stored as typed
                expect(await service.register({ ...newcomer, email: 'other@example.com' })) // grace, free email
                    .toEqual(fail(failures.usernameAlreadyTaken))
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

            it('when the same email asks for a code again right away, the request is refused', async () => {
                await service.requestResetCode({ email: account.email })

                expect(await service.requestResetCode({ email: account.email })).toEqual(fail(failures.tooManyAttempts))
            })

            it('when an unknown email asks again right away, the refusal is the same as for a registered one', async () => {
                await service.requestResetCode({ email: account.email })
                await service.requestResetCode({ email: UNKNOWN_EMAIL })

                const registered = await service.requestResetCode({ email: account.email })
                const unknown = await service.requestResetCode({ email: UNKNOWN_EMAIL })

                expect(unknown).toEqual(registered)
                expect(registered).toEqual(fail(failures.tooManyAttempts))
            })

            it('when a typo is corrected right away with another email, the request is accepted', async () => {
                await service.requestResetCode({ email: UNKNOWN_EMAIL })

                expect(await service.requestResetCode({ email: account.email })).toEqual(succeed(undefined))
            })

            it('when a request is refused for coming too soon, the code already sent still works', async () => {
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

        describe('Google sign-in', () => {
            it('when nothing is pending, completing the profile ends with a session expired', async () => {
                expect(await service.completeGoogleProfile({ username: GOOGLE_USERNAME })).toEqual(fail(failures.sessionExpired))
            })

            it('when nobody is waiting to complete a Google profile, asking for it answers nobody, not a failure', async () => {
                expect(await service.fetchPendingGoogleProfile()).toEqual(succeed(undefined))
            })

            it('when Google brings an email with no account, the person has a profile to complete holding that email', async () => {
                expect(await service.continueWithGoogle()).toEqual(succeed({ status: googleSignInStatuses.profileToComplete }))
                expect(await service.fetchPendingGoogleProfile()).toEqual(succeed({ email: googleEmail }))
            })

            it('when Google brings the email of an existing account, the person is signed in as that account', async () => {
                await service.register({ username: GOOGLE_USERNAME, email: googleEmail, password: account.password })
                await service.logOut()

                const knownPlayer = { username: GOOGLE_USERNAME, email: googleEmail }
                expect(await service.continueWithGoogle()).toEqual(
                    succeed({
                        status: googleSignInStatuses.signedIn,
                        player: knownPlayer
                    })
                )
                expect(await service.fetchCurrentPlayer()).toEqual(succeed(knownPlayer))
            })

            it('when the person chooses a free nickname, they are signed in and nothing is left pending', async () => {
                await service.continueWithGoogle()
                const completed = await service.completeGoogleProfile({ username: GOOGLE_USERNAME })
                const googlePlayer = { username: GOOGLE_USERNAME, email: googleEmail }

                expect(completed).toEqual(succeed(googlePlayer))
                expect(await service.fetchCurrentPlayer()).toEqual(succeed(googlePlayer))
                expect(await service.fetchPendingGoogleProfile()).toEqual(succeed(undefined))
            })

            it('when the nickname is taken, even with other letter case, the profile stays pending so another one can be tried', async () => {
                await service.continueWithGoogle()
                const refused = await service.completeGoogleProfile({ username: account.username.toUpperCase() })

                expect(refused).toEqual(fail(failures.usernameAlreadyTaken))
                expect(await service.fetchPendingGoogleProfile()).toEqual(succeed({ email: googleEmail }))
                expect(await service.completeGoogleProfile({ username: GOOGLE_USERNAME })).toEqual(
                    succeed({
                        username: GOOGLE_USERNAME,
                        email: googleEmail
                    })
                )
            })

            it('when the person cancels the pending profile, nothing is left pending and completing it is refused', async () => {
                await service.continueWithGoogle()

                expect(await service.fetchPendingGoogleProfile()).toEqual(succeed({ email: googleEmail }))
                expect(await service.cancelGoogleProfile()).toEqual(succeed(undefined))
                expect(await service.fetchPendingGoogleProfile()).toEqual(succeed(undefined))
                expect(await service.completeGoogleProfile({ username: GOOGLE_USERNAME })).toEqual(fail(failures.sessionExpired))
            })

            it('when nothing is pending, cancelling is not a failure', async () => {
                expect(await service.cancelGoogleProfile()).toEqual(succeed(undefined))
            })

            it('when an account was created through Google, logging in with a password is refused', async () => {
                await service.continueWithGoogle()
                expect(await service.completeGoogleProfile({ username: GOOGLE_USERNAME })).toEqual(
                    succeed({
                        username: GOOGLE_USERNAME,
                        email: googleEmail
                    })
                )

                await service.logOut()
                expect(
                    await service.logIn({
                        email: googleEmail,
                        password: WRONG_PASSWORD
                    })
                ).toEqual(fail(failures.invalidCredentials))
            })
        })
    })
}
