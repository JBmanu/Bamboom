import { createTranslations } from '@bamboom/common'
import { createApp } from 'vue'
import App from './App.vue'

/** Builds the player app with its plugins installed, so `main.ts` only has to mount it. */
export async function createPlayerApp() {
    // One folder per module: src/<module>/vocabulary/<language>.ts. The folder's name becomes the namespace.
    const translations = await createTranslations(import.meta.glob('../*/vocabulary/*.ts'))
    return createApp(App).use(translations)
}
