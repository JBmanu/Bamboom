import { createMemoryHistory, createRouter, type Router } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { installAuthGuard } from '../../../src/player-identity/guards/installAuthGuard'
import { accessLevels } from '../../../src/player-identity/guards/routeAccess'
import { LOGIN_PATH } from '../../../src/player-identity/routePaths.ts'

const homePath = '/home'
const publicPagePath = '/public-page'

const emptyPage = { render: () => null }

function createGuardedRouter(session: { isSignedIn: boolean }, whenSessionRestored: () => Promise<void> = () => Promise.resolve()): Router {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: homePath, component: emptyPage }, // no access: closed by default
            { path: LOGIN_PATH, component: emptyPage, meta: { access: accessLevels.signedOutOnly } },
            { path: publicPagePath, component: emptyPage, meta: { access: accessLevels.anyone } }
        ]
    })
    installAuthGuard(router, { session, homePath, whenSessionRestored })
    return router
}

describe('installAuthGuard', () => {
    it('sends a signed-out person away from a page without access, which is closed by default', async () => {
        const router = createGuardedRouter({ isSignedIn: false })
        await router.push(homePath)

        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
    })

    it('sends a signed-in person away from a page for signed-out people only', async () => {
        const router = createGuardedRouter({ isSignedIn: true })
        await router.push(LOGIN_PATH)

        expect(router.currentRoute.value.path).toBe(homePath)
    })

    it.each([false, true])('lets anyone open a public page (signed in: %s)', async (isSignedIn) => {
        const router = createGuardedRouter({ isSignedIn })
        await router.push(publicPagePath)

        expect(router.currentRoute.value.path).toBe(publicPagePath)
    })

    it('waits for the session to be restored before deciding', async () => {
        const session = { isSignedIn: false }
        let finishRestoring!: () => void
        const restored = new Promise<void>((resolve) => {
            finishRestoring = resolve
        })
        const router = createGuardedRouter(session, () => restored)

        const navigation = router.push(homePath)
        session.isSignedIn = true // what the restored session says
        finishRestoring()
        await navigation

        expect(router.currentRoute.value.path).toBe(homePath)
    })
})
