import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h } from 'vue'
import VCollapseTransition from '../../src/components/VCollapseTransition.vue'

enableAutoUnmount(afterEach)
afterEach(() => vi.unstubAllGlobals())

const BLOCK_SELECTOR = '[data-test="block"]'

const readShownBlocks = () => [...document.querySelectorAll(BLOCK_SELECTOR)].map((block) => block.textContent ?? '')

/** jsdom has no `matchMedia`: this one says whether the person asked their system for reduced motion. */
function stubReducedMotion(isReduced: boolean) {
    vi.stubGlobal('matchMedia', (query: string) => ({
        matches: isReduced && query.includes('prefers-reduced-motion'),
        addEventListener: () => {},
        removeEventListener: () => {}
    }))
}

function mountCollapse(content: string) {
    return mount(VCollapseTransition, {
        props: { content },
        slots: { default: ({ content }: { content: unknown }) => h('p', { 'data-test': 'block' }, String(content)) },
        // Test Utils replaces transitions with stubs, and the exit of motion-v is built on Vue's own transition.
        global: { stubs: { transition: false } },
        attachTo: document.body
    })
}

describe('VCollapseTransition', () => {
    it('given shown content, when it changes, then both contents never show together', async () => {
        const wrapper = mountCollapse('first')
        const seenStates: string[][] = []
        const observer = new MutationObserver(() => seenStates.push(readShownBlocks()))
        observer.observe(document.body, { subtree: true, childList: true, characterData: true })

        await wrapper.setProps({ content: 'second' })

        expect(readShownBlocks()).toEqual(['first'])
        await vi.waitFor(() => expect(readShownBlocks()).toEqual(['second']))
        observer.disconnect()
        expect(seenStates.filter((blocks) => blocks.length > 1)).toEqual([])
    })

    it('given reduced motion, when the content is removed, then it leaves at once', async () => {
        stubReducedMotion(true)
        const wrapper = mountCollapse('first')

        await wrapper.setProps({ content: undefined })
        await flushPromises() // one turn of the event loop: far shorter than the animation

        expect(readShownBlocks()).toEqual([])
    })
})
