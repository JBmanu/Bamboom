import { createMemoryHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { createPlayerRouter } from '../../../src/app/router/createPlayerRouter'
import { AUTH_LAYOUT_PATH, LOGIN_PATH, REGISTER_PATH } from '../../../src/player-identity/routePaths.ts'
import { HOME_PATH } from '../../../src/app/router/appRoutes.ts'

const NOT_FOUND_ROUTE_NAME = 'notFound'
const accessPages = [LOGIN_PATH, REGISTER_PATH]

function createRouterFor(session: { isSignedIn: boolean }) {
    return createPlayerRouter({ history: createMemoryHistory(), session, whenSessionRestored: () => Promise.resolve() })
}

describe('createPlayerRouter', () => {
    it('sends a signed-out person who opens the home to the login', async () => {
        const router = createRouterFor({ isSignedIn: false })
        await router.push(HOME_PATH)

        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
    })

    it.each(accessPages)('lets a signed-out person stay on %s', async (path) => {
        const router = createRouterFor({ isSignedIn: false })
        await router.push(path)

        expect(router.currentRoute.value.path).toBe(path)
    })

    it.each(accessPages)('sends a signed-in person who opens %s to the home', async (path) => {
        const router = createRouterFor({ isSignedIn: true })
        await router.push(path)

        expect(router.currentRoute.value.path).toBe(HOME_PATH)
    })

    it('lets a signed-in person stay on the home', async () => {
        const router = createRouterFor({ isSignedIn: true })
        await router.push(HOME_PATH)

        expect(router.currentRoute.value.path).toBe(HOME_PATH)
    })

    it.each([false, true])('shows the not-found page for an unknown address (signed in: %s)', async (isSignedIn) => {
        const router = createRouterFor({ isSignedIn })
        await router.push('/nowhere/at/all')

        expect(router.currentRoute.value.name).toBe(NOT_FOUND_ROUTE_NAME)
    })

    it('leads the address of the access layout itself to the login, never to a blank page', async () => {
        const router = createRouterFor({ isSignedIn: false })
        await router.push(AUTH_LAYOUT_PATH)

        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
    })
})
