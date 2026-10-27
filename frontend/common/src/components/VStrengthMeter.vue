<script setup lang="ts">
defineProps<{
    level: 0 | 1 | 2 | 3 | 4
    label: string
}>()

const SEGMENT_COUNT = 4
</script>

<template>
    <div class="meter" :data-level="level" role="status">
        <div class="segments" aria-hidden="true">
            <span v-for="segment in SEGMENT_COUNT" :key="segment" class="segment" :data-filled="segment <= level" />
        </div>
        <span class="label">{{ label }}</span>
    </div>
</template>

<style scoped src="./VStrengthMeter.css" />
