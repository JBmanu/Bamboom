import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Player } from '../api/authService.ts'
import { clearSignedInHint, saveSignedInHint } from './signedInHint.ts'

export const sessionStatuses = { signedIn: 'signedIn', signedOut: 'signedOut', restoring: 'restoring' } as const
export type SessionStatus = (typeof sessionStatuses)[keyof typeof sessionStatuses]

export const SESSION_STORE_ID = 'session'

export const useSessionStore = defineStore(SESSION_STORE_ID, () => {
    const status = ref<SessionStatus>(sessionStatuses.restoring)
    const player = ref<Player>()
    const isSignedIn = computed(() => status.value === sessionStatuses.signedIn)

    function startSession(signedInPlayer: Player) {
        player.value = signedInPlayer
        status.value = sessionStatuses.signedIn
        saveSignedInHint()
    }

    /** Signed out, but the hint stays: used when the server could not say whether the person is still signed in. */
    function leaveSignedOutKeepingHint() {
        player.value = undefined
        status.value = sessionStatuses.signedOut
    }

    function endSession() {
        leaveSignedOutKeepingHint()
        clearSignedInHint()
    }

    return { status, player, isSignedIn, startSession, endSession, leaveSignedOutKeepingHint }
})
