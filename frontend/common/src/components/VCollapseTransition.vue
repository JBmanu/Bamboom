<script setup lang="ts" generic="Content">
import { usePreferredReducedMotion } from '@vueuse/core'
import { AnimatePresence, domAnimation, LazyMotion, m } from 'motion-v'
import { computed, ref, watch } from 'vue'

const props = defineProps<{
    /** What is shown: a new value replaces the old one, `undefined` shows nothing. */
    content?: Content
}>()

defineSlots<{
    /** How to show the content. Use the content received here: it is the one of the block that is on screen. */
    default(slotProps: { content: NonNullable<Content> }): unknown
}>()

const COLLAPSE_TRANSITION = { duration: 0.2 }
const COLLAPSED = { height: 0, opacity: 0, overflow: 'clip' }
const EXPANDED = { height: 'auto', opacity: 1 }

const contentVersion = ref(0)
const hasFinishedEntering = ref(false)

// A new version is a new element: the old block leaves, and a screen reader announces the new one.
watch(
    () => props.content,
    () => {
        contentVersion.value++
        hasFinishedEntering.value = false
    }
)

// Clipping is needed only while the height changes: afterwards it would cut the focus outlines. Motion would apply
// `overflow` as soon as the animation starts, and did not apply its `transitionEnd`: we release it at the end.
const shownState = computed(() => (hasFinishedEntering.value ? { ...EXPANDED, overflow: 'visible' } : EXPANDED))

function releaseClipAfterEntering(finishedState: unknown) {
    if (finishedState !== COLLAPSED) hasFinishedEntering.value = true
}

// Read once: switching tree while the content is shown would mount it again and lose what was typed in it.
const isMotionReduced = usePreferredReducedMotion().value === 'reduce'
</script>

<template>
    <template v-if="isMotionReduced">
        <div v-if="content !== undefined" :key="contentVersion" class="-mb-(--collapse-gap)">
            <div class="pb-(--collapse-gap)"><slot :content="content!" /></div>
        </div>
    </template>
    <LazyMotion v-else :features="domAnimation" strict>
        <AnimatePresence mode="wait" :initial="false">
            <m.div
                v-if="content !== undefined"
                :key="contentVersion"
                :initial="COLLAPSED"
                :animate="shownState"
                :exit="COLLAPSED"
                :transition="COLLAPSE_TRANSITION"
                class="-mb-(--collapse-gap)"
                @animation-complete="releaseClipAfterEntering"
            >
                <div class="pb-(--collapse-gap)"><slot :content="content!" /></div>
            </m.div>
        </AnimatePresence>
    </LazyMotion>
</template>
