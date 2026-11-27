import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VExplosionBurst from '../../src/components/VExplosionBurst.vue'
import { playExplosion } from '../../src/animations/explosion/playExplosion'

// The real effect runs: the wrapper only counts how many times it starts.
vi.mock(import('../../src/animations/explosion/playExplosion'), async (importOriginal) => {
    const original = await importOriginal()
    return { playExplosion: vi.fn(original.playExplosion) }
})

enableAutoUnmount(afterEach)
// Braces on purpose: a function returned by the hook would be run as its cleanup.
beforeEach(() => {
    vi.mocked(playExplosion).mockClear()
})
afterEach(() => vi.unstubAllGlobals())

const SPARKS_SELECTOR = '[data-test="sparks"]'

/** jsdom has no `matchMedia`: this one says whether the person asked their system for reduced motion. */
function stubReducedMotion(isReduced: boolean) {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: isReduced && query.includes('prefers-reduced-motion'),
        addEventListener: () => {},
        removeEventListener: () => {}
    }))
}

const mountBurst = () => mount(VExplosionBurst, { slots: { default: '<p>logo</p>' }, attachTo: document.body })

describe('VExplosionBurst', () => {
    it('given motion is welcome, when the content appears, then it is shown at once and explodes once', async () => {
        stubReducedMotion(false)

        const wrapper = mountBurst()

        expect(wrapper.text()).toBe('logo')
        await vi.dynamicImportSettled()
        expect(playExplosion).toHaveBeenCalledOnce()
        expect(wrapper.get(SPARKS_SELECTOR).attributes('aria-hidden')).toBe('true')
    })

    it('given reduced motion, when the content appears, then it stays still with no sparks', async () => {
        stubReducedMotion(true)

        const wrapper = mountBurst()
        await vi.dynamicImportSettled()

        expect(wrapper.text()).toBe('logo')
        expect(wrapper.find(SPARKS_SELECTOR).exists()).toBe(false)
        expect(playExplosion).not.toHaveBeenCalled()
    })

    it('given the animation library is still loading, when the effect is removed, then no explosion starts', async () => {
        stubReducedMotion(false)
        const wrapper = mountBurst()

        wrapper.unmount()
        await vi.dynamicImportSettled()

        expect(playExplosion).not.toHaveBeenCalled()
    })
})
