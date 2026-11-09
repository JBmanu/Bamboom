import { describe, expect, it, vi } from 'vitest'
import { inject } from 'vue'
import { HOME_PATH } from '../../src/app/router/appRoutes.ts'
import { authServiceKey, useSessionStore } from '../../src/player-identity/index.ts'
import { LOGIN_PATH } from '../../src/player-identity/routePaths.ts'
import { createServiceWithPlayerSignedIn } from '../utils/createServiceWithPlayerSignedIn.ts'
import { mountPlayer } from '../utils/mountPlayer.ts'

describe('session expiry in the app', () => {
    it('signs the person out and sends them to the login when the session expires mid-session', async () => {
        const { app, router } = await mountPlayer(HOME_PATH, { authService: await createServiceWithPlayerSignedIn() })
        const session = useSessionStore(app.config.globalProperties.$pinia)
        const authService = app.runWithContext(() => inject(authServiceKey))
        expect(session.isSignedIn).toBe(true) // precondition: the person starts inside

        // The only call of the port that can say "session expired" today: a Google sign-up that is no longer pending.
        await authService?.completeGoogleProfile({ username: 'ada_g' })

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(LOGIN_PATH))
        expect(session.status).toBe('signedOut')
    })
})
