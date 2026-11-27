<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { onBeforeUnmount, onMounted, useTemplateRef } from 'vue'
import { planSparkFlights, type SparkShape } from '../animations/explosion/planSparkFlights'

const props = withDefaults(
    defineProps<{
        /** Where the blast starts, as a percentage of the content width, from the left. */
        blastLeftPercent?: number
        /** Where the blast starts, as a percentage of the content height, from the top. */
        blastTopPercent?: number
    }>(),
    { blastLeftPercent: 50, blastTopPercent: 50 }
)

defineSlots<{
    /** What explodes. It is shown at once, with or without the effect. */
    default(): unknown
}>()

const SPARK_CLASSES: Record<SparkShape, string> = {
    ember: 'size-[0.7em] rounded-full bg-amber-400 ring-2 ring-orange-500',
    leaf: 'h-[0.6em] w-[1.4em] rounded-[100%_0] bg-lime-600'
}
const sparkFlights = planSparkFlights(18)

const isMotionReduced = usePreferredReducedMotion().value === 'reduce'

const contentBox = useTemplateRef<HTMLElement>('contentBox')
const sparkLayer = useTemplateRef<HTMLElement>('sparkLayer')

let isRemoved = false
let stopExplosion: (() => void) | undefined

async function explode(blownElement: HTMLElement, sparkElements: HTMLElement[]) {
    const { playExplosion } = await import('../animations/explosion/playExplosion')
    if (isRemoved) return
    stopExplosion = playExplosion(blownElement, sparkElements, sparkFlights)
}

onMounted(() => {
    if (isMotionReduced) return
    const sparkElements = Array.from(sparkLayer.value!.children) as HTMLElement[]
    explode(contentBox.value!, sparkElements).catch(() => {})
})

onBeforeUnmount(() => {
    isRemoved = true
    stopExplosion?.()
})
</script>

<template>
    <div class="relative">
        <div ref="contentBox"><slot /></div>
        <div
            v-if="!isMotionReduced"
            ref="sparkLayer"
            aria-hidden="true"
            data-test="sparks"
            class="pointer-events-none absolute z-10"
            :style="{ left: `${props.blastLeftPercent}%`, top: `${props.blastTopPercent}%` }"
        >
            <!-- Invisible until the library moves them: if it never arrives, nothing is left on screen. -->
            <span v-for="(flight, index) in sparkFlights" :key="index" class="absolute opacity-0" :class="SPARK_CLASSES[flight.shape]" />
        </div>
    </div>
</template>
