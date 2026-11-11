import { afterEach, describe, expect, it, vi } from 'vitest'
import { createFakeAuthService } from '../../../src/player-identity/api/fakeAuthService'
import { failures } from '../../../src/player-identity/errors/failures'
import { fail, succeed } from '../../../src/player-identity/errors/result'
import { contractFixtures, describeAuthServiceContract, GOOGLE_EMAIL, GOOGLE_USERNAME } from './authServiceContract'

describeAuthServiceContract('fake adapter', (fixtures) =>
    createFakeAuthService({
        accounts: [fixtures.account],
        resetCode: fixtures.resetCode
    })
)

describe('fake adapter: what only the fake does', () => {
    const { account, resetCode } = contractFixtures
    const adaCredentials = { email: account.email, password: account.password }

    afterEach(() => {
        vi.useRealTimers()
    })

    it('answers only after the latency it was given', async () => {
        vi.useFakeTimers()
        const service = createFakeAuthService({ latencyMs: 200 })
        let hasAnswered = false

        const answer = service.fetchCurrentPlayer().then((result) => {
            hasAnswered = true
            return result
        })
        await vi.advanceTimersByTimeAsync(199)
        expect(hasAnswered).toBe(false)
        await vi.advanceTimersByTimeAsync(1)

        expect(hasAnswered).toBe(true)
        expect(await answer).toEqual(succeed(undefined))
    })

    it('fails the next call with the failure it was given, changes nothing, and works again after it', async () => {
        const service = createFakeAuthService({ accounts: [account] })
        service.failNextCall(failures.networkUnreachable)

        expect(await service.logIn(adaCredentials)).toEqual(fail(failures.networkUnreachable))
        expect(await service.fetchCurrentPlayer()).toEqual(succeed(undefined)) // the failed log-in did not sign anyone in
        expect(await service.logIn(adaCredentials)).toEqual(
            succeed({
                username: account.username,
                email: account.email
            })
        )
    })

    it('tells an expired code from a wrong one', async () => {
        vi.useFakeTimers()
        const service = createFakeAuthService({ accounts: [account], resetCode, resetCodeLifetimeMs: 1_000 })
        await service.requestResetCode({ email: account.email })

        await vi.advanceTimersByTimeAsync(1_001)

        expect(await service.confirmResetCode({ code: resetCode })).toEqual(fail(failures.resetCodeExpired))
    })

    it('completes the profile of a person who came back from Google, and signs them in', async () => {
        const service = createFakeAuthService({ accounts: [account] })
        service.beginGoogleSignIn(GOOGLE_EMAIL)

        const completed = await service.completeGoogleProfile({ username: GOOGLE_USERNAME })

        expect(completed).toEqual(succeed({ username: GOOGLE_USERNAME, email: GOOGLE_EMAIL }))
        expect(await service.fetchCurrentPlayer()).toEqual(completed)
    })

    it('keeps the Google step open after a taken username, so another one can be tried', async () => {
        const service = createFakeAuthService({ accounts: [account] })
        service.beginGoogleSignIn(GOOGLE_EMAIL)

        expect(await service.completeGoogleProfile({ username: account.username })).toEqual(fail(failures.usernameAlreadyTaken))
        expect(await service.completeGoogleProfile({ username: GOOGLE_USERNAME })).toEqual(
            succeed({ username: GOOGLE_USERNAME, email: GOOGLE_EMAIL })
        )
    })

    it('does not let an account created through Google sign in with a password', async () => {
        const service = createFakeAuthService()
        service.beginGoogleSignIn(GOOGLE_EMAIL)
        await service.completeGoogleProfile({ username: GOOGLE_USERNAME })
        await service.logOut()

        expect(await service.logIn({ email: GOOGLE_EMAIL, password: '' })).toEqual(fail(failures.invalidCredentials))
    })

    it('does not share its accounts with another fake', async () => {
        const first = createFakeAuthService()
        const second = createFakeAuthService()

        await first.register({ username: 'grace', email: 'grace@example.com', password: 'another-horse-7' })

        expect(
            await second.logIn({
                email: 'grace@example.com',
                password: 'another-horse-7'
            })
        ).toEqual(fail(failures.invalidCredentials))
    })
})
