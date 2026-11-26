import { flushPromises } from '@vue/test-utils'
import { expect, vi } from 'vitest'

const SWAPPING_PAGE_SELECTOR = '[class*="-leave-active"], [class*="-enter-active"]'

/**
 * Waits until one access page has replaced the other.
 * The swap has a transition: Vue waits some animation frames before showing the new page, and `flushPromises` does not.
 */
export async function waitForPageSwap() {
    await flushPromises() // lets Vue start the transition, or there would be nothing to wait for yet
    await vi.waitFor(() => expect(document.querySelector(SWAPPING_PAGE_SELECTOR)).toBeNull())
    await flushPromises() // what the new page started when it was mounted
}
