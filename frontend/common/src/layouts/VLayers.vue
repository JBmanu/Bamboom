<script setup lang="ts">
defineSlots<{
    base?(): unknown
    default(): unknown
    overlay?(): unknown
}>()
</script>

<template>
    <div class="layers">
        <div v-if="$slots.base" class="layer base" data-layer="base"><slot name="base" /></div>
        <div class="layer content" data-layer="content"><slot /></div>
        <div v-if="$slots.overlay" class="layer overlay" data-layer="overlay"><slot name="overlay" /></div>
    </div>
</template>

<style scoped src="./layer.css" />
