import { afterEach, describe, expect, it, vi } from 'vitest'
import { createApp } from 'vue'
import { authServiceKey, createFakeAuthService } from '../../src/player-identity'
import { fail } from '../../src/player-identity/errors/result.ts'
import { failures } from '../../src/player-identity/errors/failures.ts'
import { MISSING_AUTH_SERVICE_MESSAGE, useAuthService } from '../../src/player-identity/useAuthService'

describe('useAuthService', () => {
    /** An app with nothing provided: `useAuthService` runs inside it as it would in a component's setup. */
    const createAppWithoutProvide = () => createApp({})

    afterEach(() => vi.restoreAllMocks())

    it('gives the AuthService the app provided', () => {
        const fake = createFakeAuthService()
        const app = createAppWithoutProvide().provide(authServiceKey, fake)
        const receivedService = app.runWithContext(() => useAuthService())

        expect(receivedService).toBe(fake)
    })

    it('falls back to a service that always fails when the app provided none', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {})
        const fallbackService = createAppWithoutProvide().runWithContext(() => useAuthService())

        expect(await fallbackService.logIn({ email: 'ada@example.com', password: 'any' })).toEqual(fail(failures.serverFailure))
    })

    it('says in the console which wiring is missing', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {}) // records the calls, prints nothing
        createAppWithoutProvide().runWithContext(() => useAuthService())

        expect(consoleError).toHaveBeenCalledExactlyOnceWith(MISSING_AUTH_SERVICE_MESSAGE)
    })
})
