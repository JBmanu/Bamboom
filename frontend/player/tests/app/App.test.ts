import { createTranslations, LANGUAGE_STORAGE_KEY } from '@bamboom/common'
import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it } from 'vitest'
import App from '../src/App.vue'

describe('App', () => {
    beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

    it('renders the app title', async () => {
        const wrapper = mount(App, { global: { plugins: [await createTranslations()] } })

        expect(wrapper.text()).toContain('Bamboom')
    })
})
