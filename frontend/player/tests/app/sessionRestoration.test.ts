import { describe, expect, it, vi } from 'vitest'
import { inject } from 'vue'
import { HOME_PATH } from '../../src/app/router/appRoutes.ts'
import { createFakeAuthService } from '../../src/player-identity/api/fakeAuthService.ts'
import { createFailure } from '../../src/player-identity/errors/failures.ts'
import { authServiceKey } from '../../src/player-identity/index.ts'
import { LOGIN_PATH } from '../../src/player-identity/routePaths.ts'
import { contractFixtures } from '../player-identity/api/authServiceContract.ts'
import { mountPlayer } from '../utils/mountPlayer.ts'

const { account } = contractFixtures

async function createServiceWithPlayerSignedIn() {
    const authService = createFakeAuthService({ accounts: [account] })
    await authService.logIn({ email: account.email, password: account.password })
    return authService
}

describe('session restoration at startup', () => {
    it('opens the page asked for when the server says someone is signed in', async () => {
        const { router } = await mountPlayer(HOME_PATH, { authService: await createServiceWithPlayerSignedIn() })

        expect(router.currentRoute.value.path).toBe(HOME_PATH)
    })

    it('sends the person to the login when nobody is signed in', async () => {
        const { router } = await mountPlayer(HOME_PATH, { authService: createFakeAuthService({ accounts: [account] }) })

        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
    })

    it('sends the person to the login when the server cannot be reached', async () => {
        const authService = await createServiceWithPlayerSignedIn()
        authService.failNextCall(createFailure('network-unreachable'))
        const { router } = await mountPlayer(HOME_PATH, { authService })

        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
    })

    it('sends a person who is already signed in away from the login', async () => {
        const { router } = await mountPlayer(LOGIN_PATH, { authService: await createServiceWithPlayerSignedIn() })

        expect(router.currentRoute.value.path).toBe(HOME_PATH)
    })

    it('asks the server who is signed in only once, however many pages the person visits', async () => {
        const authService = await createServiceWithPlayerSignedIn()
        const fetchCurrentPlayer = vi.spyOn(authService, 'fetchCurrentPlayer')
        const { router } = await mountPlayer(HOME_PATH, { authService })

        await router.push('/nowhere')
        await router.push(HOME_PATH)

        expect(fetchCurrentPlayer).toHaveBeenCalledTimes(1)
    })
})

describe('AuthService in the app', () => {
    it('provides the given service to the components', async () => {
        const authService = createFakeAuthService()
        const { app } = await mountPlayer(HOME_PATH, { authService })

        expect(app.runWithContext(() => inject(authServiceKey))).toBe(authService)
    })
})
