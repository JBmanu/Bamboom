import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import VStepTransition from '../../src/components/VStepTransition.vue'

enableAutoUnmount(afterEach)
afterEach(() => vi.unstubAllGlobals())

const STEP_SELECTOR = '[data-test="step"]'

const readShownSteps = () => [...document.querySelectorAll(STEP_SELECTOR)].map((step) => step.textContent ?? '')

/** jsdom has no `matchMedia`: this one says whether the person asked their system for reduced motion. */
function stubReducedMotion(isReduced: boolean) {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: isReduced && query.includes('prefers-reduced-motion'),
        addEventListener: () => {},
        removeEventListener: () => {}
    }))
}

function mountSteps(stepName: string) {
    return mount(VStepTransition, {
        props: { stepName },
        slots: { default: ({ stepName }: { stepName: string }) => h('p', { 'data-test': 'step' }, stepName) },
        // Test Utils replaces transitions with stubs, and the exit of motion-v is built on Vue's own transition.
        global: { stubs: { transition: false } },
        attachTo: document.body
    })
}

describe('VStepTransition', () => {
    it('given a shown step, when another one comes, then both steps never show together', async () => {
        const wrapper = mountSteps('email')
        const seenStates: string[][] = []
        const observer = new MutationObserver(() => seenStates.push(readShownSteps()))
        observer.observe(document.body, { subtree: true, childList: true, characterData: true })

        await wrapper.setProps({ stepName: 'code' })

        expect(readShownSteps()).toEqual(['email'])
        await vi.waitFor(() => expect(readShownSteps()).toEqual(['code']))
        observer.disconnect()
        expect(seenStates.filter((steps) => steps.length > 1)).toEqual([])
    })

    it('given reduced motion, when another step comes, then it replaces the old one at once', async () => {
        stubReducedMotion(true)
        const wrapper = mountSteps('email')

        await wrapper.setProps({ stepName: 'code' })
        await flushPromises() // one turn of the event loop: far shorter than the animation

        expect(readShownSteps()).toEqual(['code'])
    })
})
