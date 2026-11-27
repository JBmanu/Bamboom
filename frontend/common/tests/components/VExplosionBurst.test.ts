import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import VExplosionBurst from '../../src/components/VExplosionBurst.vue'
import { playExplosion } from '../../src/animations/explosion/playExplosion'

vi.mock(import('../../src/animations/explosion/playExplosion'), async (importOriginal) => {
    const original = await importOriginal()
    return { playExplosion: vi.fn(original.playExplosion) }
})

enableAutoUnmount(afterEach)
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

const mountBurst = (props: { isOnHold?: boolean } = {}) =>
    mount(VExplosionBurst, { props, slots: { default: '<p>logo</p>' }, attachTo: document.body })

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

    it('given the animation library is still loading, when the effect is removed, then no explosion starts or is reported', async () => {
        stubReducedMotion(false)
        const wrapper = mountBurst()

        wrapper.unmount()
        await vi.dynamicImportSettled()

        expect(playExplosion).not.toHaveBeenCalled()
        expect(wrapper.emitted('blastStarted')).toBeUndefined()
        expect(wrapper.emitted('blastFinished')).toBeUndefined()
    })

    it('given a burst on hold, when it appears, then no explosion plays', async () => {
        stubReducedMotion(false)

        const wrapper = mountBurst({ isOnHold: true })
        await vi.dynamicImportSettled()

        expect(wrapper.text()).toBe('logo')
        expect(playExplosion).not.toHaveBeenCalled()
        expect(wrapper.emitted('blastStarted')).toBeUndefined()
    })

    it('given a burst on hold, when the hold is released, then it explodes once', async () => {
        stubReducedMotion(false)
        const wrapper = mountBurst({ isOnHold: true })

        await wrapper.setProps({ isOnHold: false })
        await vi.dynamicImportSettled()

        expect(playExplosion).toHaveBeenCalledOnce()
    })

    it('given a released burst, when the blast starts, then it reports the start before the finish', async () => {
        stubReducedMotion(false)

        const wrapper = mountBurst()

        await vi.waitFor(() => expect(wrapper.emitted('blastStarted')).toHaveLength(1))
        expect(wrapper.emitted('blastFinished')).toBeUndefined()
    })

    it('given a started blast, when it ends, then it reports the finish', async () => {
        stubReducedMotion(false)

        const wrapper = mountBurst()

        await vi.waitFor(() => expect(wrapper.emitted('blastFinished')).toHaveLength(1), { timeout: 3000 })
    })

    it('given reduced motion, when the burst is released, then it still reports start and finish', async () => {
        stubReducedMotion(true)
        const wrapper = mountBurst({ isOnHold: true })

        await wrapper.setProps({ isOnHold: false })

        expect(wrapper.emitted('blastStarted')).toHaveLength(1)
        expect(wrapper.emitted('blastFinished')).toHaveLength(1)
    })

    it('given the explosion fails to play, when the burst is released, then it still reports start and finish', async () => {
        stubReducedMotion(false)
        vi.mocked(playExplosion).mockImplementationOnce(() => {
            throw new Error('animation unavailable')
        })

        const wrapper = mountBurst()
        await vi.dynamicImportSettled()

        expect(wrapper.emitted('blastStarted')).toHaveLength(1)
        expect(wrapper.emitted('blastFinished')).toHaveLength(1)
    })

    it('given an exploded burst, when it is held and released again, then it does not explode again', async () => {
        stubReducedMotion(false)
        const wrapper = mountBurst()
        await vi.dynamicImportSettled()

        await wrapper.setProps({ isOnHold: true })
        await wrapper.setProps({ isOnHold: false })
        await vi.dynamicImportSettled()

        expect(playExplosion).toHaveBeenCalledOnce()
    })
})
