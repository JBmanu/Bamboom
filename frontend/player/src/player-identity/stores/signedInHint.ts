import { runAsResult } from '../errors/exceptionBoundary.ts'

export const SIGNED_IN_HINT_STORAGE_KEY = 'bamboom-player-signed-in-hint'
const HINT_VALUE = 'yes'

// The hint is only a graphic nicety: when the browser refuses storage, the app works the same, so failures are dropped.
const ignoreFailure = () => undefined

export function readSignedInHint(): boolean {
    const result = runAsResult(() => localStorage.getItem(SIGNED_IN_HINT_STORAGE_KEY) === HINT_VALUE, ignoreFailure)
    return result.ok && result.value
}

export function saveSignedInHint(): void {
    runAsResult(() => localStorage.setItem(SIGNED_IN_HINT_STORAGE_KEY, HINT_VALUE), ignoreFailure)
}

export function clearSignedInHint(): void {
    runAsResult(() => localStorage.removeItem(SIGNED_IN_HINT_STORAGE_KEY), ignoreFailure)
}
