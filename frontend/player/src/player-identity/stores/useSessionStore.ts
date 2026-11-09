import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import type { Player } from '../api/authService.ts'

export const sessionStatuses = { signedIn: 'signedIn', signedOut: 'signedOut', restoring: 'restoring' } as const
export type SessionStatuses = (typeof sessionStatuses)[keyof typeof sessionStatuses]

export const SESSION_STORE_ID = 'session'

export const useSessionStore = defineStore(SESSION_STORE_ID, () => {
    const status = ref<SessionStatuses>(sessionStatuses.restoring)
    const player = ref<Player>()
    const isSignedIn = computed(() => status.value === sessionStatuses.signedIn)

    function startSession(signedInPlayer: Player) {
        player.value = signedInPlayer
        status.value = sessionStatuses.signedIn
    }

    function endSession() {
        player.value = undefined
        status.value = sessionStatuses.signedOut
    }

    return { status, player, isSignedIn, startSession, endSession }
})
