import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { createFakeAuthService } from '../../../src/player-identity/api/fakeAuthService.ts'
import { createFailure } from '../../../src/player-identity/errors/failures.ts'
import { restoreSession } from '../../../src/player-identity/stores/restoreSession.ts'
import { useSessionStore, sessionStatuses } from '../../../src/player-identity/stores/useSessionStore.ts'
import { contractFixtures } from '../api/authServiceContract.ts'

describe('restoreSession', () => {
    const { account } = contractFixtures
    const ada = { username: account.username, email: account.email }

    beforeEach(() => {
        setActivePinia(createPinia())
    })

    it('starts the session of the player the server says is signed in', async () => {
        const authService = createFakeAuthService({ accounts: [account] })
        await authService.logIn({ email: account.email, password: account.password })
        const session = useSessionStore()

        await restoreSession(authService, session)

        expect(session.status).toBe(sessionStatuses.signedIn)
        expect(session.player).toEqual(ada)
    })

    it('ends up signed out when the server says nobody is signed in', async () => {
        const session = useSessionStore()

        await restoreSession(createFakeAuthService({ accounts: [account] }), session)

        expect(session.status).toBe(sessionStatuses.signedOut)
        expect(session.player).toBeUndefined()
    })

    it.each(['network-unreachable', 'request-timeout', 'server-failure', 'unexpected-response'] as const)(
        'ends up signed out, without rejecting, when the server fails with %s',
        async (code) => {
            const authService = createFakeAuthService({ accounts: [account] })
            authService.failNextCall(createFailure(code))
            const session = useSessionStore()

            await expect(restoreSession(authService, session)).resolves.toBeUndefined()

            expect(session.status).toBe(sessionStatuses.signedOut)
        }
    )

    it('keeps restoring until the server has answered', async () => {
        const session = useSessionStore()

        const restoration = restoreSession(createFakeAuthService(), session)
        expect(session.status).toBe(sessionStatuses.restoring)

        await restoration
        expect(session.status).toBe(sessionStatuses.signedOut)
    })
})
