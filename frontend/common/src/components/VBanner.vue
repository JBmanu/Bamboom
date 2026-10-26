<script setup lang="ts">
import { type Component, computed } from 'vue'
import CheckCircleIcon from '~icons/ph/check-circle'
import InfoIcon from '~icons/ph/info'
import WarningCircleIcon from '~icons/ph/warning-circle'
import VIcon from '../icons/VIcon.vue'
import VSpinner from './VSpinner.vue'

type Variant = 'info' | 'success' | 'error' | 'loading'

// One entry per variant: a new variant is one line here and one rule in the CSS.
const VARIANTS: Record<Variant, { role: 'status' | 'alert'; icon?: Component }> = {
    info: { role: 'status', icon: InfoIcon },
    success: { role: 'status', icon: CheckCircleIcon },
    error: { role: 'alert', icon: WarningCircleIcon },
    loading: { role: 'status' }
}

const props = withDefaults(
    defineProps<{
        variant?: Variant
    }>(),
    {
        variant: 'info'
    }
)

defineSlots<{ default(): unknown }>()

const role = computed(() => VARIANTS[props.variant].role)
const icon = computed(() => VARIANTS[props.variant].icon)
</script>

<template>
    <div class="banner" :data-variant="variant" :role="role">
        <VSpinner v-if="variant === 'loading'" decorative class="icon" />
        <VIcon v-else-if="icon" :icon="icon" class="icon" />
        <slot />
    </div>
</template>

<style scoped src="./VBanner.css" />
