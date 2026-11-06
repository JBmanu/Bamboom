import { beforeEach, describe, expect, it, vi } from 'vitest'
import { installFocusAfterNavigation, type AfterNavigationHook } from '../../../src/app/router/installFocusAfterNavigation.ts'

const mainArea = () => document.querySelector('main')!
const bodyArea = () => document.querySelector('body')!
const linkInPage = () => document.querySelector<HTMLAnchorElement>('#link')!

/** Stands for the router: keeps the hook it is given, and `navigate` runs it as a finished navigation would. */
function createFakeRouter() {
    const hooks: AfterNavigationHook[] = [] // le funzioni registrate dal modulo
    return {
        afterEach: (hook: AfterNavigationHook) => void hooks.push(hook), // il modulo si registra qui
        navigate: (failure?: unknown) => hooks.forEach((hook) => hook({ fullPath: '/b' }, { fullPath: '/a' }, failure)) // il test simula l'arrivo
    }
}

describe('installFocusAfterNavigation', () => {
    beforeEach(() => {
        document.body.innerHTML = '<main tabindex="-1"><a id="link" href="#">link</a></main>'
    })

    it('leaves the focus alone on the first navigation', () => {
        const router = createFakeRouter()
        installFocusAfterNavigation(router)
        router.navigate()
        expect(document.activeElement).toBe(bodyArea())
    })

    it('moves the focus to the main area from the second navigation on', () => {
        const router = createFakeRouter()
        installFocusAfterNavigation(router)
        router.navigate()
        router.navigate()

        expect(document.activeElement).toBe(mainArea())
    })

    it('moves the focus to the main area when the element that had it is gone', () => {
        const router = createFakeRouter()
        installFocusAfterNavigation(router)
        linkInPage().focus()
        router.navigate()
        linkInPage().remove()
        router.navigate()

        expect(document.activeElement).toBe(mainArea())
    })

    it('moves the focus without scrolling the page', () => {
        const router = createFakeRouter()
        const focus = vi.spyOn(mainArea(), 'focus')
        installFocusAfterNavigation(router)
        router.navigate()
        router.navigate()

        expect(focus).toHaveBeenCalledWith({ preventScroll: true })
    })

    it('ignores a navigation that failed', () => {
        const router = createFakeRouter()
        installFocusAfterNavigation(router)
        router.navigate()
        router.navigate(new Error('failed'))

        expect(document.activeElement).toBe(bodyArea())
    })

    it('does nothing when the page has no main area', () => {
        const router = createFakeRouter()
        installFocusAfterNavigation(router)
        document.body.innerHTML = ''

        expect(() => {
            router.navigate()
            router.navigate()
        }).not.toThrow()
    })
})
