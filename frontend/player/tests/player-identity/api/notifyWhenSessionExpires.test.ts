import { describe, expect, it, vi } from 'vitest'
import type { AuthService } from '../../../src/player-identity/api/authService.ts'
import { createFakeAuthService } from '../../../src/player-identity/api/fakeAuthService.ts'
import { notifyWhenSessionExpires } from '../../../src/player-identity/api/notifyWhenSessionExpires.ts'
import { failures } from '../../../src/player-identity/errors/failures.ts'
import { fail, succeed } from '../../../src/player-identity/errors/result.ts'
import { contractFixtures, portMethodNames } from './authServiceContract.ts'

const { account } = contractFixtures

/** A service whose every method answers "session expired", as an HTTP call that gets a 401 will. */
function createServiceAlwaysExpired(): AuthService {
    const answerExpired = async () => fail(failures.sessionExpired)
    const methods = Object.fromEntries(portMethodNames.map((name) => [name, answerExpired]))
    return methods as unknown as AuthService
}

describe('notifyWhenSessionExpires', () => {
    it('passes a success through without notifying', async () => {
        const onSessionExpired = vi.fn()
        const authService = notifyWhenSessionExpires(createFakeAuthService({ accounts: [account] }), onSessionExpired)

        const answer = await authService.logIn({ email: account.email, password: account.password })

        expect(answer).toEqual(succeed({ username: account.username, email: account.email }))
        expect(onSessionExpired).not.toHaveBeenCalled()
    })

    it('passes any other failure through without notifying', async () => {
        const onSessionExpired = vi.fn()
        const authService = notifyWhenSessionExpires(createFakeAuthService({ accounts: [account] }), onSessionExpired)

        const answer = await authService.logIn({ email: account.email, password: 'not-the-password' })

        expect(answer).toEqual(fail(failures.invalidCredentials))
        expect(onSessionExpired).not.toHaveBeenCalled()
    })

    it('notifies once and passes the failure through unchanged when the session has expired', async () => {
        const onSessionExpired = vi.fn()
        const authService = notifyWhenSessionExpires(createFakeAuthService(), onSessionExpired)
        const answer = await authService.completeGoogleProfile({ username: 'ada_g' })

        expect(answer).toEqual(fail(failures.sessionExpired))
        expect(onSessionExpired).toHaveBeenCalledOnce()
    })

    it.each(portMethodNames)('watches %s', async (methodName) => {
        const onSessionExpired = vi.fn()
        const authService = notifyWhenSessionExpires(createServiceAlwaysExpired(), onSessionExpired)
        const callWithAnyInput = authService[methodName] as (input?: unknown) => Promise<unknown>

        await callWithAnyInput(undefined)

        expect(onSessionExpired).toHaveBeenCalledOnce()
    })
})
