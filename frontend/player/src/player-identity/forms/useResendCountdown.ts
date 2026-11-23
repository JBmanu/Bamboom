import { useIntervalFn } from '@vueuse/core'
import { computed, type Ref, ref, watch } from 'vue'

const TICK_MS = 1000

/**
 * Counts down to the moment a new code may be requested.
 * It compares with a stored deadline instead of decrementing a counter: a timer that runs late (a background tab) cannot make it drift.
 */
export function useResendCountdown(resendAllowedAt: Readonly<Ref<number>>) {
    const currentTime = ref(Date.now())
    const updateCurrentTime = () => (currentTime.value = Date.now())

    useIntervalFn(updateCurrentTime, TICK_MS)
    // A new deadline must be measured from now, not from the last tick: otherwise a fresh wait of 60 s would show 61 s for a moment.
    watch(resendAllowedAt, updateCurrentTime)

    const secondsLeft = computed(() => Math.max(0, Math.ceil((resendAllowedAt.value - currentTime.value) / TICK_MS)))
    const canResend = computed(() => secondsLeft.value === 0)

    return { secondsLeft, canResend }
}
