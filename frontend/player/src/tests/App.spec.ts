// frontend/web-app/src/__tests__/App.spec.ts

import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import App from '../App.vue'

describe('App', () => {
    it('renders the app title', () => {
        const wrapper = mount(App)
        expect(wrapper.text()).toContain('Bamboom')
    })
})
