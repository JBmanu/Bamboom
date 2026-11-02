import { createMemoryHistory } from 'vue-router'
import { describe, expect, it } from 'vitest'
import { createPlayerRouter } from '../../../src/app/router/createPlayerRouter'

const NOT_FOUND_PATH = 'notFound'
const LOGIN_PATH = '/login'
const PRIVATE_PATH = '/'

function createRouterFor(session: { isSignedIn: boolean }) {
    return createPlayerRouter({ history: createMemoryHistory(), session, whenSessionRestored: () => Promise.resolve() })
}

describe('createPlayerRouter', () => {
    it('sends a signed-out person who opens the home to the login', async () => {
        const router = createRouterFor({ isSignedIn: false })
        await router.push(PRIVATE_PATH)

        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
    })

    it('lets a signed-out person stay on the login', async () => {
        const router = createRouterFor({ isSignedIn: false })
        await router.push(LOGIN_PATH)

        expect(router.currentRoute.value.path).toBe(LOGIN_PATH)
    })

    it('sends a signed-in person who opens the login to the home', async () => {
        const router = createRouterFor({ isSignedIn: true })
        await router.push(LOGIN_PATH)

        expect(router.currentRoute.value.path).toBe(PRIVATE_PATH)
    })

    it('lets a signed-in person stay on the home', async () => {
        const router = createRouterFor({ isSignedIn: true })
        await router.push(PRIVATE_PATH)

        expect(router.currentRoute.value.path).toBe(PRIVATE_PATH)
    })

    it.each([false, true])('shows the not-found page for an unknown address (signed in: %s)', async (isSignedIn) => {
        const router = createRouterFor({ isSignedIn })
        await router.push('/nowhere/at/all')

        expect(router.currentRoute.value.name).toBe(NOT_FOUND_PATH)
    })
})
