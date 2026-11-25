import { vi } from 'vitest'

/** The first visit to a page waits for its images to be encoded: on a cold cache (CI) that takes seconds. */
export const FIRST_LOAD_TIMEOUT = 20_000

/** Waits until `assertion` stops throwing, with enough time for a page that loads for the first time. */
export function waitForPageLoad<Result>(assertion: () => Result | Promise<Result>) {
    return vi.waitFor(assertion, { timeout: FIRST_LOAD_TIMEOUT })
}
