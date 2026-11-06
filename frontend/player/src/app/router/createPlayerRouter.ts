import { createRouter, type RouterHistory } from 'vue-router'
import { installAuthGuard, playerIdentityRoutes } from '../../player-identity'
import { appRoutes, HOME_PATH } from './appRoutes'

type PlayerRouterOptions = {
    history: RouterHistory
    session: { readonly isSignedIn: boolean }
    whenSessionRestored: () => Promise<void>
}

export function createPlayerRouter({ history, session, whenSessionRestored }: PlayerRouterOptions) {
    const router = createRouter({ history, routes: [...playerIdentityRoutes, ...appRoutes] })
    installAuthGuard(router, { session, homePath: HOME_PATH, whenSessionRestored })
    return router
}
