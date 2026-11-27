<script setup lang="ts">
import { usePreferredReducedMotion } from '@vueuse/core'
import { onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'
import { planSparkFlights, type SparkShape } from '../animations/explosion/planSparkFlights'

const props = withDefaults(
    defineProps<{
        /** Where the blast starts, as a percentage of the content width, from the left. */
        blastLeftPercent?: number
        /** Where the blast starts, as a percentage of the content height, from the top. */
        blastTopPercent?: number
        /** While `true` the content stays still. The explosion is released when it turns `false`, and happens only once. */
        isOnHold?: boolean
        /** How long the explosion waits after it is released. */
        delaySeconds?: number
        /** How far the sparks fly: 2 is twice the usual distance. Raise it when the content already draws a blast. */
        reachScale?: number
    }>(),
    { blastLeftPercent: 50, blastTopPercent: 50, isOnHold: false, delaySeconds: 0, reachScale: 1 }
)

const emit = defineEmits<{
    /** The blast begins, once `delaySeconds` have passed. Listen to it to overlap another explosion with this one. */
    blastStarted: []
    /** The explosion is over. Listen to it to start another explosion after this one. */
    blastFinished: []
}>()

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
let isReleased = false
let stopExplosion: (() => void) | undefined

/** Without an animation both events are still sent, so a chain of explosions never stalls. */
function reportBlastWithoutAnimation() {
    emit('blastStarted')
    emit('blastFinished')
}

async function explode(blownElement: HTMLElement, sparkElements: HTMLElement[]) {
    const { playExplosion } = await import('../animations/explosion/playExplosion')
    if (isRemoved) return
    stopExplosion = playExplosion(blownElement, sparkElements, sparkFlights, {
        delaySeconds: props.delaySeconds,
        reachScale: props.reachScale,
        onBlastStart: () => emit('blastStarted'),
        onBlastFinish: () => emit('blastFinished')
    })
}

function releaseBlastOnce() {
    if (props.isOnHold || isReleased) return
    isReleased = true
    if (isMotionReduced) {
        reportBlastWithoutAnimation()
        return
    }
    const sparkElements = Array.from(sparkLayer.value!.children) as HTMLElement[]
    explode(contentBox.value!, sparkElements).catch(() => {
        if (!isRemoved) reportBlastWithoutAnimation()
    })
}

onMounted(releaseBlastOnce)
watch(() => props.isOnHold, releaseBlastOnce)

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
            <span v-for="(flight, index) in sparkFlights" :key="index" class="absolute opacity-0" :class="SPARK_CLASSES[flight.shape]" />
        </div>
    </div>
</template>
