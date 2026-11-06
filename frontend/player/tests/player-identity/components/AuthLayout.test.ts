import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AuthLayout from '../../../src/player-identity/components/AuthLayout.vue'

describe('AuthLayout', () => {
    it('shows the given content in the middle layer', () => {
        const wrapper = mount(AuthLayout, { slots: { default: '<p>form</p>' } })

        expect(wrapper.find('[data-layer="content"]').text()).toContain('form')
    })

    it('shows the brand logo first, since it is the first thing seen', () => {
        const wrapper = mount(AuthLayout)
        const logo = wrapper.find('[data-layer="content"] img[alt="Bamboom"]')

        expect(logo.exists()).toBe(true)
        expect(logo.attributes('loading')).toBe('eager')
    })

    it('puts the bamboo under the content and the panda over it, both decorative', () => {
        const wrapper = mount(AuthLayout)

        expect(wrapper.find('[data-layer="base"] img').attributes('alt')).toBe('')
        expect(wrapper.find('[data-layer="overlay"] img').attributes('alt')).toBe('')
    })

    it('shows the footer under the content', () => {
        const wrapper = mount(AuthLayout, { slots: { default: '<p>form</p>', footer: '<p>settings</p>' } })
        const text = wrapper.find('[data-layer="content"]').text()

        expect(text.indexOf('settings')).toBeGreaterThan(text.indexOf('form'))
    })
})
