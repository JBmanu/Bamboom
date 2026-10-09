import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { AppButton } from '../index'

describe('AppButton', () => {
    it('defaults to type="button" so it never submits a form by accident', () => {
        const wrapper = mount(AppButton, { slots: { default: 'Play' } })
        expect(wrapper.attributes('type')).toBe('button')
    })

    it('lets the caller opt in to type="submit"', () => {
        const wrapper = mount(AppButton, { props: { type: 'submit' } })
        expect(wrapper.attributes('type')).toBe('submit')
    })
})
