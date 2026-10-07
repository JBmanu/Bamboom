import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../App.vue'

describe('App', () => {
    it('shows the admin title', () => {
        const wrapper = mount(App)

        expect(wrapper.find('h1').text()).toBe('Bamboom Admin')
    })
})
