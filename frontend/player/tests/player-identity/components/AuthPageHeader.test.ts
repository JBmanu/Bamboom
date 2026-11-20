import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AuthPageHeader from '../../../src/player-identity/components/AuthPageHeader.vue'

describe('AuthPageHeader', () => {
    const title = 'Welcome back!'
    const subtitle = 'Ready to play?'

    it('shows the title as the heading of the page', () => {
        const wrapper = mount(AuthPageHeader, { props: { title } })
        expect(wrapper.find('h1').text()).toBe(title)
    })

    it('shows the subtitle it is given, under the title', () => {
        const wrapper = mount(AuthPageHeader, {
            props: { title },
            slots: { subtitle }
        })

        expect(wrapper.find('p').text()).toBe(subtitle)
    })

    it('shows no subtitle line when there is none', () => {
        const wrapper = mount(AuthPageHeader, { props: { title } })
        expect(wrapper.find('p').exists()).toBe(false)
    })
})
