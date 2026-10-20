<script setup lang="ts">
defineSlots<{
    base?(): unknown
    default(): unknown
    overlay?(): unknown
}>()
</script>

<template>
    <div class="grid grid-cols-[minmax(0,1fr)] grid-rows-[minmax(0,1fr)] isolate">
        <div v-if="$slots.base" class="col-start-1 row-start-1 min-h-0 min-w-0 z-0 overflow-hidden" data-layer="base">
            <slot name="base" />
        </div>
        <div class="col-start-1 row-start-1 min-h-0 min-w-0 z-10 overflow-auto" data-layer="content">
            <slot />
        </div>
        <div v-if="$slots.overlay" class="col-start-1 row-start-1 min-h-0 min-w-0 z-20 pointer-events-none" data-layer="overlay">
            <slot name="overlay" />
        </div>
    </div>
</template>

<style scoped src="./layer.css" />
