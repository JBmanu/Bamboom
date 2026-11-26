import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AuthPageHeader from '../../../src/player-identity/components/AuthPageHeader.vue'
import FlankingLeaves from '../../../src/player-identity/components/FlankingLeaves.vue'

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

    it('given no request for leaves, when the header is shown, then the title has no leaves', () => {
        const wrapper = mount(AuthPageHeader, { props: { title } })

        expect(wrapper.find('img').exists()).toBe(false)
    })

    it('given a request for leaves, when the header is shown, then only the title is between them', () => {
        const wrapper = mount(AuthPageHeader, { props: { title, hasFlankingLeaves: true }, slots: { subtitle } })

        const leaves = wrapper.findComponent(FlankingLeaves)
        expect(leaves.find('h1').text()).toBe(title)
        expect(leaves.find('p').exists()).toBe(false)
    })
})
