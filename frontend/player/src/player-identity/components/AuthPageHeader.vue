<script setup lang="ts">
defineProps<{
    title: string
}>()

defineSlots<{
    subtitle(): unknown
}>()
</script>

<template>
    <header class="text-center">
        <h1 class="text-2xl font-bold">
            {{ title }}
        </h1>
        <p v-if="$slots.subtitle" class="mt-1 text-foreground-muted">
            <slot name="subtitle" />
        </p>
    </header>
</template>
