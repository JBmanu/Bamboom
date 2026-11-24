import { createRouter, type RouterHistory } from 'vue-router'
import { installAuthGuard, installResetFlowGuard, playerIdentityRoutes, type ResetFlowStep } from '../../player-identity'
import { appRoutes, HOME_PATH } from './appRoutes'

type PlayerRouterOptions = {
    history: RouterHistory
    session: { readonly isSignedIn: boolean }
    resetFlow: { readonly step: ResetFlowStep }
    whenSessionRestored: () => Promise<void>
}

export function createPlayerRouter({ history, session, resetFlow, whenSessionRestored }: PlayerRouterOptions) {
    const router = createRouter({ history, routes: [...playerIdentityRoutes, ...appRoutes] })
    installAuthGuard(router, { session, homePath: HOME_PATH, whenSessionRestored })
    installResetFlowGuard(router, { resetFlow })
    return router
}
