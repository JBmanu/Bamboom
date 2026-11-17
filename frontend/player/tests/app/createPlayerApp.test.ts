import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPlayerApp } from '../../src/app/createPlayerApp.ts'
import { LOGIN_PATH } from '../../src/player-identity/routePaths.ts'
import { createMemoryHistory } from 'vue-router'

describe('createPlayerApp', () => {
    beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

    it('installs the translations, with the shared vocabulary', async () => {
        const app = await createPlayerApp()

        expect(app.config.globalProperties.$t('common.theme.label')).toBe('Theme')
    })

    it('starts in the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
        const app = await createPlayerApp()

        expect(app.config.globalProperties.$t('common.theme.label')).toBe('Tema')
    })

    it('sends a signed-out visitor to the login once the first page is decided', async () => {
        const app = await createPlayerApp({ history: createMemoryHistory() })
        await app.config.globalProperties.$router.isReady()

        expect(app.config.globalProperties.$router.currentRoute.value.path).toBe(LOGIN_PATH)
    })
})
