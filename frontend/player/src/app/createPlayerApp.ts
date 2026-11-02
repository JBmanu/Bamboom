import { createTranslations } from '@bamboom/common'
import { createApp } from 'vue'
import App from './App.vue'
import { createPinia } from 'pinia'
import { useSessionStore } from '../player-identity'
import { createPlayerRouter } from './router/createPlayerRouter.ts'
import { createWebHistory, RouterHistory } from 'vue-router'

type PlayerAppOptions = {
    history?: RouterHistory
}

/** Builds the player app with its plugins installed, so `main.ts` only has to mount it. */
export async function createPlayerApp({ history = createWebHistory() }: PlayerAppOptions = {}) {
    // One folder per module: src/<module>/vocabulary/<language>.ts. The folder's name becomes the namespace.
    const translations = await createTranslations(import.meta.glob('../*/vocabulary/*.ts'))
    const pinia = createPinia()
    const session = useSessionStore(pinia)
    // Nothing to restore yet: from the next feature the session comes from the server.
    const router = createPlayerRouter({ history, session, whenSessionRestored: () => Promise.resolve() })

    const app = createApp(App).use(pinia).use(translations).use(router)
    await router.isReady() // the first page is decided before anything is drawn: no flash of the wrong page
    return app
}
