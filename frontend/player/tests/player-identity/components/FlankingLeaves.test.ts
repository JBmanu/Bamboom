import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import FlankingLeaves from '../../../src/player-identity/components/FlankingLeaves.vue'

describe('FlankingLeaves', () => {
    const mountAroundContent = () => mount(FlankingLeaves, { slots: { default: '<h1>Welcome back!</h1>' } })

    it('given some content, when it is shown, then it sits between two leaves', () => {
        const wrapper = mountAroundContent()

        const shownTags = [...wrapper.element.children].map((child) => child.tagName)
        expect(shownTags).toEqual(['PICTURE', 'H1', 'PICTURE'])
    })

    it('given some content, when it is shown, then both leaves are decorative: their alternative text is empty', () => {
        const wrapper = mountAroundContent()

        const alternativeTexts = wrapper.findAll('img').map((leaf) => leaf.attributes('alt'))
        expect(alternativeTexts).toEqual(['', ''])
    })
})
