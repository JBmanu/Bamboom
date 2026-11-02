import { defineStore } from 'pinia'
import { ref } from 'vue'

export const SESSION_STORAGE_KEY = 'session'

export const useSessionStore = defineStore(SESSION_STORAGE_KEY, () => {
    const isSignedIn = ref(false)
    return { isSignedIn }
})
