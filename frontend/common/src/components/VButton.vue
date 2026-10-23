<script setup lang="ts">
withDefaults(
    defineProps<{
        variant?: 'primary' | 'ghost'
    }>(),
    {
        variant: 'primary'
    }
)

defineSlots<{
    default(): unknown
    start?(): unknown
    end?(): unknown
}>()
</script>
<template>
    <button type="button" class="button" :data-variant="variant">
        <span v-if="$slots.start" class="icon"><slot name="start" /></span>
        <slot />
        <span v-if="$slots.end" class="icon"><slot name="end" /></span>
    </button>
</template>

<style scoped src="./VButton.css" />
