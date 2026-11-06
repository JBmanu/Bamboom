import { createTranslations } from '@bamboom/common'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useSessionStore } from '../player-identity'
import { createPlayerRouter } from './router/createPlayerRouter.ts'
import { createWebHistory, type RouterHistory } from 'vue-router'
import { installFocusAfterNavigation } from './router/installFocusAfterNavigation.ts'

type PlayerAppOptions = {
    history?: RouterHistory
}

/** Builds the player app with its plugins installed, so `main.ts` only has to mount it. */
export async function createPlayerApp({ history = createWebHistory() }: PlayerAppOptions = {}) {
    // One folder per module: src/<module>/vocabulary/<language>.ts. The folder's name becomes the namespace.
    // The pattern starts from the root of the app: a relative one drops the folder name of the file it is written in.
    const translations = await createTranslations(import.meta.glob('/src/*/vocabulary/*.ts'))
    const pinia = createPinia()
    const session = useSessionStore(pinia)
    const router = createPlayerRouter({ history, session, whenSessionRestored: () => Promise.resolve() })
    installFocusAfterNavigation(router) // before the router starts, so the first navigation is the one it skips

    const app = createApp(App).use(pinia).use(translations).use(router)
    await router.isReady() // the first page is decided before anything is drawn: no flash of the wrong page
    return app
}
