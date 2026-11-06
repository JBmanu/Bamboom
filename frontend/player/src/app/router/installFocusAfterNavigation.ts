export type AfterNavigationHook = (to: unknown, from: unknown, failure?: unknown) => void

/** All the module needs from a router: to be told after each navigation. The real router and a stand-in both fit. */
type RouterLike = { afterEach(hook: AfterNavigationHook): unknown }

/**
 * After every navigation but the first, moves the focus to the `<main>` area.
 * Without it, a link that disappears with the old page leaves the focus on the `<body>`:
 * someone using the keyboard or a screen reader would be left with no position in the new page.
 */
export function installFocusAfterNavigation(router: RouterLike): void {
    let isFirstNavigation = true

    router.afterEach((_to, _from, failure) => {
        const wasFirstNavigation = isFirstNavigation
        isFirstNavigation = false
        // A failed navigation (for example a click on the page already open) did not change the page.
        if (failure || wasFirstNavigation) return
        document.querySelector('main')?.focus({ preventScroll: true })
    })
}
