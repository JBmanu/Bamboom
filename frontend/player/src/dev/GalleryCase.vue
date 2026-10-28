<script setup lang="ts">
defineProps<{
    label: string
}>()
</script>

<template>
    <figure class="flex w-64 max-w-full flex-col gap-2">
        <slot />
        <figcaption class="text-xs text-foreground-muted">{{ label }}</figcaption>
    </figure>
</template>
