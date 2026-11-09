import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { clearSignedInHint, readSignedInHint, saveSignedInHint } from '../../../src/player-identity/stores/signedInHint.ts'

describe('signed-in hint', () => {
    beforeEach(() => clearSignedInHint())
    afterEach(() => vi.unstubAllGlobals())

    it('is absent by default', () => {
        expect(readSignedInHint()).toBe(false)
    })

    it('is present once saved', () => {
        saveSignedInHint()

        expect(readSignedInHint()).toBe(true)
    })

    it('is absent once cleared', () => {
        saveSignedInHint()
        clearSignedInHint()

        expect(readSignedInHint()).toBe(false)
    })

    it('reads as absent when the browser gives no storage', () => {
        saveSignedInHint()
        vi.stubGlobal('localStorage', undefined) // using it now fails on its own: the tests need no `throw`

        expect(readSignedInHint()).toBe(false)
    })

    it('does not fail when saving or clearing without storage', () => {
        vi.stubGlobal('localStorage', undefined)

        expect(() => {
            saveSignedInHint()
            clearSignedInHint()
        }).not.toThrow()
    })
})
