import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import VBanner from '../../src/components/VBanner.vue'
import VSpinner from '../../src/components/VSpinner.vue'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'

enableAutoUnmount(afterEach)

const mountBanner = (options: { props?: Record<string, unknown>; slots?: Record<string, string> } = {}) => mountWithTranslations(VBanner, {}, options)

describe('VBanner', () => {
    it('is an info banner by default', async () => {
        const { wrapper } = await mountBanner()
        expect(wrapper.attributes('data-variant')).toBe('info')
    })

    it('shows its text', async () => {
        const { wrapper } = await mountBanner({ slots: { default: 'Saved' } })
        expect(wrapper.text()).toBe('Saved')
    })

    it.each(['info', 'success', 'error', 'loading'])('exposes the %s variant', async (variant) => {
        const { wrapper } = await mountBanner({ props: { variant } })
        expect(wrapper.attributes('data-variant')).toBe(variant)
    })

    it('announces errors right away', async () => {
        const { wrapper } = await mountBanner({ props: { variant: 'error' } })
        expect(wrapper.attributes('role')).toBe('alert')
    })

    it.each(['info', 'success', 'loading'])('announces the %s variant politely', async (variant) => {
        const { wrapper } = await mountBanner({ props: { variant } })
        expect(wrapper.attributes('role')).toBe('status')
    })

    it.each([
        ['loading', true],
        ['info', false],
        ['success', false],
        ['error', false]
    ])('shows a spinner for %s: %s', async (variant, hasSpinner) => {
        const { wrapper } = await mountBanner({ props: { variant } })
        expect(wrapper.findComponent(VSpinner).exists()).toBe(hasSpinner)
    })

    it.each(['info', 'success', 'error'])('hides the %s icon from assistive technology', async (variant) => {
        const { wrapper } = await mountBanner({ props: { variant } })
        expect(wrapper.get('svg').attributes('aria-hidden')).toBe('true')
    })

    it('passes its own class to the banner', async () => {
        const { wrapper } = await mountBanner({ props: { class: 'wide' } })
        expect(wrapper.classes()).toContain('wide')
    })

    it('does not announce its spinner a second time while loading', async () => {
        const { wrapper } = await mountBanner({ props: { variant: 'loading' }, slots: { default: 'Saving…' } })

        expect(wrapper.text()).toBe('Saving…')
        expect(wrapper.element.querySelectorAll('[role="status"]')).toHaveLength(0)
    })
})
