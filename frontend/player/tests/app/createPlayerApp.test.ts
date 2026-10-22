import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { beforeEach, describe, expect, it } from 'vitest'
import { createPlayerApp } from '../../src/app/createPlayerApp'

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

    it('mounts and shows the title', async () => {
        const container = document.createElement('div')
        const app = await createPlayerApp()
        app.mount(container)

        expect(container.textContent).toContain('Bamboom')
        app.unmount()
    })
})
