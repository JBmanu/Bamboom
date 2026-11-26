<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { AnimatePresence, domAnimation, LazyMotion, m } from 'motion-v'

// The classes of the parent land on the element that is animated, not on the wrapper of the library.
defineOptions({ inheritAttrs: false })

/** `stepName` names what is on screen: when it changes, the old step fades out and only then the new one fades in. */
defineProps<{ stepName: string }>()
defineSlots<{ default(slotProps: { stepName: string }): unknown }>()

const STEP_TRANSITION = { duration: 0.15 }
const ENTERING_STEP = { opacity: 0, y: 8 }
const SHOWN_STEP = { opacity: 1, y: 0 }
const LEAVING_STEP = { opacity: 0, y: -8 }

const isMotionReduced = usePreferredReducedMotion().value === 'reduce'
</script>

<template>
    <div v-if="isMotionReduced" :key="stepName" v-bind="$attrs">
        <slot :step-name="stepName" />
    </div>
    <LazyMotion v-else :features="domAnimation" strict>
        <AnimatePresence mode="wait" :initial="false">
            <m.div :key="stepName" v-bind="$attrs" :initial="ENTERING_STEP" :animate="SHOWN_STEP" :exit="LEAVING_STEP" :transition="STEP_TRANSITION">
                <slot :step-name="stepName" />
            </m.div>
        </AnimatePresence>
    </LazyMotion>
</template>
