import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import VButton from '../../src/components/VButton.vue'

describe('VButton', () => {
    it('defaults to type="button" so it never submits a form by accident', () => {
        const wrapper = mount(VButton, { slots: { default: 'Play' } })
        expect(wrapper.attributes('type')).toBe('button')
    })

    it('lets the caller opt in to type="submit"', () => {
        const wrapper = mount(VButton, { props: { type: 'submit' } })
        expect(wrapper.attributes('type')).toBe('submit')
    })
})
