import type { Router } from 'vue-router'
import { chooseRedirect } from './chooseRedirect'

type AuthGuardOptions = {
    session: { readonly isSignedIn: boolean }
    homePath: string
    whenSessionRestored: () => Promise<void>
}

/**
 * Applies `chooseRedirect` to every navigation, after the session has been restored.
 */
export function installAuthGuard(router: Router, { session, homePath, whenSessionRestored }: AuthGuardOptions): void {
    router.beforeEach(async (destination) => {
        await whenSessionRestored()
        return chooseRedirect({ access: destination.meta.access, isSignedIn: session.isSignedIn, homePath })
    })
}
