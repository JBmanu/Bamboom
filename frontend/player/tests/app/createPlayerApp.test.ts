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

    it('has already sent a signed-out visitor to the login when it is ready', async () => {
        const app = await createPlayerApp({ history: createMemoryHistory() })

        expect(app.config.globalProperties.$router.currentRoute.value.path).toBe(LOGIN_PATH)
    })
})
