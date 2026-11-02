import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore } from '../../../src/player-identity/stores/useSessionStore'

describe('useSessionStore', () => {
    beforeEach(() => {
        setActivePinia(createPinia()) // a fresh store for every test
    })

    it('starts signed out', () => {
        expect(useSessionStore().isSignedIn).toBe(false)
    })
})
