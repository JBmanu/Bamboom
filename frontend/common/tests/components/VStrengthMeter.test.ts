import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import VStrengthMeter from '../../src/components/VStrengthMeter.vue'

const mountMeter = (props = {}, attrs = {}) => mount(VStrengthMeter, { props: { level: 0, label: '', ...props }, attrs })

describe('VStrengthMeter', () => {
    it('draws four segments', () => {
        const countSegment = 4
        const wrapper = mountMeter()
        expect(wrapper.findAll('[data-filled]')).toHaveLength(countSegment)
    })

    it.each([0, 1, 2, 3, 4])('fills as many segments as its level: %s', (level) => {
        const wrapper = mountMeter({ level: level })
        const filled = wrapper.findAll('[data-filled="true"]')
        const notFilled = wrapper.findAll('[data-filled="false"]')

        expect(filled).toHaveLength(level)
        expect(notFilled).toHaveLength(4 - level)
    })

    it('exposes its level', () => {
        const wrapper = mountMeter({ level: 3 })
        expect(wrapper.attributes('data-level')).toBe('3')
    })

    it('says its level with words', () => {
        const weakLabel = 'Weak'
        const wrapper = mountMeter({ label: weakLabel })
        expect(wrapper.text()).toBe(weakLabel)
    })

    it('announces a change of level politely', () => {
        const wrapper = mountMeter()
        expect(wrapper.attributes('role')).toBe('status')
    })

    it('hides the segments from assistive technology', () => {
        const wrapper = mountMeter()
        const segment = wrapper.get('[data-filled]')
        expect(segment.element.closest('[aria-hidden="true"]')).not.toBeNull()
        expect(wrapper.attributes('aria-hidden')).toBeUndefined()
    })

    it('passes its own class to the meter', () => {
        const wrapper = mountMeter({}, { class: 'wide' })
        expect(wrapper.classes()).toContain('wide')
    })
})
