import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { useSessionStore, sessionStatuses } from '../../../src/player-identity/stores/useSessionStore.ts'

describe('useSessionStore', () => {
    const ada = { username: 'ada', email: 'ada@example.com' }

    beforeEach(() => {
        setActivePinia(createPinia()) // a fresh store for every test
    })

    it('starts restoring, with nobody signed in yet', () => {
        const session = useSessionStore()

        expect(session.status).toBe(sessionStatuses.restoring)
        expect(session.player).toBeUndefined()
        expect(session.isSignedIn).toBe(false)
    })

    it('knows the player once a session has started', () => {
        const session = useSessionStore()
        session.startSession(ada)

        expect(session.status).toBe(sessionStatuses.signedIn)
        expect(session.player).toEqual(ada)
        expect(session.isSignedIn).toBe(true)
    })

    it('forgets the player once the session has ended', () => {
        const session = useSessionStore()
        session.startSession(ada)
        session.endSession()

        expect(session.status).toBe(sessionStatuses.signedOut)
        expect(session.player).toBeUndefined()
        expect(session.isSignedIn).toBe(false)
    })
})
